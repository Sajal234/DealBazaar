import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';

const [
  { signup, login, googleAuth },
  { applyForStore, clearStoreRating, submitStoreRating },
  { updateDeal, trackDealClick },
  { updateStoreStatus, updateDealStatus, removeStore, removeDeal },
  { default: User },
  { default: Store },
  { default: StoreRating },
  { default: Deal },
] = await Promise.all([
  import('../src/controllers/auth.controller.js'),
  import('../src/controllers/store.controller.js'),
  import('../src/controllers/deal.controller.js'),
  import('../src/controllers/admin.controller.js'),
  import('../src/models/User.js'),
  import('../src/models/Store.js'),
  import('../src/models/StoreRating.js'),
  import('../src/models/Deal.js'),
]);

const { createMockResponse, withPatchedProperties } = await import('../test-support/testUtils.js');

test('signup blocks role injection during registration', async () => {
  const req = {
    body: {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'pass1234',
      role: 'admin',
    },
  };
  const res = createMockResponse();

  await signup(req, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Role assignment is strictly forbidden during signup',
  });
});

test('login rejects invalid credentials without leaking which field failed', async () => {
  const req = {
    body: {
      email: 'alice@example.com',
      password: 'wrong-password',
    },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: User,
        key: 'findOne',
        value: () => ({
          select: async () => ({
            _id: 'user-1',
            name: 'Alice',
            email: 'alice@example.com',
            role: 'user',
            matchPassword: async () => false,
          }),
        }),
      },
    ],
    async () => {
      await login(req, res);
    }
  );

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Invalid email or password',
  });
});

test('googleAuth blocks administrator accounts from signing in through Google', async () => {
  const req = {
    body: {
      credential: 'google-id-token',
    },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: globalThis,
        key: 'fetch',
        value: async () => ({
          ok: true,
          json: async () => ({
            aud: process.env.GOOGLE_CLIENT_ID || 'test-google-client-id',
            iss: 'https://accounts.google.com',
            email_verified: true,
            email: 'admin@example.com',
            name: 'Admin User',
          }),
        }),
      },
      {
        target: User,
        key: 'findOne',
        value: async () => ({
          _id: 'admin-1',
          role: 'admin',
          email: 'admin@example.com',
        }),
      },
    ],
    async () => {
      process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'test-google-client-id';
      await googleAuth(req, res);
    }
  );

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Administrator accounts must sign in with email and password.',
  });
});

test('applyForStore rejects duplicate store applications for the same owner', async () => {
  const req = {
    user: { _id: 'owner-1' },
    body: {
      name: 'Alpha Mobiles',
      address: '123 Market Street',
      state: 'Karnataka',
      city: 'Bengaluru',
      phone: '9999999999',
    },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOne',
        value: async () => ({ _id: 'store-1' }),
      },
    ],
    async () => {
      await applyForStore(req, res);
    }
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Store already exists for this account',
  });
});

test('submitStoreRating prevents store owners from rating their own store', async () => {
  const req = {
    params: { id: 'store-1' },
    user: { _id: 'owner-1' },
    body: { rating: 5 },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOne',
        value: () => ({
          select: async () => ({
            _id: 'store-1',
            ownerId: {
              toString: () => 'owner-1',
            },
          }),
        }),
      },
    ],
    async () => {
      await submitStoreRating(req, res);
    }
  );

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: 'You cannot rate your own store',
  });
});

test('submitStoreRating upserts the rating and recomputes store aggregates', async () => {
  const req = {
    params: { id: 'store-1' },
    user: { _id: 'user-2' },
    body: { rating: 4 },
  };
  const res = createMockResponse();
  const aggregateCalls = [];
  const storeUpdateCalls = [];
  const ratingUpdateCalls = [];

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOne',
        value: () => ({
          select: async () => ({
            _id: 'store-1',
            ownerId: {
              toString: () => 'owner-1',
            },
          }),
        }),
      },
      {
        target: StoreRating,
        key: 'updateOne',
        value: async (...args) => {
          ratingUpdateCalls.push(args);
          return { upsertedCount: 1 };
        },
      },
      {
        target: StoreRating,
        key: 'aggregate',
        value: async (pipeline) => {
          aggregateCalls.push(pipeline);
          return [{ averageRating: 4.5, totalRatings: 2 }];
        },
      },
      {
        target: Store,
        key: 'updateOne',
        value: async (...args) => {
          storeUpdateCalls.push(args);
          return { acknowledged: true };
        },
      },
    ],
    async () => {
      await submitStoreRating(req, res);
    }
  );

  assert.equal(ratingUpdateCalls.length, 1);
  assert.deepEqual(ratingUpdateCalls[0][0], {
    storeId: 'store-1',
    userId: 'user-2',
  });
  assert.deepEqual(ratingUpdateCalls[0][1], {
    $set: { rating: 4 },
  });
  assert.deepEqual(ratingUpdateCalls[0][2], {
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
  });
  assert.equal(aggregateCalls.length, 1);
  assert.equal(storeUpdateCalls.length, 1);
  assert.deepEqual(storeUpdateCalls[0][1], {
    $set: {
      rating: 4.5,
      totalRatings: 2,
    },
  });
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, {
    success: true,
    message: 'Store rating submitted successfully',
    data: {
      storeId: 'store-1',
      myRating: 4,
      rating: 4.5,
      totalRatings: 2,
    },
  });
});

