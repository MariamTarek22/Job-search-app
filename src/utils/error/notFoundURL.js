export const notFoundURL = (req, res, next) => {
  return next(new Error("invalid url", { cause: 404 }));
};
