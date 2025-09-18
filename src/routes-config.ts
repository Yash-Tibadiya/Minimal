export const AppRoutes = {
  home: "/",
  login: "/login",
  verifyToken: "/verify-token",
  thankYou: "/thank-you",
  notFound: "/not-found",
};

const ApiRoutes = {
  createPatient: "/api/create-patient",
  loginLink: "/api/login-link",
  generateLoginLink: "/api/generate-login-link",
  verifyTokenApi: "/api/verify-token",
};

export const publicRoutes = [
  ApiRoutes.createPatient,
  AppRoutes.login,
  ApiRoutes.loginLink,
  ApiRoutes.generateLoginLink,
];

export const authRoutes = [AppRoutes.verifyToken, ApiRoutes.verifyTokenApi];

export const loginRoutes = [AppRoutes.login, ApiRoutes.loginLink];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/";
