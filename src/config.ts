export const config = {
  currency: "$",
  // Database / URLs
  DATABASE_URL: process.env.DATABASE_URL,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  EHR_URL: process.env.NEXT_PUBLIC_MINIMAL_EHR_URL,
  ehrToken: `${process.env.EHR_AUTH_KEY}`,

  // Auth/session
  AUTH_SECRET: process.env.AUTH_SECRET,

  // Mailer (Mailtrap) - use only mailer_* vars from env
  MAILER_HOST: process.env.mailer_host,
  MAILER_PORT: process.env.mailer_port ? Number(process.env.mailer_port) : undefined,
  MAILER_USER: process.env.mailer_user,
  MAILER_PASSWORD: process.env.mailer_password,
  // Mailtrap on port 2525 typically uses STARTTLS; keep secure=false unless you set a dedicated TLS port
  MAILER_SECURE: false,

  // From header
  MAIL_FROM: process.env.MAIL_FROM || "no-reply@example.com",
  MAIL_FROM_NAME: process.env.MAIL_FROM_NAME || "Minimal",
};
