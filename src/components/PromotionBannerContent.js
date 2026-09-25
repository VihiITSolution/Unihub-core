function getPromotionActions(isAuthenticated, isVendor = false) {
  if (!isAuthenticated) {
    return {
      affiliate: "/auth/register",
      affiliateVendor: "/auth/register",
      marketplace: "/auth/register",
      boarding: "/auth/register",
      tutor: "/auth/register",
    };
  }

  return {
    affiliate: "/student/affiliate",
    affiliateVendor: isVendor ? "/vendor/affiliate" : "/student/affiliate",
    marketplace: "/vendor/listings/create",
    boarding: "/vendor/boarding/create",
    tutor: "/student/become-tutor",
  };
}

module.exports = { getPromotionActions };
