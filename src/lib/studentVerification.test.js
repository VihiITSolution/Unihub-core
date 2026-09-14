const test = require("node:test");
const assert = require("node:assert/strict");
const { isVerifiedStudent, shouldShowStudentVerificationBanner } = require("./studentVerification");

test("recognises a student with a confirmed university email as verified", () => {
  assert.equal(isVerifiedStudent({
    roles: ["student"],
    studentProfile: { studentEmailVerifiedAt: "2026-09-14T10:30:00.000Z" },
  }), true);
});

test("shows the verification prompt to a student without a confirmed email", () => {
  assert.equal(shouldShowStudentVerificationBanner({
    primaryRole: "student",
    studentProfile: { studentEmailVerifiedAt: null },
  }), true);
});

test("does not show a student verification prompt to a non-student account", () => {
  assert.equal(shouldShowStudentVerificationBanner({
    primaryRole: "vendor",
    roles: ["vendor"],
    studentProfile: { studentEmailVerifiedAt: null },
  }), false);
});
