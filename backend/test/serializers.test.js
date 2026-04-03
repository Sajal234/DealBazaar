import test from 'node:test';
import assert from 'node:assert/strict';

const { serializeDeal, serializeStore } = await import('../src/utils/serializers.js');

test('serializeStore hides owner-specific fields by default', () => {
  const serialized = serializeStore({
    _id: 'store-1',
    name: 'Alpha Mobiles',
    address: '123 Market Street',
    state: 'karnataka',
    city: 'bengaluru',
    phone: '9999999999',
    status: 'approved',
    isVerified: true,
    rating: 4.7,
    totalRatings: 12,
    ownerId: 'owner-secret',
    createdAt: '2026-04-03T00:00:00.000Z',
    updatedAt: '2026-04-03T00:00:00.000Z',
  });

  assert.equal(serialized.ownerId, undefined);
  assert.equal(serialized.myRating, undefined);
  assert.equal(serialized.name, 'Alpha Mobiles');
  assert.equal(serialized.rating, 4.7);
});

test('serializeStore can opt into owner and viewer-specific fields explicitly', () => {
  const serialized = serializeStore(
    {
      _id: 'store-1',
      name: 'Alpha Mobiles',
      address: '123 Market Street',
      state: 'karnataka',
      city: 'bengaluru',
      phone: '9999999999',
      status: 'approved',
      isVerified: true,
      rating: 4.7,
      totalRatings: 12,
      ownerId: 'owner-secret',
      createdAt: '2026-04-03T00:00:00.000Z',
      updatedAt: '2026-04-03T00:00:00.000Z',
    },
    {
      includeOwnerId: true,
      viewerRating: 5,
    }
  );

  assert.equal(serialized.ownerId, 'owner-secret');
  assert.equal(serialized.myRating, 5);
});

test('serializeDeal strips internal metrics, lifecycle, and asset identifiers by default', () => {
  const serialized = serializeDeal({
    _id: 'deal-1',
    storeId: {
      _id: 'store-1',
      name: 'Alpha Mobiles',
      address: '123 Market Street',
      city: 'bengaluru',
      phone: '9999999999',
      rating: 4.7,
      totalRatings: 12,
      isVerified: true,
      ownerId: 'owner-secret',
    },
    productName: 'Phone',
    description: 'Flagship device',
    price: 49999,
    city: 'bengaluru',
    images: ['https://cdn.example.com/deal.jpg'],
    imagePublicIds: ['cloudinary-secret'],
    status: 'active',
    views: 99,
    clicks: 21,
    expiresAt: '2026-04-05T00:00:00.000Z',
    cleanupAt: '2026-04-06T00:00:00.000Z',
    isDeleted: false,
    createdAt: '2026-04-03T00:00:00.000Z',
    updatedAt: '2026-04-03T00:00:00.000Z',
  });

  assert.equal(serialized.views, undefined);
  assert.equal(serialized.clicks, undefined);
  assert.equal(serialized.cleanupAt, undefined);
  assert.equal(serialized.imagePublicIds, undefined);
  assert.equal(serialized.storeId.ownerId, undefined);
  assert.equal(serialized.storeId.name, 'Alpha Mobiles');
});

test('serializeDeal can explicitly include internal moderation fields when requested', () => {
  const serialized = serializeDeal(
    {
      _id: 'deal-1',
      storeId: 'store-1',
      productName: 'Phone',
      description: 'Flagship device',
      price: 49999,
      city: 'bengaluru',
      images: ['https://cdn.example.com/deal.jpg'],
      imagePublicIds: ['cloudinary-secret'],
      status: 'pending',
      views: 99,
      clicks: 21,
      expiresAt: '2026-04-05T00:00:00.000Z',
      lastVerifiedAt: '2026-04-03T00:00:00.000Z',
      cleanupAt: '2026-04-06T00:00:00.000Z',
      isDeleted: false,
      createdAt: '2026-04-03T00:00:00.000Z',
      updatedAt: '2026-04-03T00:00:00.000Z',
    },
    {
      includeMetrics: true,
      includeLifecycle: true,
      includeImagePublicIds: true,
    }
  );

  assert.equal(serialized.views, 99);
  assert.equal(serialized.clicks, 21);
  assert.equal(serialized.imagePublicIds[0], 'cloudinary-secret');
  assert.equal(serialized.cleanupAt, '2026-04-06T00:00:00.000Z');
  assert.equal(serialized.isDeleted, false);
});
