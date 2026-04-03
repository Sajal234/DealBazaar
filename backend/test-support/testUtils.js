export const createMockResponse = () => ({
  statusCode: 200,
  body: undefined,
  ended: false,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  end() {
    this.ended = true;
    return this;
  },
});

export const createMockNext = () => {
  const calls = [];

  const next = (...args) => {
    calls.push(args);
  };

  next.called = () => calls.length > 0;
  next.calls = calls;

  return next;
};

export const withPatchedProperties = async (patches, callback) => {
  const originals = patches.map(({ target, key }) => ({
    target,
    key,
    value: target[key],
  }));

  try {
    for (const { target, key, value } of patches) {
      target[key] = value;
    }

    return await callback();
  } finally {
    for (const { target, key, value } of originals.reverse()) {
      target[key] = value;
    }
  }
};
