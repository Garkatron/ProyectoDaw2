// ! Here go the constants
export const APP_COMISSION = 10; // ? Temp
const PASSWORD_REGEX = null; // Todo

export const ROLES = {
  ADMIN: "admin",
  CLIENT: "client",
  PROVIDER: "provider"
}


// ! Error codes
export const ERROR_CODES = {

    VALIDATION_ERROR: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data"
    },

    UNAUTHORIZED: {
        code: "UNAUTHORIZED",
        message: "Authentication required"
    },

    FORBIDDEN: {
        code: "FORBIDDEN",
        message: "You do not have permission to perform this action"
    },

    NOT_FOUND: {
        code: "NOT_FOUND",
        message: "Resource not found"
    },

    CONFLICT: {
        code: "CONFLICT",
        message: "Resource conflict"
    },

    BAD_REQUEST: {
        code: "BAD_REQUEST",
        message: "Bad request"
    },

    INTERNAL_ERROR: {
        code: "INTERNAL_ERROR",
        message: "Unexpected server error"
    }
};

export const USER_ERRORS = {
  EMAIL_AND_PASSWORD_NEEDED: {
    code: "EMAIL_AND_PASSWORD_NEEDED",
    message: "Email and password are needed"
  },
    EMAIL_PASSWORD_USERNAME_NEEDED: {
    code: "EMAIL_PASSWORD_USERNAME_NEEDED",
    message: "Email, password and Username are needed"
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User does not exist"
  },

  INCORRECT_PASSWORD: {
    code: "INCORRECT_PASSWORD",
    message: "Password is incorrect"
  },

  WEAK_PASSWORD: {
    code: "WEAK_PASSWORD",
    message: "Password does not meet security requirements"
  },

  EMAIL_ALREADY_USED: {
    code: "EMAIL_ALREADY_USED",
    message: "This email is already registered"
  },

  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    message: "A user with this identifier already exists"
  },

  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    message: "Email format is invalid"
  },

  ACCOUNT_LOCKED: {
    code: "ACCOUNT_LOCKED",
    message: "The account is locked. Please contact support."
  },

  PASSWORD_RESET_REQUIRED: {
    code: "PASSWORD_RESET_REQUIRED",
    message: "Password reset is required before login"
  }
};

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: {
    code: "USER_REGISTERED",
    message: "User registered successfully"
  },
  EMAIL_CONFMIRMED: {
    code: "EMAIL_CONFMIRMED",
    message: "Email verifycated successfully"
  },
  USER_LOGGED_IN: {
    code: "USER_LOGGED_IN",
    message: "User logged in successfully"
  },

  PASSWORD_CHANGED: {
    code: "PASSWORD_CHANGED",
    message: "Password changed successfully"
  },

  PROFILE_UPDATED: {
    code: "PROFILE_UPDATED",
    message: "User profile updated successfully"
  },

  EMAIL_VERIFIED: {
    code: "EMAIL_VERIFIED",
    message: "Email verified successfully"
  },

  LOGOUT_SUCCESS: {
    code: "LOGOUT_SUCCESS",
    message: "User logged out successfully"
  },

  PASSWORD_RESET_EMAIL_SENT: {
    code: "PASSWORD_RESET_EMAIL_SENT",
    message: "Password reset email sent successfully"
  }
};
