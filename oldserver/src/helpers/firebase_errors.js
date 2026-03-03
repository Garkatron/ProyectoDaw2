export function mapFirebaseError(err) {
  const code = err.response?.data?.error?.message;

  switch (code) {
    case "EMAIL_NOT_FOUND":
      return new AppError("User not found", 400, [USER_ERRORS.USER_NOT_FOUND]);
    case "INVALID_PASSWORD":
      return new AppError("Incorrect password", 400, [USER_ERRORS.INCORRECT_PASSWORD]);
    case "USER_DISABLED":
      return new AppError("Account locked", 403, [USER_ERRORS.ACCOUNT_LOCKED]);
    default:
      return new AppError("Internal error", 500, [USER_ERRORS.INTERNAL_ERROR]);
  }
}
