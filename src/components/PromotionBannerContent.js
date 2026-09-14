function getPromotionActions(isAuthenticated) {
  if (!isAuthenticated) {
    return {
      affiliate: "/auth/register",
      marketplace: "/auth/register",
      boarding: "/auth/register",
    };
  }

  return {
    affiliate: "/student/affiliate",
    marketplace: "/vendor/listings/create",
    boarding: "/vendor/boarding/create",
  };
}

module.exports = { getPromotionActions };
