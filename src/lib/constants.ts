export const unknownError = "An unknown error occurred. Please try again later."

export const redirects = {
  toLogin: "/signin",
  toSignup: "/signup",
  afterLogin: "/admin",
  afterLogout: "/",
  toVerify: "/verify-email",
  afterVerify: "/admin",
} as const
