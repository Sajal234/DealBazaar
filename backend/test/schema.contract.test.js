import test from 'node:test';
import assert from 'node:assert/strict';

const [{ default: Store }, { default: Deal }, { default: StoreRating }] = await Promise.all([
  import('../src/models/Store.js'),
  import('../src/models/Deal.js'),
  import('../src/models/StoreRating.js'),
]);

const hasIndex = (indexes, expectedKeys, expectedOptions = {}) =>
  indexes.some(([keys, options]) => {
    const keysMatch =
      Object.keys(expectedKeys).length === Object.keys(keys).length &&
      Object.entries(expectedKeys).every(([key, value]) => keys[key] === value);

    if (!keysMatch) {
      return false;
    }

    return Object.entries(expectedOptions).every(([key, value]) => options[key] === value);
  });

test('store schema keeps the expected production indexes', () => {
  const indexes = Store.schema.indexes();

  assert.ok(hasIndex(indexes, { ownerId: 1 }, { unique: true }));
  assert.ok(hasIndex(indexes, { status: 1, createdAt: -1 }));
  assert.ok(hasIndex(indexes, { status: 1, city: 1, createdAt: -1 }));
  assert.ok(hasIndex(indexes, { name: 'text' }));
  assert.equal(hasIndex(indexes, { city: 1 }), false);
  assert.equal(hasIndex(indexes, { status: 1 }), false);
});

test('deal schema keeps the archive-aware listing and cleanup indexes', () => {
  const indexes = Deal.schema.indexes();

  assert.ok(hasIndex(indexes, { status: 1, isDeleted: 1, archivedAt: 1 }));
  assert.ok(hasIndex(indexes, { status: 1, expiresAt: 1 }));
  assert.ok(hasIndex(indexes, { cleanupAt: 1 }));
});

test('store rating schema enforces one rating per user per store', () => {
  const indexes = StoreRating.schema.indexes();

  assert.ok(hasIndex(indexes, { storeId: 1, userId: 1 }, { unique: true }));
});
