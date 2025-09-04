# Cuisinons 🍳

A modern recipe management and cooking application built with the T3 Stack, featuring AI-powered recipe assistance and collaborative cooking features.

## 🛠️ Tech Stack

**T3 Stack Core:**

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [TypeScript](https://typescriptlang.org) - Type-safe JavaScript
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

**Database & ORM:**

- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [PostgreSQL](https://postgresql.org) - Primary database
- [Neon](https://neon.tech) - Serverless PostgreSQL for production

**Authentication:**

- [Clerk](https://clerk.com) - Authentication solution

**AI & Features:**

- [OpenRouter](https://openrouter.ai) - AI API gateway for recipe assistance
- [Vercel AI SDK](https://sdk.vercel.ai) - AI/ML integration
- Recipe management with schema.org compatibility
- Group collaboration features
- Cooking mode with screen wake lock
- Ingredient management and shopping lists

**UI & Components:**

- [Radix UI](https://radix-ui.com) - Headless component primitives
- [Lucide React](https://lucide.dev) - Icon library
- [React Hook Form](https://react-hook-form.com) - Form handling
- [Sonner](https://sonner.emilkowal.ski) - Toast notifications

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18.17 or later
- [Docker](https://docker.com) (for local database)
- [Git](https://git-scm.com)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/algabl/cuisinons-react
   cd cuisinons
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in the required environment variables:

   ```env
   # Database
   NEON_DATABASE_URL="postgresql://postgres:password@localhost:5432/cuisinons"

   # AI Integration
   OPENROUTER_API_KEY="your-openrouter-api-key"

   # Clerk

   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-publishable-key"
   CLERK_SECRET_KEY="your-secret-key"
   ```

4. **Start the local database**

   ```bash
   ./start-database.sh
   ```

   This script will:

   - Start a PostgreSQL container with Docker
   - Create the database with proper credentials
   - Handle container lifecycle automatically

5. **Set up the database schema**

   ```bash
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Development Tools

- **Database Studio**: `npm run db:studio` - Visual database management
- **Type Checking**: `npm run typecheck` - TypeScript validation
- **Linting**: `npm run lint` - Code quality checks
- **Formatting**: `npm run format:write` - Code formatting

## 🌐 Production Deployment

### Database Setup

1. **Create a Neon database**

   - Sign up at [Neon](https://neon.tech) or the database provider of your choosing
   - Create a new project and database
   - Copy the connection string

2. **Set production environment variables**

   ```env
   NEON_DATABASE_URL="your-neon-connection-string"
   # ... other production variables
   ```

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

### Platform Deployment

**Vercel (Recommended):**

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

**Manual Deployment:**

```bash
npm run build
npm start
```

## 📖 Available Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start development server with Turbo |
| `npm run build`        | Build for production                |
| `npm start`            | Start production server             |
| `npm run check`        | Run linting and type checking       |
| `npm run typecheck`    | TypeScript type checking            |
| `npm run lint`         | ESLint code linting                 |
| `npm run lint:fix`     | Fix linting issues automatically    |
| `npm run format:check` | Check code formatting               |
| `npm run format:write` | Format code with Prettier           |
| `npm run db:generate`  | Generate database migrations        |
| `npm run db:migrate`   | Run database migrations             |
| `npm run db:push`      | Push schema changes to database     |
| `npm run db:studio`    | Open Drizzle Studio                 |

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   └── app/              # Main application pages
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Radix)
│   └── app-sidebar.tsx  # Application-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── server/              # Server-side code
│   ├── api/            # tRPC API routes
│   └── db/             # Database schema and connection
└── trpc/               # tRPC client configuration
```

<!-- ## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request -->

## 📝 Environment Variables

Refer to `.env.example` for all required environment variables. Key variables include:
- `NEON_DATABASE_URL` - PostgreSQL database connection string
- `OPENROUTER_API_KEY` - API key for AI recipe assistance

## 🔧 Database Management

The project uses Drizzle ORM with PostgreSQL. Database operations:

- **Local Development**: Uses Docker container via `start-database.sh`
- **Schema Changes**: Modify `src/server/db/schema.ts` and run `npm run db:push`
- **Migrations**: Generate with `npm run db:generate`, apply with `npm run db:migrate`
- **Visual Management**: Access Drizzle Studio with `npm run db:studio`

## 🧪 Features

- **Recipe Management**: Create, edit, and organize recipes with schema.org compatibility
- **AI Chat Assistant**: Get cooking help and recipe suggestions via OpenRouter
- **Group Collaboration**: Share recipes and collaborate with other users
- **Cooking Mode**: Hands-free cooking experience with screen wake lock
- **Ingredient Management**: Track ingredients and create shopping lists
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Built-in theme switching support

---

Built with ❤️ using the [T3 Stack](https://create.t3.gg)
