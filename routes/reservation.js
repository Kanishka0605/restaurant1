import express from "express";
import { sendReservation, getReservations, getReservationById } from "../controller/reservation.js";
import { validateReservation } from "../middleware/validateReservation.js";

const router = express.Router();

router.post("/send", validateReservation, sendReservation);
router.get("/", getReservations);
router.get("/:id", getReservationById);

export default router;