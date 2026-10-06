const assert = require('assert');
const { authMiddleware } = require('../src/middleware/auth');

for (const authorization of [undefined, 'Basic abc', 'Bearer ']) {
  let statusCode;
  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  };

  authMiddleware({ headers: { authorization } }, response, () => {
    assert.fail('Unauthenticated request reached the protected handler');
  });

  assert.strictEqual(statusCode, 401);
}

console.log('auth middleware test passed');