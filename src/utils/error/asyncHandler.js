//handle catching errors of all async functions requests
export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      return next(new Error(error.message));
    }
    //  fn(req, res, next).catch((error) =>
    //    next(new Error(error.message))
    // );
  };
};