test('clearStoreRating deletes the viewer rating and recomputes store aggregates', async () => {
  const req = {
    params: { id: 'store-1' },
    user: { _id: 'user-2' },
  };
  const res = createMockResponse();
  const ratingDeleteCalls = [];
  const aggregateCalls = [];
  const storeUpdateCalls = [];

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOne',
        value: () => ({
          select: async () => ({
            _id: 'store-1',
            ownerId: {
              toString: () => 'owner-1',
            },
            rating: 4.5,
            totalRatings: 2,
          }),
        }),
      },
      {
        target: StoreRating,
        key: 'deleteOne',
        value: async (...args) => {
          ratingDeleteCalls.push(args);
          return { deletedCount: 1 };
        },
      },
      {
        target: StoreRating,
        key: 'aggregate',
        value: async (pipeline) => {
          aggregateCalls.push(pipeline);
          return [{ averageRating: 5, totalRatings: 1 }];
        },
      },
      {
        target: Store,
        key: 'updateOne',
        value: async (...args) => {
          storeUpdateCalls.push(args);
          return { acknowledged: true };
        },
      },
    ],
    async () => {
      await clearStoreRating(req, res);
    }
  );

  assert.equal(ratingDeleteCalls.length, 1);
  assert.deepEqual(ratingDeleteCalls[0][0], {
    storeId: 'store-1',
    userId: 'user-2',
  });
  assert.equal(aggregateCalls.length, 1);
  assert.equal(storeUpdateCalls.length, 1);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    message: 'Store rating removed successfully',
    data: {
      storeId: 'store-1',
      myRating: null,
      rating: 5,
      totalRatings: 1,
    },
  });
});

test('updateDeal resets status back to pending and clears lifecycle timers', async () => {
  const req = {
    params: { id: 'deal-1' },
    user: { _id: 'owner-1' },
    body: { price: 9999 },
  };
  const res = createMockResponse();
  const updateCalls = [];

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOne',
        value: async () => ({
          _id: 'store-1',
          status: 'approved',
        }),
      },
      {
        target: Deal,
        key: 'findOne',
        value: async () => ({
          _id: 'deal-1',
          status: 'active',
          storeId: 'store-1',
        }),
      },
      {
        target: Deal,
        key: 'findOneAndUpdate',
        value: async (...args) => {
          updateCalls.push(args);
          return {
            _id: 'deal-1',
            status: 'pending',
            productName: 'Phone',
            description: 'Updated',
            price: 9999,
            city: 'bengaluru',
            images: [],
            views: 0,
            clicks: 0,
            isDeleted: false,
          };
        },
      },
    ],
    async () => {
      await updateDeal(req, res);
    }
  );

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(updateCalls[0][0], { _id: 'deal-1' });
  assert.deepEqual(updateCalls[0][1], {
    $set: {
      price: 9999,
      status: 'pending',
    },
    $unset: {
      expiresAt: 1,
      cleanupAt: 1,
      lastVerifiedAt: 1,
    },
  });
  assert.deepEqual(updateCalls[0][2], { new: true, runValidators: true });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.message, 'Deal updated and sent back for admin review.');
  assert.equal(res.body.data.status, 'pending');
});

test('updateDeal hides deals that do not belong to the authenticated owner store', async () => {
  const req = {
    params: { id: 'deal-foreign' },
    user: { _id: 'owner-1' },
    body: { price: 9999 },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOne',
        value: async () => ({
          _id: 'store-1',
          status: 'approved',
        }),
      },
      {
        target: Deal,
        key: 'findOne',
        value: async () => null,
      },
    ],
    async () => {
      await updateDeal(req, res);
    }
  );

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Deal not found',
  });
});

