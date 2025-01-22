import pino from "pino";

const loggerPino = pino()

type Log = {
  log: (message: unknown) => void;
  error: (message: unknown) => void;
};

export const logger: Log = {
  log: (message: unknown) => loggerPino.info(message),
  error: (message: unknown) => loggerPino.error(message),
};
