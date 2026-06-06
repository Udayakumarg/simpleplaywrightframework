const PREFIX = "[Framework]";

export const log = {
  info:  (msg: string) => console.log(`${PREFIX} ${msg}`),
  warn:  (msg: string) => console.warn(`${PREFIX} ${msg}`),
  error: (msg: string) => console.error(`${PREFIX} ${msg}`),
  debug: (msg: string) => {
    if (process.env.FRAMEWORK_DEBUG) console.log(`${PREFIX} [debug] ${msg}`);
  },
};

