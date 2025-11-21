// Load environment variables FIRST - must be before any other imports
import "./env";

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./lib/logger";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      const status = (err as { status?: number; statusCode?: number }).status || 
                     (err as { status?: number; statusCode?: number }).statusCode || 
                     500;
      const message = err instanceof Error ? err.message : "Internal Server Error";

      // Log error for debugging
      log(`Error: ${message} (Status: ${status})`);
      
      res.status(status).json({ message });
    });

    // Serve the app on the port specified in the environment variable PORT
    // Defaults to 3000 if not specified
    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();
