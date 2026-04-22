# GearGuard

Full-stack maintenance management app with:
- React + Vite frontend
- Node.js + Express backend
- MySQL + Sequelize

## Frontend Folder

This folder contains only the frontend app.

## Run Locally

### Frontend

From `GearGuard-frontend/`:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

This folder's `.env` should contain:

```env
VITE_API_URL=/api
```

## Notes

- Vite proxies `/api` requests to the backend in development.
- The backend should be started separately from `../GearGuard-backend/`.

## Main Docs

- `../GearGuard-backend/README.md`
