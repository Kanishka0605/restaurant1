import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { Reservation } from '../models/reservationSchema.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Reservation.deleteMany({});
});

describe('Reservation API', () => {
  test('POST /api/v1/reservation/send - happy path', async () => {
    const payload = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      time: '18:00',
      date: '2025-10-25',
    };

    const res = await request(app).post('/api/v1/reservation/send').send(payload).set('Accept', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    const db = await Reservation.findOne({ email: 'test@example.com' });
    expect(db).not.toBeNull();
    expect(db.firstName).toBe('Test');
  });

  test('POST /api/v1/reservation/send - missing fields', async () => {
    const res = await request(app).post('/api/v1/reservation/send').send({ firstName: 'OnlyFirst' }).set('Accept', 'application/json');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/v1/reservation - list and GET by id', async () => {
  const r1 = await Reservation.create({ firstName: 'Abc', lastName: 'Bcd', email: 'a@b.com', phone: '1111111111', time: '10:00', date: '2025-10-10' });
  const r2 = await Reservation.create({ firstName: 'Cde', lastName: 'Def', email: 'c@d.com', phone: '2222222222', time: '11:00', date: '2025-10-11' });

    const listRes = await request(app).get('/api/v1/reservation/');
    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('count', 2);

    const getRes = await request(app).get(`/api/v1/reservation/${r1._id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('data');
    expect(getRes.body.data.email).toBe('a@b.com');
  });
});
