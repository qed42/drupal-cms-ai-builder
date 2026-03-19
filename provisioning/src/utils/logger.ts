import winston from "winston";

export function createLogger(siteId: string): winston.Logger {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { siteId },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, step }) => {
            const stepTag = step ? `[${step}]` : "";
            return `${timestamp} ${level} ${stepTag} ${message}`;
          })
        ),
      }),
    ],
  });
}
