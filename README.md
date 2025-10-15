Backend README

This repository contains a backend (in `E:/backend`) and a frontend (in `E:/frontend`).

Running the backend (development):

```powershell
cd E:\backend
# install once
npm install
# make sure config/config.env contains your MONGO_URI and FRONTEND_URL (optional)
node server.js
# or if your package.json provides a script
npm run dev
```

Important env variables:
- MONGO_URI - full connection string to MongoDB (optional for dev, required for production)
- FRONTEND_URL - the frontend origin (optional). If not provided the backend will allow common local dev origins.

CORS and frontend connectivity:
- The backend now responds to preflight OPTIONS requests and allows local dev origins by default.
- To point the frontend at the backend in development, set in a PowerShell terminal:

```powershell
$env:VITE_BACKEND='real'
$env:VITE_API_URL='http://localhost:4000'
cd E:\frontend
npm run dev
```

Dev-server (local mock) is available in `E:\frontend\dev-server` if you prefer not to run the real backend.
