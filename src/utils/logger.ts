import { LoggerOptions } from "pino";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";

const logger: LoggerOptions = {
  level: env.LOG_LEVEL,
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
};

export default logger;