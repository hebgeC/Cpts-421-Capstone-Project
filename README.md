# TRM App

This repository contains two runnable apps:

- `backend` (Node/Express API)
- `frontend` (Expo React Native app)

## Prerequisites

- Node.js and npm installed

## Install Dependencies

From the project root (`TRM_app`):

```bash
npm install
```

If you need to install dependencies inside each app separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

## Run Both Backend and Frontend Together

From `TRM_app`:

```bash
npm start
```

This starts both:

- Backend: `node server.js` (inside `backend`)
- Frontend: `expo start` (inside `frontend`)

## Run Backend Only

Option 1 (from root):

```bash
npm run backend
```

Option 2 (from backend folder):

```bash
cd backend
npm start
```

## Run Frontend Only

Option 1 (from root):

```bash
npm run frontend
```

Option 2 (from frontend folder):

```bash
cd frontend
npm start
```

## Notes

- Backend default port is `3000` (as logged by the server).
- For Expo, use the terminal QR code or on-screen options to launch on a device/emulator.
