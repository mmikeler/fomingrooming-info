import winston from "winston";
import path from "path";

const logDir = process.env.LOG_DIR || "logs";

// Формат для консоли в development режиме
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  }),
);

// Формат для файлов
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: fileFormat,
  defaultMeta: { service: "fomingrooming-info" },
  transports: [
    // Файл для ошибок
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Общий файл логов
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// В development режиме добавляем красивый вывод в консоль
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

// Экспортируем типы для удобства
export type LogLevel =
  | "error"
  | "warn"
  | "info"
  | "http"
  | "verbose"
  | "debug"
  | "silly";

// Хелпер для логирования HTTP запросов
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string,
) {
  const logData = {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    ...(userId && { userId }),
  };

  if (statusCode >= 400) {
    logger.warn("HTTP Request completed with error", logData);
  } else {
    logger.http("HTTP Request completed", logData);
  }
}

// Хелпер для логирования ошибок API
export function logApiError(
  context: string,
  error: unknown,
  metadata?: Record<string, unknown>,
) {
  const errorObj = error instanceof Error ? error : new Error(String(error));

  logger.error(`API Error: ${context}`, {
    error: errorObj.message,
    stack: errorObj.stack,
    ...metadata,
  });
}
