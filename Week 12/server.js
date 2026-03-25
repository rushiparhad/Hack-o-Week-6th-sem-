const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");
const RollingDataBuffer = require("./dataBuffer");

const PORT = process.env.PORT || 8080;
const buffer = new RollingDataBuffer(60);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function serveStatic(req, res) {
  const cleanPath = req.url === "/" ? "/dashboard.html" : req.url;
  const requestedPath = path
    .normalize(cleanPath)
    .replace(/^(\.\.(\/|\\|$))+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = path.join(process.cwd(), requestedPath);

  if (!filePath.startsWith(process.cwd())) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}

const server = http.createServer(serveStatic);
const wss = new WebSocketServer({ server });

function broadcast(message, excludeSocket = null) {
  const encoded = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client !== excludeSocket && client.readyState === 1) {
      client.send(encoded);
    }
  }
}

wss.on("connection", (ws) => {
  ws.meta = { role: "dashboard" };

  ws.send(
    JSON.stringify({
      type: "history",
      payload: buffer.snapshot(),
    })
  );

  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (message.type === "register" && message.role) {
      ws.meta.role = message.role;
      ws.send(
        JSON.stringify({
          type: "registered",
          role: ws.meta.role,
          timestamp: Date.now(),
        })
      );
      return;
    }

    if (message.type === "sensor_data" && message.payload) {
      const payload = {
        timestamp: message.payload.timestamp || Date.now(),
        mode: message.payload.mode || "resting",
        heartRate: Number(message.payload.heartRate),
        steps: Number(message.payload.steps),
        spo2: Number(message.payload.spo2),
        calories: Number(message.payload.calories),
        activeMinutes: Number(message.payload.activeMinutes),
      };

      if (
        Number.isNaN(payload.heartRate) ||
        Number.isNaN(payload.steps) ||
        Number.isNaN(payload.spo2) ||
        Number.isNaN(payload.calories) ||
        Number.isNaN(payload.activeMinutes)
      ) {
        return;
      }

      buffer.add(payload);
      broadcast({ type: "sensor_data", payload }, ws);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Dashboard server listening on http://localhost:${PORT}`);
});
