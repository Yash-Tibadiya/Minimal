import nodemailer from "nodemailer";
import { config } from "@/config";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.MAILER_HOST || !config.MAILER_PORT) {
    throw new Error("Mailer not configured. Please set mailer_host and mailer_port in env.");
  }

  transporter = nodemailer.createTransport({
    host: config.MAILER_HOST!,
    port: config.MAILER_PORT!,
    secure: !!config.MAILER_SECURE,
    auth:
      config.MAILER_USER && config.MAILER_PASSWORD
        ? { user: config.MAILER_USER, pass: config.MAILER_PASSWORD }
        : undefined,
  });

  return transporter;
}

export async function sendOtpEmail(email: string, code: string) {
  const t = getTransporter();

  const from =
    config.MAIL_FROM_NAME && config.MAIL_FROM
      ? `${config.MAIL_FROM_NAME} <${config.MAIL_FROM}>`
      : config.MAIL_FROM || "no-reply@example.com";
  const brandName =
    config.MAIL_FROM_NAME ||
    (typeof from === "string" && from.includes("<") ? from.split("<")[0].trim() : "Minimal");

  const subject = `${brandName} Login Code: ${code}`;
  const text = [
    `Your ${brandName} one-time login code is: ${code}`,
    "",
    "This code will expire in 10 minutes.",
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
      <h2 style="margin:0 0 8px 0;">${brandName} Login Code</h2>
      <p style="margin:0 0 12px 0;">Use the following one-time code to sign in:</p>
      <div style="font-size:24px;font-weight:700;letter-spacing:3px;padding:12px 16px;border:1px solid #eee;display:inline-block;border-radius:8px;background:#fafafa;">
        ${code}
      </div>
      <p style="color:#666;margin:16px 0 0 0;">This code expires in 10 minutes.</p>
      <p style="color:#999;margin:8px 0 0 0;font-size:12px;">If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  await t.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
  });
}

/**
 * Utility to generate a 6-digit numeric OTP as a string.
 */
export function generateNumericOtp(length = 6): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}