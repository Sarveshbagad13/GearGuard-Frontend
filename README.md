# GearGuard Workspace

GearGuard is a full-stack maintenance management system for tracking equipment, maintenance requests, technicians, teams, notifications, and reporting.

This repository is organized as a workspace with two apps:

- `GearGuard-frontend/` - React + Vite client
- `GearGuard-backend/` - Node.js + Express API with MySQL + Sequelize

## What The Project Does

GearGuard supports a typical maintenance workflow:

- public landing page and login/signup flow
- role-based access for `Admin`, `Manager`, `Technician`, and `User`
- equipment registry with ownership and assignment details
- maintenance request lifecycle with Kanban and calendar views
- team and user management
- notifications inside the app, with optional email delivery
- dashboard reporting, exports, and equipment analysis

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS 4, React Router, Recharts
- Backend: Node.js, Express 5, Sequelize 6
- Database: MySQL
- Auth: JWT
- Notifications: Nodemailer + in-app notifications

## Workspace Structure

```text
GearGuard-Frontend/
|-- README.md
|-- GearGuard-frontend/
|   |-- src/
|   |   |-- Pages/
|   |   |-- components/
|   |   |-- services/
|   |   |-- api/
|   |   `-- utils/
|   |-- public/
|   |-- package.json
|   `-- vite.config.js
`-- GearGuard-backend/
    |-- config/
    |-- controllers/
    |-- middleware/
    |-- models/
    |-- routes/
    |-- services/
    |-- utils/
    |-- package.json
    |-- index.js
    |-- seed.js
    `-- .env.example
```

## Important Files To Know

### Root workspace

- [README.md](d:/GearGuard-Frontend/README.md) - main onboarding guide for the whole project
- [.gitignore](d:/GearGuard-Frontend/.gitignore) - repo-wide ignore rules

### Frontend

- [GearGuard-frontend/package.json](d:/GearGuard-Frontend/GearGuard-frontend/package.json) - frontend scripts and dependencies
- [GearGuard-frontend/vite.config.js](d:/GearGuard-Frontend/GearGuard-frontend/vite.config.js) - Vite dev server, port `3000`, and `/api` proxy to the backend
- [GearGuard-frontend/src/main.jsx](d:/GearGuard-Frontend/GearGuard-frontend/src/main.jsx) - React entry point
- [GearGuard-frontend/src/App.jsx](d:/GearGuard-Frontend/GearGuard-frontend/src/App.jsx) - top-level routes and protected-route wiring
- [GearGuard-frontend/src/services/api.js](d:/GearGuard-Frontend/GearGuard-frontend/src/services/api.js) - central API client used by the app
- [GearGuard-frontend/src/api/config.js](d:/GearGuard-Frontend/GearGuard-frontend/src/api/config.js) - deprecated compatibility layer that re-exports the central API service
- [GearGuard-frontend/src/utils/auth.js](d:/GearGuard-Frontend/GearGuard-frontend/src/utils/auth.js) - token and stored-user helpers
- [GearGuard-frontend/src/utils/rolePermissions.js](d:/GearGuard-Frontend/GearGuard-frontend/src/utils/rolePermissions.js) - frontend role/permission checks
- [GearGuard-frontend/src/Pages](d:/GearGuard-Frontend/GearGuard-frontend/src/Pages) - main screens such as dashboard, equipment, requests, teams, users, notifications, reports
- [GearGuard-frontend/src/components](d:/GearGuard-Frontend/GearGuard-frontend/src/components) - landing-page and shared UI components
- [GearGuard-frontend/public/gearguard-logo.png](d:/GearGuard-Frontend/GearGuard-frontend/public/gearguard-logo.png) - primary logo asset
- [GearGuard-frontend/README.md](d:/GearGuard-Frontend/GearGuard-frontend/README.md) - app-specific frontend notes

### Backend

- [GearGuard-backend/package.json](d:/GearGuard-Frontend/GearGuard-backend/package.json) - backend scripts and dependencies
- [GearGuard-backend/index.js](d:/GearGuard-Frontend/GearGuard-backend/index.js) - API bootstrap, middleware, route registration, and health endpoints
- [GearGuard-backend/config/database.js](d:/GearGuard-Frontend/GearGuard-backend/config/database.js) - Sequelize connection and sync behavior
- [GearGuard-backend/models/index.js](d:/GearGuard-Frontend/GearGuard-backend/models/index.js) - model associations
- [GearGuard-backend/models](d:/GearGuard-Frontend/GearGuard-backend/models) - Sequelize models for users, teams, equipment, requests, and notifications
- [GearGuard-backend/controllers](d:/GearGuard-Frontend/GearGuard-backend/controllers) - request handlers for each domain
- [GearGuard-backend/routes](d:/GearGuard-Frontend/GearGuard-backend/routes) - API route definitions and role guards
- [GearGuard-backend/middleware/jwt.js](d:/GearGuard-Frontend/GearGuard-backend/middleware/jwt.js) - token authentication and role authorization
- [GearGuard-backend/services/notificationService.js](d:/GearGuard-Frontend/GearGuard-backend/services/notificationService.js) - in-app and email notification logic
- [GearGuard-backend/seed.js](d:/GearGuard-Frontend/GearGuard-backend/seed.js) - seed script for demo teams, users, equipment, and requests
- [GearGuard-backend/.env.example](d:/GearGuard-Frontend/GearGuard-backend/.env.example) - template for backend environment variables
- [GearGuard-backend/GearGuard-Postman-Collection.json](d:/GearGuard-Frontend/GearGuard-backend/GearGuard-Postman-Collection.json) - ready-to-import API collection
- [GearGuard-backend/JWT-AUTHENTICATION.md](d:/GearGuard-Frontend/GearGuard-backend/JWT-AUTHENTICATION.md) - JWT auth notes
- [GearGuard-backend/PROJECT-STRUCTURE.md](d:/GearGuard-Frontend/GearGuard-backend/PROJECT-STRUCTURE.md) - additional backend structure reference
- [GearGuard-backend/DEPLOYMENT.md](d:/GearGuard-Frontend/GearGuard-backend/DEPLOYMENT.md) - deployment notes
- [GearGuard-backend/render.yaml](d:/GearGuard-Frontend/GearGuard-backend/render.yaml) - Render deployment config
- [GearGuard-backend/README.md](d:/GearGuard-Frontend/GearGuard-backend/README.md) - app-specific backend notes