test('trackDealClick dedupes repeated clicks from the same actor within the cache window', async () => {
  const req = {
    params: { id: 'deal-click-dedupe' },
    ip: '127.0.0.1',
  };
  const firstResponse = createMockResponse();
  const secondResponse = createMockResponse();
  const updateCalls = [];

  await withPatchedProperties(
    [
      {
        target: Deal,
        key: 'updateOne',
        value: async (...args) => {
          updateCalls.push(args);
          return { matchedCount: 1 };
        },
      },
    ],
    async () => {
      await trackDealClick(req, firstResponse);
      await trackDealClick(req, secondResponse);
    }
  );

  assert.equal(updateCalls.length, 1);
  assert.deepEqual(updateCalls[0][0], {
    _id: 'deal-click-dedupe',
    archivedAt: { $eq: null },
    status: 'active',
    isDeleted: false,
  });
  assert.deepEqual(updateCalls[0][1], {
    $inc: { clicks: 1 },
  });
  assert.equal(firstResponse.statusCode, 204);
  assert.equal(firstResponse.ended, true);
  assert.equal(secondResponse.statusCode, 204);
  assert.equal(secondResponse.ended, true);
});

test('updateStoreStatus promotes approved store owners to the store role', async () => {
  const req = {
    params: { id: 'store-1' },
    body: { status: 'approved' },
  };
  const res = createMockResponse();
  const userUpdateCalls = [];

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOneAndUpdate',
        value: async () => ({
          _id: 'store-1',
          ownerId: 'owner-1',
        }),
      },
      {
        target: User,
        key: 'findOneAndUpdate',
        value: async (...args) => {
          userUpdateCalls.push(args);
          return { _id: 'owner-1', role: 'store' };
        },
      },
    ],
    async () => {
      await updateStoreStatus(req, res);
    }
  );

  assert.equal(userUpdateCalls.length, 1);
  assert.deepEqual(userUpdateCalls[0][0], {
    _id: 'owner-1',
    role: { $ne: 'admin' },
  });
  assert.deepEqual(userUpdateCalls[0][1], { role: 'store' });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    message: 'Store successfully marked as approved',
  });
});

test('updateDealStatus rejects already processed deals', async () => {
  const req = {
    params: { id: 'deal-1' },
    body: { status: 'active', hoursValid: 24 },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: Deal,
        key: 'findOneAndUpdate',
        value: async () => null,
      },
    ],
    async () => {
      await updateDealStatus(req, res);
    }
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Deal already processed by another admin or does not exist',
  });
});

test('removeStore demotes an approved seller and pulls down related deals', async () => {
  const req = {
    params: { id: 'store-1' },
  };
  const res = createMockResponse();
  const userUpdateCalls = [];
  const dealUpdateCalls = [];

  await withPatchedProperties(
    [
      {
        target: Store,
        key: 'findOneAndUpdate',
        value: async () => ({
          _id: 'store-1',
          ownerId: 'owner-1',
          status: 'rejected',
          isVerified: false,
        }),
      },
      {
        target: User,
        key: 'findOneAndUpdate',
        value: async (...args) => {
          userUpdateCalls.push(args);
          return { acknowledged: true };
        },
      },
      {
        target: Deal,
        key: 'updateMany',
        value: async (...args) => {
          dealUpdateCalls.push(args);
          return { acknowledged: true };
        },
      },
    ],
    async () => {
      await removeStore(req, res);
    }
  );

  assert.equal(userUpdateCalls.length, 1);
  assert.deepEqual(userUpdateCalls[0][0], {
    _id: 'owner-1',
    role: { $ne: 'admin' },
  });
  assert.deepEqual(userUpdateCalls[0][1], { role: 'user' });
  assert.equal(dealUpdateCalls.length, 1);
  assert.deepEqual(dealUpdateCalls[0][0], {
    storeId: 'store-1',
    isDeleted: false,
    archivedAt: { $eq: null },
  });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    message: 'Store removed from the public marketplace.',
  });
});

test('removeDeal pulls down a live deal from the marketplace', async () => {
  const req = {
    params: { id: 'deal-1' },
  };
  const res = createMockResponse();

  await withPatchedProperties(
    [
      {
        target: Deal,
        key: 'findOneAndUpdate',
        value: async () => ({
          _id: 'deal-1',
          status: 'rejected',
        }),
      },
    ],
    async () => {
      await removeDeal(req, res);
    }
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    success: true,
    message: 'Deal removed from the public marketplace.',
  });
});
