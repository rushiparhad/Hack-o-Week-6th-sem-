require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./config/db");

const DEFAULT_PORT = 5050;
const MAX_PORT_RETRIES = 10;

const parsePort = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
};

const listenWithRetry = (expressApp, startPort, maxRetries = MAX_PORT_RETRIES) =>
  new Promise((resolve, reject) => {
    let retries = 0;
    let currentPort = startPort;

    const tryListen = () => {
      const server = http.createServer(expressApp);

      server.once("error", (error) => {
        if (error.code === "EADDRINUSE" && retries < maxRetries) {
          retries += 1;
          currentPort += 1;
          console.warn(`Port in use. Retrying on ${currentPort}...`);
          tryListen();
          return;
        }

        reject(error);
      });

      server.once("listening", () => {
        resolve({ server, port: currentPort });
      });

      server.listen(currentPort);
    };

    tryListen();
  });

const startServer = async () => {
  try {
    await connectDB();
    const preferredPort = parsePort(process.env.PORT);
    const { port } = await listenWithRetry(app, preferredPort);

    console.log(`Campus sustainability backend running on http://localhost:${port}`);
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();
