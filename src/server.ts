import { env } from "./config/env";
import { buildApp } from "./app";

export const startServer = async () => {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Server listening on http://0.0.0.0:${env.PORT}`);
  } catch (error) {
    app.log.error({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

if (require.main === module) {
  // Only auto-start when invoked directly via ts-node or node in production builds
  startServer();
}
