const test = require("node:test");
const assert = require("node:assert/strict");
const { getPromotionActions } = require("./PromotionBannerContent");

test("sends guests to registration before promotion actions", () => {
  assert.deepEqual(getPromotionActions(false), {
    affiliate: "/auth/register",
    marketplace: "/auth/register",
    boarding: "/auth/register",
  });
});

test("sends signed-in users to the affiliate and listing flows", () => {
  assert.deepEqual(getPromotionActions(true), {
    affiliate: "/student/affiliate",
    marketplace: "/vendor/listings/create",
    boarding: "/vendor/boarding/create",
  });
});
