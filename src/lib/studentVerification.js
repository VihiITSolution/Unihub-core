function hasStudentRole(user) {
  return user?.primaryRole === "student" || user?.roles?.includes("student") === true;
}

function isVerifiedStudent(user) {
  return hasStudentRole(user) && Boolean(
    user?.isStudentEmailVerified || user?.studentProfile?.studentEmailVerifiedAt,
  );
}

function shouldShowStudentVerificationBanner(user) {
  return hasStudentRole(user) && !isVerifiedStudent(user);
}

module.exports = { isVerifiedStudent, shouldShowStudentVerificationBanner };
