import ErrorHandler from "../error/error.js";
import { Reservation } from "../models/reservationSchema.js";
import { isDbConnected } from "../database/dbconnection.js";
import fs from 'fs/promises';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'reservations.json');

async function ensureStorage() {
    try {
        await fs.mkdir(STORAGE_DIR, { recursive: true });
        try {
            await fs.access(STORAGE_FILE);
        } catch (e) {
            // create file with empty array
            await fs.writeFile(STORAGE_FILE, '[]', 'utf8');
        }
    } catch (e) {
        console.error('Failed to prepare storage file', e);
    }
}

async function readLocalReservations() {
    await ensureStorage();
    const raw = await fs.readFile(STORAGE_FILE, 'utf8');
    try {
        return JSON.parse(raw || '[]');
    } catch (e) {
        console.error('Failed to parse local reservations file, resetting', e);
        await fs.writeFile(STORAGE_FILE, '[]', 'utf8');
        return [];
    }
}

async function writeLocalReservation(res) {
    const arr = await readLocalReservations();
    arr.push(res);
    await fs.writeFile(STORAGE_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

export const sendReservation = async (req, res, next) => {
    // If DB is not connected, return 503 so clients know to retry later
    if (!isDbConnected()) {
        // Use local file fallback to accept reservations when DB is down
        try {
            const { firstName, lastName, email, phone, time, date } = req.body || {};
            if (!req.body || Object.keys(req.body).length === 0) {
                return next(new ErrorHandler("Request body is missing or empty", 400));
            }
            if (!firstName || !lastName || !email || !phone || !time || !date) {
                return next(new ErrorHandler("Please fill all the fields", 400));
            }
            const localRes = {
                firstName, lastName, email, phone, time, date,
                _id: `local-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };
            await writeLocalReservation(localRes);
            return res.status(201).json({ success: true, message: 'Reservation stored locally (DB unavailable)', data: localRes });
        } catch (err) {
            console.error('Local storage failed:', err);
            return next(new ErrorHandler('Database is not available', 503));
        }
    }
    // Guard against missing body (prevents destructuring undefined)
    if (!req.body || Object.keys(req.body).length === 0) {
        return next(new ErrorHandler("Request body is missing or empty", 400));
    }

    const { firstName, lastName, email, phone, time, date } = req.body;

    console.log('POST /api/v1/reservation/send - body:', req.body);

    if (!firstName || !lastName || !email || !phone || !time || !date) {
        return next(new ErrorHandler("Please fill all the fields", 400));
    }

    try {
        const reservation = await Reservation.create({ firstName, lastName, email, phone, time, date });
        console.log('Saved reservation id:', reservation._id);
        // Normalize response: return plain object and ensure _id is a string
        const reservationObj = reservation.toObject ? reservation.toObject() : JSON.parse(JSON.stringify(reservation));
        if (reservationObj._id && reservationObj._id.toString) reservationObj._id = reservationObj._id.toString();

        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            data: reservationObj,
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        if (error.name === "ValidationError") {
            const ValidationErrors = Object.values(error.errors).map((err) => err.message);
            return next(new ErrorHandler(ValidationErrors.join(" , "), 400));
        }
        // forward unexpected errors to central error handler
        return next(error);
    }
};

export const getReservations = async (req, res, next) => {
    try {
        if (!isDbConnected()) {
            const local = await readLocalReservations();
            console.log('GET /api/v1/reservation - returning local count:', local.length);
            return res.status(200).json({ success: true, count: local.length, data: local });
        }
        const reservations = await Reservation.find().sort({ date: 1, time: 1 });
        console.log('GET /api/v1/reservation - returning count:', reservations.length);
        res.status(200).json({ success: true, count: reservations.length, data: reservations });
    } catch (error) {
        return next(error);
    }
};

export const getReservationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findById(id);
        if (!reservation) return next(new ErrorHandler('Reservation not found', 404));
        res.status(200).json({ success: true, data: reservation });
    } catch (error) {
        // If invalid ObjectId, Mongoose throws a CastError; convert to 400
        if (error.name === 'CastError') return next(new ErrorHandler('Invalid reservation id', 400));
        return next(error);
    }
};