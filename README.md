# ShramSethu 🛠️
**Turning Every Gig into a Better Future**

A production-ready full-stack fintech platform empowering India's gig workers with financial identity, digital reputation, and government welfare access.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT
- **Payments**: Razorpay
- **Storage**: Cloudinary
- **Maps**: Google Maps API

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in .env values
npx prisma migrate dev
npx prisma db seed
npm run dev