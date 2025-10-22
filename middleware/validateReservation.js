import Joi from 'joi';
import ErrorHandler from '../error/error.js';

const reservationSchema = Joi.object({
  firstName: Joi.string().min(3).max(30).required(),
  lastName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(15).required(),
  time: Joi.string().required(),
  date: Joi.string().required(),
});

export const validateReservation = (req, res, next) => {
  // Coerce phone numbers sent as numbers (e.g., from inputs with type=number)
  if (req.body && typeof req.body.phone === 'number') {
    req.body.phone = String(req.body.phone);
  }

  const { error } = reservationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
    return next(new ErrorHandler(JSON.stringify(details), 400));
  }
  return next();
};

export default validateReservation;
