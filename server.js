import app from './app.js';
import dotenv from 'dotenv';
import { dbconnection } from './database/dbconnection.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file relative to this backend module so starting from a different cwd won't break dotenv
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const start = async () => {
  let dbConnected = false;
  try {
    await dbconnection();
    dbConnected = true;
    const { Reservation } = await import('./models/reservationSchema.js');
    try {
      const count = await Reservation.countDocuments();
      console.log(`Reservation documents in DB: ${count}`);
    } catch (e) {
      console.warn('Could not read reservation count for diagnostic:', e.message);
    }
  } catch (err) {
    // If START_WITHOUT_DB is set, continue to start server so frontend can be served while DB is down
    if (process.env.START_WITHOUT_DB === 'true') {
      console.warn('Warning: DB connection failed but START_WITHOUT_DB=true — starting server without DB. Error:', err.message);
      dbConnected = false;
    } else {
      console.error('Failed to start server due to DB connection error:', err.message);
      process.exit(1);
    }
  }

  const PORT = process.env.PORT || 4000;

  // health endpoint reports whether DB connected
  app.get('/health', (req, res) => {
    return res.status(200).json({ success: true, dbConnected });
  });

  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT} (dbConnected=${dbConnected})`);
  });
};

start();