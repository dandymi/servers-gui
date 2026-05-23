// Mock path module
const path = {
  join: (...args) => {
    const lastArg = args[args.length - 1];
    if (lastArg === 'servers.yml') {
      return '/mocked/servers.yml';
    } else if (lastArg === 'index.html') {
      return '/mocked/index.html';
    } else if (lastArg === 'preload.js') {
      return '/mocked/preload.js';
    }
    // For any other, we just join with '/' and return (but we don't expect other calls in our tests)
    return args.join('/');
  },
  // We don't use other path methods in our code, but let's provide stubs to avoid errors.
  sep: '/',
  delimiter: ':',
};

module.exports = path;