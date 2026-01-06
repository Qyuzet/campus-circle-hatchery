# CampusCircle

CampusCircle is an all-in-one campus platform designed for Binus University students. It combines a marketplace for study materials, food ordering, event management, student clubs, tutoring services, and an AI-powered notes system into a single trusted platform.

## Features

### Student Marketplace

- Buy and sell study materials including notes, assignments, and guides
- Support for digital files (PDF, Word, etc.) with automatic thumbnail generation
- AI-powered metadata extraction for uploaded documents
- Wishlist functionality for tracking items
- Rating and review system for sellers

### Food Ordering

- Order food from campus vendors
- Real-time order status tracking
- Pickup time scheduling
- Vendor dashboard for managing orders

### Student Clubs

- Browse and join university clubs
- Club management dashboard for organizers
- Member management with join requests
- Club events and announcements

### Events

- Discover campus events
- Event registration and participation tracking
- Event reviews and ratings
- Organizer dashboard for managing events

### Tutoring Services

- Find tutors for specific subjects
- Schedule tutoring sessions
- Rate and review tutoring experiences
- Tutor profiles with expertise areas

### Real-time Messaging

- Direct messaging between students
- Group chat for study groups and clubs
- Real-time notifications via Pusher
- Message read receipts

### My AI (AI Notes)

- Create and organize notes with a block-based editor
- AI-powered content generation and writing assistance
- Support for tables, flowcharts (Mermaid), code blocks, and more
- AI autofill from uploaded documents
- Automatic summaries and key point extraction

### Wallet System

- In-app balance management
- Transaction history
- Withdrawal requests
- Secure payment processing via Midtrans

### Notifications

- Real-time push notifications
- Email notifications via Resend
- Notification preferences management

## Technology Stack

### Frontend

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide React icons

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL (Supabase)

### Authentication

- NextAuth.js v5
- Google OAuth integration

### Real-time

- Pusher for WebSocket connections

### AI

- Google Gemini API for AI features

### Payments

- Midtrans payment gateway

### Storage

- Supabase Storage for file uploads

### Email

- Resend for transactional emails

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Qyuzet/campus-circle-hatchery.git
cd campusCircle
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Configure the following environment variables:

- DATABASE_URL - PostgreSQL connection string
- NEXTAUTH_SECRET - Secret for NextAuth.js
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET - Google OAuth credentials
- PUSHER_APP_ID, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_APP_KEY - Pusher credentials
- GEMINI_API_KEY - Google Gemini API key
- MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY - Midtrans credentials
- RESEND_API_KEY - Resend API key
- SUPABASE_URL, SUPABASE_SERVICE_KEY - Supabase credentials

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages (marketplace, clubs, my-hub, etc.)
│   ├── admin/             # Admin panel
│   └── ...
├── components/            # React components
│   ├── my-ai/            # AI Notes block editor components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── contexts/             # React context providers
```

## License

This project is intended for educational purposes within Binus University.

## Links

- Website: https://campuscircle.vercel.app
- Repository: https://github.com/Qyuzet/campus-circle-hatchery
