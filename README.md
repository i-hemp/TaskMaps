# TaskMaps

A premium, full-stack team task management application built with a modern dark-mode aesthetic.

## Features

- **Authentication**: Secure JWT-based auth with password hashing.
- **Project Management**: Create and manage projects with role-based access control (RBAC).
- **Team Collaboration**: Invite members to projects and assign roles.
- **Kanban Board**: Interactive task board with multi-column status tracking.
- **Task Management**: Full CRUD for tasks with priority levels, due dates, and assignments.
- **Comments**: Real-time communication on tasks.
- **Notifications**: In-app alerts for task assignments, status changes, and new comments.
- **Dashboard**: High-level overview of projects, pending tasks, and overdue items.

## Tech Stack

- **Frontend**: React (Vite), Framer Motion, Lucide Icons, Tailwind CSS/Vanilla CSS.
- **Backend**: Node.js, Express, Sequelize ORM.
- **Database**: Aiven Cloud PostgreSQL.
- **Styling**: Premium Glassmorphism Design.

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL Database

### Installation

1. **Clone the repository**
2. **Server Setup**:
   ```bash
   cd server
   npm install
   # Create .env with DATABASE_URL, JWT_SECRET, and DB_CA_PATH
   npm run dev
   ```
3. **Client Setup**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Development Phases

- **Phase 1**: Authentication & Scaffolding
- **Phase 2**: Project & Team Management
- **Phase 3**: Task CRUD & Kanban Board
- **Phase 4**: Dashboard & Notifications
- **Phase 5**: Final Polish & Documentation
