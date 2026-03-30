# Soirée — Event Planning Frontend

A production-ready React frontend for the Event Planning System Spring Boot backend.

## Tech Stack

- **React 18** + **Vite 5** — fast dev server, HMR
- **Tailwind CSS 3** — utility-first styling with custom "Soirée" design system
- **React Router v6** — client-side routing with role-based guards
- **Axios** — HTTP client with JWT request interceptor & 401 auto-redirect
- **Google Fonts** — Cormorant Garamond (display) + DM Sans (body)

## Project Structure

```
src/
├── api/
│   └── client.js            # Axios instance + JWT interceptor + all API modules
├── context/
│   └── AuthContext.jsx      # Auth state, login/logout, role helpers, localStorage persist
├── hooks/
│   └── useToast.js          # Toast notification hook
├── components/
│   ├── Navbar.jsx           # Top navigation bar
│   ├── ui.jsx               # Shared UI: Spinner, Modal, Toast, StatusBadge, etc.
│   └── tabs/
│       ├── EventsTab.jsx    # Events CRUD (card grid)
│       ├── GuestsTab.jsx    # Guests CRUD (table)
│       ├── TasksTab.jsx     # Tasks CRUD (kanban-style columns)
│       ├── BudgetsTab.jsx   # Budgets CRUD (table + totals)
│       ├── InvitationsTab.jsx # Invitations CRUD (table)
│       └── VendorsTab.jsx   # Vendors directory (read-only cards)
└── pages/
    ├── Landing.jsx          # Public landing page
    ├── Login.jsx            # Organizer/admin login
    ├── Register.jsx         # Organizer/admin registration
    ├── VendorLogin.jsx      # Vendor-specific login
    ├── VendorRegister.jsx   # Vendor registration
    ├── OrganizerDashboard.jsx  # Main dashboard with sidebar tabs
    ├── EventDetail.jsx      # Per-event detail view (guests, tasks, budget, invitations)
    ├── VendorDashboard.jsx  # Vendor profile + service info
    └── RsvpRespond.jsx      # Public RSVP response page (from email links)
```

## Getting Started

### Prerequisites

- Node.js **18+**
- npm **9+**
- Spring Boot backend running on **http://localhost:8080**

### Installation

```bash
# 1. Navigate to the frontend directory
cd eventplan-frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Build for Production

```bash
npm run build
# Outputs to /dist
```

## Authentication Flow

1. User logs in via `/login` or `/vendor/login`
2. JWT token + user info stored in `localStorage`
3. Every API request automatically gets `Authorization: Bearer <token>` header
4. On 401 response → token cleared → user redirected to `/login`
5. On page refresh → auth state rehydrated from `localStorage`

## Role-Based Routing

| Role | Dashboard | Access |
|------|-----------|--------|
| `ORGANIZER` | `/dashboard` | Events, Guests, Tasks, Budgets, Invitations, Vendors |
| `ADMIN` | `/dashboard` | Same as Organizer |
| `USER` | `/dashboard` | Same as Organizer |
| `VENDOR` | `/vendor/dashboard` | Own profile + service details |

## API Configuration

Backend base URL is set in `src/api/client.js`:

```js
const BASE_URL = 'http://localhost:8080'
```

Change this to your backend URL if it differs.

## Pages Overview

| Page | Path | Auth |
|------|------|------|
| Landing | `/` | Public |
| Organizer Login | `/login` | Public |
| Organizer Register | `/register` | Public |
| Vendor Login | `/vendor/login` | Public |
| Vendor Register | `/vendor/register` | Public |
| RSVP Respond | `/rsvp/respond?eventId=&email=&response=` | Public |
| Organizer Dashboard | `/dashboard` | ORGANIZER / ADMIN / USER |
| Event Detail | `/dashboard/events/:eventId` | ORGANIZER / ADMIN / USER |
| Vendor Dashboard | `/vendor/dashboard` | VENDOR |

## Design System

The UI uses a bespoke "Soirée" design system:

- **Colors**: `obsidian` (dark neutrals), `gold` (accent), `cream`/`parchment` (backgrounds)
- **Typography**: Cormorant Garamond for headings, DM Sans for body text
- **Components**: `.btn-primary`, `.btn-secondary`, `.btn-gold`, `.btn-danger`, `.input-field`, `.card`, `.label`, `.badge-status`
- **Animations**: `animate-fade-in`, `animate-slide-up`
