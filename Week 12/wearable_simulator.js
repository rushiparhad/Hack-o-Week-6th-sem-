const WebSocket = require("ws");

const WS_URL = process.env.WS_URL || "ws://localhost:8080";
const EMIT_INTERVAL_MS = 2000;

const MODE_PROFILE = {
  resting: { heart: [60, 78], stepInc: [0, 3], spo2: [97, 100], calInc: [0.2, 0.8] },
  walking: { heart: [80, 102], stepInc: [12, 28], spo2: [96, 99], calInc: [1.0, 2.5] },
  running: { heart: [98, 120], stepInc: [35, 60], spo2: [94, 98], calInc: [2.4, 5.0] },
};

const modeSchedule = ["resting", "walking", "running", "walking"];
let scheduleIndex = 0;
let mode = modeSchedule[scheduleIndex];
let modeTicksRemaining = randomInt(4, 9);

const state = {
  steps: 1200,
  calories: 18,
  activeMinutes: 4,
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function updateMode() {
  modeTicksRemaining -= 1;
  if (modeTicksRemaining > 0) return;

  scheduleIndex = (scheduleIndex + 1) % modeSchedule.length;
  mode = modeSchedule[scheduleIndex];
  modeTicksRemaining = randomInt(5, 11);
}

function generatePayload() {
  updateMode();

  const profile = MODE_PROFILE[mode];
  const heartRate = randomInt(profile.heart[0], profile.heart[1]);
  const stepIncrease = randomInt(profile.stepInc[0], profile.stepInc[1]);
  const spo2 = Number(randomFloat(profile.spo2[0], profile.spo2[1]).toFixed(1));
  const calIncrease = randomFloat(profile.calInc[0], profile.calInc[1]);

  state.steps += stepIncrease;
  state.calories += calIncrease;
  if (mode !== "resting") {
    state.activeMinutes += EMIT_INTERVAL_MS / 60000;
  }

  return {
    timestamp: Date.now(),
    mode,
    heartRate,
    steps: state.steps,
    spo2,
    calories: Number(state.calories.toFixed(1)),
    activeMinutes: Number(state.activeMinutes.toFixed(1)),
  };
}

function connect() {
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    ws.send(JSON.stringify({ type: "register", role: "simulator" }));

    const timer = setInterval(() => {
      const payload = generatePayload();
      ws.send(JSON.stringify({ type: "sensor_data", payload }));
      console.log("[sim]", payload);
    }, EMIT_INTERVAL_MS);

    ws.on("close", () => clearInterval(timer));
  });

  ws.on("close", () => {
    console.log("Simulator disconnected. Reconnecting in 2s...");
    setTimeout(connect, 2000);
  });

  ws.on("error", (err) => {
    console.error("Simulator socket error:", err.message);
  });
}

connect();
