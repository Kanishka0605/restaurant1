import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dbconnection } from "./database/dbconnection.js";
import { errorMiddleware } from "./error/error.js";
import reservationRoutes from "./routes/reservation.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Load env file relative to backend source directory so the server starts regardless of cwd
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Configure CORS for development. If FRONTEND_URL is set, use that;
// otherwise allow common local dev origins so the browser can reach this API during development.
const allowedLocalOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];
const frontendEnv = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : allowedLocalOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin (curl/postman) or allowed frontend origins
    if (!origin || frontendEnv.indexOf(origin) !== -1) return callback(null, true);
    // Fallback: allow for dev but log a warning
    console.warn('CORS: allowing dev origin', origin);
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Do NOT call dbconnection() here — start the DB connection from server.js
app.use("/api/v1/reservation", reservationRoutes);
// Compatibility: also accept requests sent to /reservation (no /api/v1 prefix)
app.use("/reservation", reservationRoutes);

// Health endpoint should be available before SPA fallback so monitoring can detect app status
app.get('/health', async (req, res) => {
  try {
    // dynamic import to avoid potential circular deps with server.js
    const { isDbConnected } = await import('./database/dbconnection.js');
    return res.status(200).json({ success: true, dbConnected: isDbConnected() });
  } catch (e) {
    return res.status(200).json({ success: true, dbConnected: false });
  }
});

// Serve frontend build if present. This will let you build the frontend (Vite/React)
// and copy the `dist` directory into one of the common locations below.
import fs from 'fs';

// Resolve frontend build paths relative to this backend package directory (not process.cwd())
const possibleBuildPaths = [
  path.join(__dirname, 'frontend', 'dist'),
  path.join(__dirname, 'frontend'),
  path.join(__dirname, '..', 'frontend', 'dist'),
  path.join(__dirname, '..', 'frontend'),
];

let frontendBuildPath = null;
for (const p of possibleBuildPaths) {
  try {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
      frontendBuildPath = p;
      break;
    }
  } catch (e) {
    // ignore permissions or other fs errors and continue
  }
}

if (frontendBuildPath) {
  console.log('Serving frontend from', frontendBuildPath);
  // Serve static assets under / (after API routes so APIs take precedence)
  app.use(express.static(frontendBuildPath));

  // SPA fallback for client-side routing (only for GET requests)
  // Use middleware instead of a route pattern to avoid path-to-regexp errors.
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api/') || req.path.startsWith('/reservation')) return next();
    // Let static middleware serve assets with extensions (e.g., .js, .css, .png)
    const ext = path.extname(req.path);
    if (ext) return next();
  // Prevent browsers from aggressively caching index.html so updated builds are picked up
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  console.log('No frontend build found; not serving static frontend.');
}

// Error middleware should be registered after routes so it can handle route errors
app.use(errorMiddleware);

export default app;