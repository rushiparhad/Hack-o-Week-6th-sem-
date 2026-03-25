function asyncHandler(fn) {
  return function wrappedAsync(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