## Frontend Pages

The main pages currently wired in [GearGuard-frontend/src/App.jsx](d:/GearGuard-Frontend/GearGuard-frontend/src/App.jsx) are:

- `/` - landing page
- `/login` - login/signup page
- `/dashboard` - role-aware dashboard
- `/equipment` - equipment management
- `/requests` - request list and workflow
- `/kanban` - request board
- `/calendar` - request calendar
- `/teams` - teams management
- `/users` - user management
- `/notifications` - notifications inbox
- `/report-snapshot` - reporting view
- `/equipment-analysis` - equipment analysis view

## Backend API Areas

The backend registers these main route groups in [GearGuard-backend/index.js](d:/GearGuard-Frontend/GearGuard-backend/index.js):

- `/api/auth`
- `/api/teams`
- `/api/equipment`
- `/api/maintenance-requests`
- `/api/users`
- `/api/dashboard`
- `/api/notifications`
- `/api/health`

## Roles And Access Model

Frontend permissions are defined in [GearGuard-frontend/src/utils/rolePermissions.js](d:/GearGuard-Frontend/GearGuard-frontend/src/utils/rolePermissions.js).

- `Admin` - full system access
- `Manager` - team oversight, planning, coordination
- `Technician` - work execution and request updates
- `User` - request creation and request follow-up

## Local Setup

### 1. Prerequisites

- Node.js 18+
- npm
- MySQL 8+ or compatible MySQL server

### 2. Install dependencies

Frontend:

```bash
cd GearGuard-frontend
npm install
```

Backend:

```bash
cd GearGuard-backend
npm install
```

### 3. Configure environment

Backend:

```bash
cd GearGuard-backend
copy .env.example .env
```

Update `.env` with your own local values for:

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `FRONTEND_URL`
- SMTP settings if you want email notifications

Frontend:

The frontend can work with the Vite dev proxy and does not require a `.env` for local development if the backend runs on `http://localhost:5000`.

Optional frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

If `VITE_API_URL` is not set, the frontend falls back to `http://localhost:5000/api`.

### 4. Start the backend

```bash
cd GearGuard-backend
npm run dev
```

The API starts on `http://localhost:5000` by default. If that port is busy, the server retries the next ports automatically.

### 5. Start the frontend

```bash
cd GearGuard-frontend
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Database And Seed Data

- Sequelize authenticates and syncs models on server startup
- the backend uses MySQL connection settings from `.env`
- `DB_SYNC_ALTER=true` enables alter-based sync in [GearGuard-backend/config/database.js](d:/GearGuard-Frontend/GearGuard-backend/config/database.js)
- seed data is loaded with:

```bash
cd GearGuard-backend
npm run seed
```

The seed script creates:

- 3 teams
- 4 users
- 4 equipment records
- 4 maintenance requests

Default seeded password:

```text
Password@123
```

Example seeded user emails from [GearGuard-backend/seed.js](d:/GearGuard-Frontend/GearGuard-backend/seed.js):

- `john@example.com`
- `jane@example.com`
- `mike@example.com`
- `sarah@example.com`

## Scripts

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

### Backend

- `npm run dev` - start API with nodemon
- `npm start` - start API with Node
- `npm run seed` - seed the database

## Notes For Contributors

- The frontend uses [GearGuard-frontend/src/services/api.js](d:/GearGuard-Frontend/GearGuard-frontend/src/services/api.js) as the main API layer. New requests should go there instead of the deprecated `src/api/config.js`.
- Backend protected routes rely on JWT middleware in [GearGuard-backend/middleware/jwt.js](d:/GearGuard-Frontend/GearGuard-backend/middleware/jwt.js).
- Notifications are always stored in-app, and email delivery is optional based on SMTP configuration.
- The backend includes extra docs for auth, project structure, deployment, and Postman testing in the backend folder.

## Security Reminder

- Do not commit real `.env` secrets to source control
- rotate any credentials that were previously committed
- prefer `.env.example` as the shared template

