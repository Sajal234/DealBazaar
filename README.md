# DealBazaar

DealBazaar is a verified local commerce marketplace built for real stores, time-limited offers, and cleaner discovery.

Instead of behaving like a noisy classifieds board, DealBazaar is designed around trust:
- verified store onboarding
- admin-moderated listings
- auto-expiring deals
- public store ratings

The current product supports shoppers, sellers, and admins in one connected flow.

## What DealBazaar Does

### For shoppers
- browse approved local deals
- search and filter by query, city, and store
- open deal details and contact stores directly
- browse verified stores as a directory
- rate stores after signing in
- sign in with email/password or Google

### For sellers
- create an account
- apply for store verification
- resubmit rejected store applications
- create, edit, resubmit, and archive deals
- upload deal images
- manage seller listings from a dedicated workspace

### For admins
- seed the first admin account from the backend
- review pending store applications
- approve or reject deals
- choose live windows for approved deals
- moderate stores and listings from one queue

## Product Principles

DealBazaar is built around a few simple rules:
- real stores only
- listings must be reviewed before going live
- deals should expire automatically instead of lingering forever
- the UI should feel clear, useful, and trustworthy

## Tech Stack

### Frontend
- React
- Vite
- React Router
- TanStack Query
- Lucide React

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Express Validator
- Express Rate Limit
- Cloudinary for images

## Core User Flow

1. A user signs up or uses Google login.
2. A seller applies for store verification.
3. An admin reviews and approves the store.
4. The seller creates a deal.
5. An admin approves the deal with a live window.
6. The deal becomes publicly visible.
7. The deal expires automatically after its approved window.

## Current Feature Set

### Authentication
- email/password signup
- email/password login
- Google login
- current-user session bootstrap
- account password change
- forgot password
- reset password
- role-aware redirects

### Marketplace
- homepage with live deals and verified stores
- public deals catalog
- deal detail pages
- public stores directory
- public store detail pages
- store-scoped browsing
- store ratings

### Seller workspace
- protected seller route
- store application form
- rejected store resubmission
- seller deal creation
- seller deal editing
- seller deal status filters
- seller deal pagination
- archive confirmation
- owner-side deal previews

### Admin workspace
- protected admin route
- store moderation
- deal moderation
- queue pagination
- approval window selection
- confirmation step for moderation actions
- richer moderation context for store owners and deal cards

### Reliability and QA
- app-level error boundary
- auth session sync
- resource not-found states
- route-aware page titles
- backend contract and behavior tests

## Repository Structure

```text
DealBazaar/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   └── utils/
│   └── test/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── features/
│       ├── layout/
│       ├── pages/
│       └── styles/
└── README.md
```

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

#### Backend: `backend/.env`

Copy from [backend/.env.example](/Users/sajal/Study/Projects/DealBazaar/backend/.env.example)

```env
PORT=5050
JWT_EXPIRE=30d
NODE_ENV=development
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### Frontend: `frontend/.env`

Copy from [frontend/.env.example](/Users/sajal/Study/Projects/DealBazaar/frontend/.env.example)

```env
VITE_API_URL=http://localhost:5050
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Running the App

### Start the backend

```bash
cd backend
npm run dev
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Default local URLs:
- frontend: `http://localhost:5173`
- backend: `http://localhost:5050`

## Seed the First Admin

Add these values to `backend/.env` temporarily:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-strong-password
ADMIN_NAME=System Administrator
```

Then run:

```bash
cd backend
npm run seed:admin
```

This script will:
- create the admin if the email does not exist
- or upgrade an existing user with that email to `admin`

## Google Login Setup

DealBazaar supports Google login in the MVP.

You need a Google OAuth web client and these values:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `VITE_GOOGLE_CLIENT_ID`

Important:
- `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` use the same client ID value
- `GOOGLE_CLIENT_SECRET` stays in the backend only
- admin accounts should still sign in with email/password

## Available Scripts

### Backend

```bash
npm run dev
npm start
npm test
npm run seed:admin
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Testing and Verification

### Backend tests

```bash
cd backend
npm test
```

### Frontend production build

```bash
cd frontend
npm run build
```

## Trust and Safety Model

DealBazaar is intentionally opinionated:
- stores must be reviewed before being treated as verified
- deals are moderated before going live
- ratings are tied to signed-in users
- sellers cannot rate their own stores
- deals expire automatically
- admin actions are protected and role-gated

## Notes

- Local `.env` files are not meant to be committed.
- `.env.example` files are committed as setup templates.
- Google login, password recovery, and seller/admin flows are implemented, but they should still be verified in a real running environment after deployment.

## Status

The codebase is in MVP-complete shape:
- frontend build passes
- backend tests pass
- shopper, seller, and admin flows are implemented

The next stage is deployment and live end-to-end verification, not major feature scaffolding.
