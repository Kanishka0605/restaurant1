const data = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890', time: '19:00', date: '2025-10-20' };

try {
  const res = await fetch('http://localhost:4000/reservation/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.text();
  console.log('Status', res.status);
  console.log('Body:', body);
} catch (err) {
  console.error('Request failed', err.message);
  process.exit(1);
}
