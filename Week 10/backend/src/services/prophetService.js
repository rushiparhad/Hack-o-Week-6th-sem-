const { spawn } = require("child_process");
const path = require("path");

const PYTHON_SCRIPT = path.join(__dirname, "../../../python-ml/forecast_service.py");

const runProphetForecast = (records, options = {}) => {
  const pythonBin = process.env.PYTHON_BIN || "python";

  return new Promise((resolve, reject) => {
    const payload = {
      records,
      horizon: Number(options.horizon || 48),
      loadFactor: Number(options.loadFactor || 1),
    };

    const processRef = spawn(pythonBin, [PYTHON_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    processRef.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    processRef.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on("error", (error) => {
      reject(new Error(`Failed to run Prophet service: ${error.message}`));
    });

    processRef.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Prophet service failed with code ${code}: ${stderr || "Unknown error"}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout || "{}");
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Invalid JSON returned from Prophet service: ${error.message}`));
      }
    });

    processRef.stdin.write(JSON.stringify(payload));
    processRef.stdin.end();
  });
};

module.exports = {
  runProphetForecast,
};
