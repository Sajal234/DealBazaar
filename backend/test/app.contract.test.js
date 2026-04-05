import test from 'node:test';
import assert from 'node:assert/strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';

const [{ default: app }, { default: authRoutes }, { default: storeRoutes }, { default: dealRoutes }, { default: adminRoutes }] =
  await Promise.all([
    import('../src/app.js'),
    import('../src/routes/auth.routes.js'),
    import('../src/routes/store.routes.js'),
    import('../src/routes/deal.routes.js'),
    import('../src/routes/admin.routes.js'),
  ]);

const listRoutes = (router) =>
  router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) =>
      Object.keys(layer.route.methods)
        .filter((method) => layer.route.methods[method])
        .map((method) => `${method.toUpperCase()} ${layer.route.path}`)
    )
    .sort();

const createMockResponse = () => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return response;
};

test('app mounts every top-level API router prefix', () => {
  const mountedPrefixes = app._router.stack
    .filter((layer) => layer.name === 'router')
    .map((layer) => String(layer.regexp))
    .sort();

  assert.deepEqual(mountedPrefixes, [
    '/^\\/api\\/admin\\/?(?=\\/|$)/i',
    '/^\\/api\\/auth\\/?(?=\\/|$)/i',
    '/^\\/api\\/deals\\/?(?=\\/|$)/i',
    '/^\\/api\\/stores\\/?(?=\\/|$)/i',
  ]);
});

test('health endpoint responds successfully', async () => {
  const healthLayer = app._router.stack.find((layer) => layer.route?.path === '/api/health');
  const response = createMockResponse();

  await healthLayer.route.stack[0].handle({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    success: true,
    message: 'DealBazaar API is running',
  });
});

test('unknown routes return the JSON 404 fallback', async () => {
  const notFoundLayer = [...app._router.stack]
    .reverse()
    .find((layer) => !layer.route && layer.name !== 'router' && layer.handle.length === 3);
  const response = createMockResponse();

  await notFoundLayer.handle({ originalUrl: '/api/does-not-exist', method: 'GET' }, response, () => {});

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Route not found',
  });
});

test('auth router exposes the expected route contract', () => {
  assert.deepEqual(listRoutes(authRoutes), [
    'GET /me',
    'PATCH /password',
    'PATCH /reset-password/:token',
    'POST /forgot-password',
    'POST /login',
    'POST /signup',
  ]);
});

test('store router exposes the expected route contract', () => {
  assert.deepEqual(listRoutes(storeRoutes), [
    'GET /',
    'GET /:id',
    'GET /me',
    'PATCH /me',
    'POST /',
    'POST /:id/ratings',
  ]);
});

test('deal router exposes the expected route contract', () => {
  assert.deepEqual(listRoutes(dealRoutes), [
    'DELETE /:id',
    'GET /',
    'GET /:id',
    'GET /mine',
    'PATCH /:id',
    'PATCH /:id/resubmit',
    'POST /',
    'POST /:id/click',
  ]);
});

test('admin router exposes the expected moderation route contract', () => {
  assert.deepEqual(listRoutes(adminRoutes), [
    'GET /deals/pending',
    'GET /stores/pending',
    'PATCH /deals/:id/status',
    'PATCH /stores/:id/status',
  ]);
});

test('admin router keeps auth and authorization middleware ahead of route handlers', () => {
  const firstRouteIndex = adminRoutes.stack.findIndex((layer) => layer.route);

  assert.equal(firstRouteIndex, 3);
  assert.equal(adminRoutes.stack[0].name, 'protect');
});
