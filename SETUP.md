# Notion Clone - Setup Guide

This guide will help you set up and run the Notion Clone application.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git**

## Step 1: Clone the Repository

```bash
git clone https://github.com/erdodo/notion.git
cd notion
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16+
- React 19
- Prisma 5
- Clerk for authentication
- Tiptap editor
- Tailwind CSS
- And more...

## Step 3: Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. In the application settings, go to **API Keys**
4. Copy your **Publishable Key** and **Secret Key**

## Step 4: Set Up EdgeStore (Optional for File Uploads)

1. Go to [EdgeStore](https://edgestore.dev/)
2. Create an account and project
3. Get your **Access Key** and **Secret Key**

## Step 5: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```bash
createdb notion
```

3. Your connection string will be:
```
postgresql://username:password@localhost:5432/notion
```

### Option B: Cloud PostgreSQL (Recommended)

Use services like:
- [Supabase](https://supabase.com/) (Free tier available)
- [Neon](https://neon.tech/) (Free tier available)
- [Railway](https://railway.app/)
- [Vercel Postgres](https://vercel.com/storage/postgres)

## Step 6: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your actual credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/documents
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/documents

# Database
DATABASE_URL="postgresql://user:password@host:5432/notion"

# EdgeStore (Optional - for file uploads)
EDGE_STORE_ACCESS_KEY=your_access_key_here
EDGE_STORE_SECRET_KEY=your_secret_key_here
```

## Step 7: Initialize Database

Generate Prisma Client and push schema to database:

```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate the Prisma Client
- Create all necessary tables in your PostgreSQL database
- Set up indexes and relationships

## Step 8: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 9: Create Your First User

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" to create an account with Clerk
3. After signing up, you'll be redirected to the documents page
4. Click "New Page" in the sidebar to create your first document

## Database Management

### Prisma Studio

To view and manage your database visually:

```bash
npx prisma studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555)

### Database Migrations

If you make changes to `prisma/schema.prisma`:

```bash
npx prisma db push
```

For production, use migrations:

```bash
npx prisma migrate dev --name your_migration_name
```

## Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Add environment variables in Vercel project settings
5. Deploy!

Vercel will automatically:
- Build your Next.js application
- Set up serverless functions
- Configure domains and SSL

## Troubleshooting

### Issue: Build fails with Clerk errors

**Solution**: Ensure your Clerk keys are valid and added to `.env` file

### Issue: Database connection fails

**Solution**: 
- Check your `DATABASE_URL` format
- Ensure PostgreSQL is running
- Test connection with: `npx prisma db pull`

### Issue: Prisma Client not found

**Solution**: Run `npx prisma generate`

### Issue: Port 3000 already in use

**Solution**: 
```bash
# Use a different port
PORT=3001 npm run dev
```

Or kill the process using port 3000:
```bash
# On Mac/Linux
lsof -ti:3000 | xargs kill

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## Features Overview

### ✅ Implemented Features

- **User Authentication**: Full Clerk integration with sign up/sign in
- **Page Management**: Create, read, update, delete pages
- **Hierarchical Structure**: Unlimited nested pages
- **Rich Text Editor**: Tiptap-based WYSIWYG editor
- **Sidebar Navigation**: Collapsible tree structure
- **Archive System**: Soft delete with restore capability
- **Page Customization**: Icons and cover images (placeholders ready)

### 🚧 Coming Soon

- Slash commands (/) for formatting
- Drag-and-drop page reordering  
- Real-time collaboration
- Page templates
- Advanced search
- Export functionality
- Permissions and sharing

## Project Structure

```
notion/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── actions/
│   │   └── page.ts            # Server actions for pages
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── documents/     # Document routes
│   │   │   └── layout.tsx     # Main app layout
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── editor/            # Editor components
│   │   ├── navigation/        # Sidebar components
│   │   └── ui/                # UI components
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── utils.ts           # Utilities
├── .env.example
├── README.md
└── package.json
```

## Support

For issues and questions:
- Check the [README.md](README.md)
- Review [Clerk Documentation](https://clerk.com/docs)
- Review [Prisma Documentation](https://www.prisma.io/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)

## License

ISC
