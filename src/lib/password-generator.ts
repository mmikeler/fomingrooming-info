import crypto from "crypto";

const PASSWORD_LENGTH = 12;
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";

const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

export function generateSecurePassword(
  length: number = PASSWORD_LENGTH,
): string {
  // Используем криптографически безопасный генератор случайных чисел
  const randomBytes = crypto.randomBytes(length);

  let password = "";

  // Гарантируем наличие хотя бы одного символа из каждой категории
  password += UPPERCASE[randomBytes[0] % UPPERCASE.length];
  password += LOWERCASE[randomBytes[1] % LOWERCASE.length];
  password += DIGITS[randomBytes[2] % DIGITS.length];
  password += SPECIAL[randomBytes[3] % SPECIAL.length];

  // Заполняем остальную часть пароля
  for (let i = 4; i < length; i++) {
    password += ALL_CHARS[randomBytes[i] % ALL_CHARS.length];
  }

  // Перемешиваем пароль
  const passwordArray = password.split("");
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = randomBytes[i] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}
