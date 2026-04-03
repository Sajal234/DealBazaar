import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const [{ protect, optionalAuth, authorize }, { default: User }] = await Promise.all([
  import('../src/middleware/auth.js'),
  import('../src/models/User.js'),
]);

const { createMockNext, createMockResponse, withPatchedProperties } = await import('../test-support/testUtils.js');

test('protect rejects requests without a bearer token', async () => {
  const req = { headers: {} };
  const res = createMockResponse();
  const next = createMockNext();

  await protect(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Not authorized, no token provided',
  });
  assert.equal(next.called(), false);
});

test('protect rejects invalid bearer tokens', async () => {
  const req = { headers: { authorization: 'Bearer not-a-real-token' } };
  const res = createMockResponse();
  const next = createMockNext();

  await withPatchedProperties(
    [
      {
        target: console,
        key: 'error',
        value: () => {},
      },
    ],
    async () => {
      await protect(req, res, next);
    }
  );

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Not authorized, token failed',
  });
  assert.equal(next.called(), false);
});

test('protect attaches the authenticated user for valid tokens', async () => {
  const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
  const user = { _id: '507f1f77bcf86cd799439011', role: 'user' };
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createMockResponse();
  const next = createMockNext();

  await withPatchedProperties(
    [
      {
        target: User,
        key: 'findById',
        value: () => ({
          select: async () => user,
        }),
      },
    ],
    async () => {
      await protect(req, res, next);
    }
  );

  assert.equal(res.body, undefined);
  assert.equal(next.called(), true);
  assert.equal(req.user, user);
});

test('optionalAuth ignores missing tokens and still continues', async () => {
  const req = { headers: {} };
  const res = createMockResponse();
  const next = createMockNext();

  await optionalAuth(req, res, next);

  assert.equal(next.called(), true);
  assert.equal(req.user, undefined);
  assert.equal(res.body, undefined);
});

test('optionalAuth attaches the authenticated user when a valid token is provided', async () => {
  const token = jwt.sign({ id: '507f1f77bcf86cd799439012' }, process.env.JWT_SECRET);
  const user = { _id: '507f1f77bcf86cd799439012', role: 'user' };
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = createMockResponse();
  const next = createMockNext();

  await withPatchedProperties(
    [
      {
        target: User,
        key: 'findById',
        value: () => ({
          select: async () => user,
        }),
      },
    ],
    async () => {
      await optionalAuth(req, res, next);
    }
  );

  assert.equal(next.called(), true);
  assert.equal(req.user, user);
  assert.equal(res.body, undefined);
});

test('optionalAuth swallows invalid tokens and keeps the request public', async () => {
  const req = { headers: { authorization: 'Bearer not-a-real-token' } };
  const res = createMockResponse();
  const next = createMockNext();

  await optionalAuth(req, res, next);

  assert.equal(next.called(), true);
  assert.equal(req.user, undefined);
  assert.equal(res.body, undefined);
});

test('authorize rejects users without the required role', () => {
  const middleware = authorize('admin');
  const req = { user: { _id: 'user-1', role: 'user' } };
  const res = createMockResponse();
  const next = createMockNext();

  middleware(req, res, next);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: 'Not authorized to access this route',
  });
  assert.equal(next.called(), false);
});
