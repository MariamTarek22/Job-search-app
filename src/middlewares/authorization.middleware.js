export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    
    if (roles.includes(req.authUser.role)) {
      return next();
    } else {
      return next(
        new Error("You are not authorized to access this resource.", {
          cause: 403,
        })
      );
    }
  };
};
