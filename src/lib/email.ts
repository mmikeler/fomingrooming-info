import nodemailer from "nodemailer";
import crypto from "crypto";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    logger.info("Email sent successfully", {
      messageId: info.messageId,
      to,
      subject,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Failed to send email", {
      error: error instanceof Error ? error.message : String(error),
      to,
      subject,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendPasswordResetEmail(to: string, newPassword: string) {
  const subject = "Восстановление пароля - FomingRooming";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Восстановление пароля</h2>
      <p style="color: #666; font-size: 16px;">
        Для вашего аккаунта был сгенерирован новый пароль:
      </p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <code style="font-size: 24px; color: #1890ff; word-break: break-all;">
          ${newPassword}
        </code>
      </div>
      <p style="color: #666; font-size: 14px;">
        Рекомендуем сменить этот пароль в настройках профиля после входа в систему.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        Если вы не запрашивали сброс пароля, пожалуйста, свяжитесь с поддержкой.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Генерирует токен для сброса пароля
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Отправляет email с ссылкой для сброса пароля
 */
export async function sendPasswordResetLinkEmail(to: string, resetUrl: string) {
  const subject = "Сброс пароля - FomingRooming";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Сброс пароля</h2>
      <p style="color: #666; font-size: 16px;">
        Вы запросили сброс пароля на сайте FomingRooming. Нажмите на кнопку ниже, чтобы создать новый пароль:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #1890ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Сбросить пароль
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Ссылка действительна в течение 1 часа.
      </p>
      <p style="color: #666; font-size: 14px;">
        Если вы не запрашивали сброс пароля, просто игнорируйте это письмо.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        Если кнопка не работает, скопируйте ссылку в браузер: ${resetUrl}
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Генерирует токен для верификации email
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Отправляет письмо с ссылкой для подтверждения email
 */
export async function sendVerificationEmail(
  to: string,
  userName: string,
  verificationUrl: string,
) {
  const subject = "Подтверждение email - FomingRooming";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Подтверждение email</h2>
      <p style="color: #666; font-size: 16px;">
        Здравствуйте, ${userName}!
      </p>
      <p style="color: #666; font-size: 16px;">
        Спасибо за регистрацию на сайте FomingRooming. Пожалуйста, подтвердите ваш email, нажав на кнопку ниже:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; background: #1890ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Подтвердить email
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        Ссылка действительна в течение 24 часов.
      </p>
      <p style="color: #666; font-size: 14px;">
        Если вы не регистрировались на сайте, просто игнорируйте это письмо.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        С уважением, команда FomingRooming
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}
