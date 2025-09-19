export const authorization =  (accessRole) => {
  return (req, res, next) => {
    if (!accessRole.includes(req?.user?.role))
      throw new Error("You are not authorized", { cause: 403 });
    return next();
  };
};
