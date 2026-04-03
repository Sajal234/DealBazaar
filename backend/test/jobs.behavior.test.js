import test from 'node:test';
import assert from 'node:assert/strict';

process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';

const [
  { default: cron },
  { default: Deal },
  { default: expireDealsJob },
  { default: cleanupImagesJob },
  { default: cloudinary },
] = await Promise.all([
  import('node-cron'),
  import('../src/models/Deal.js'),
  import('../src/jobs/expireDeals.js'),
  import('../src/jobs/cleanupImages.js'),
  import('../src/config/cloudinary.js'),
]);

const { withPatchedProperties } = await import('../test-support/testUtils.js');

test('expireDealsJob schedules the hourly sweep and queues expired deals for cleanup', async () => {
  const captured = {};
  const bulkWriteCalls = [];

  await withPatchedProperties(
    [
      {
        target: cron,
        key: 'schedule',
        value: (expression, handler) => {
          captured.expression = expression;
          captured.handler = handler;
          return { stop() {} };
        },
      },
      {
        target: Deal,
        key: 'find',
        value: async (query) => {
          captured.query = query;
          return [{ _id: 'deal-1' }, { _id: 'deal-2' }];
        },
      },
      {
        target: Deal,
        key: 'bulkWrite',
        value: async (ops) => {
          bulkWriteCalls.push(ops);
          return { modifiedCount: ops.length };
        },
      },
      {
        target: console,
        key: 'log',
        value: () => {},
      },
      {
        target: console,
        key: 'error',
        value: () => {},
      },
    ],
    async () => {
      expireDealsJob();
      await captured.handler();
    }
  );

  assert.equal(captured.expression, '0 * * * *');
  assert.equal(captured.query.status, 'active');
  assert.ok(captured.query.expiresAt.$lt instanceof Date);
  assert.equal(bulkWriteCalls.length, 1);
  assert.equal(bulkWriteCalls[0].length, 2);
  assert.equal(bulkWriteCalls[0][0].updateOne.update.$set.status, 'expired');
  assert.ok(bulkWriteCalls[0][0].updateOne.update.$set.cleanupAt instanceof Date);
  assert.deepEqual(bulkWriteCalls[0][0].updateOne.update.$unset, {
    expiresAt: 1,
    lastVerifiedAt: 1,
  });
});

test('cleanupImagesJob retries failed asset deletions and fully deletes successful deals', async () => {
  const captured = {};
  const bulkWriteCalls = [];

  const dealsToClean = [
    {
      _id: {
        toString: () => 'deal-1',
      },
      imagePublicIds: ['good-1', 'bad-1'],
      images: ['https://cdn.example.com/good-1.jpg', 'https://cdn.example.com/bad-1.jpg'],
    },
    {
      _id: {
        toString: () => 'deal-2',
      },
      imagePublicIds: ['good-2'],
      images: ['https://cdn.example.com/good-2.jpg'],
    },
  ];

  await withPatchedProperties(
    [
      {
        target: cron,
        key: 'schedule',
        value: (expression, handler) => {
          captured.expression = expression;
          captured.handler = handler;
          return { stop() {} };
        },
      },
      {
        target: Deal,
        key: 'find',
        value: (query) => {
          captured.query = query;
          return {
            select: async () => dealsToClean,
          };
        },
      },
      {
        target: Deal,
        key: 'bulkWrite',
        value: async (ops) => {
          bulkWriteCalls.push(ops);
          return { modifiedCount: ops.length };
        },
      },
      {
        target: cloudinary.uploader,
        key: 'destroy',
        value: async (publicId) => {
          if (publicId === 'bad-1') {
            throw new Error('temporary Cloudinary failure');
          }

          return { result: 'ok' };
        },
      },
      {
        target: console,
        key: 'log',
        value: () => {},
      },
      {
        target: console,
        key: 'error',
        value: () => {},
      },
    ],
    async () => {
      cleanupImagesJob();
      await captured.handler();
    }
  );

  assert.equal(captured.expression, '0 3 * * *');
  assert.ok(captured.query.cleanupAt.$lt instanceof Date);
  assert.equal(captured.query.isDeleted, false);
  assert.deepEqual(captured.query.$or, [
    { status: { $in: ['expired', 'rejected'] } },
    { archivedAt: { $ne: null } },
  ]);

  assert.equal(bulkWriteCalls.length, 1);
  assert.equal(bulkWriteCalls[0].length, 2);
  assert.deepEqual(bulkWriteCalls[0][0].updateOne.update.$set.images, [
    'https://cdn.example.com/bad-1.jpg',
  ]);
  assert.deepEqual(bulkWriteCalls[0][0].updateOne.update.$set.imagePublicIds, ['bad-1']);
  assert.ok(bulkWriteCalls[0][0].updateOne.update.$set.cleanupAt instanceof Date);
  assert.deepEqual(bulkWriteCalls[0][1].updateOne.update.$set, {
    isDeleted: true,
    images: [],
    imagePublicIds: [],
  });
  assert.deepEqual(bulkWriteCalls[0][1].updateOne.update.$unset, { cleanupAt: 1 });
});
