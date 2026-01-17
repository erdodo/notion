# Notion Clone - Quick Reference

## Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes to DB
npx prisma studio        # Open Prisma Studio GUI
npx prisma migrate dev   # Create and apply migration
```

## Project Structure

```
notion/
├── prisma/schema.prisma           # Database schema
├── src/
│   ├── actions/page.ts            # Server Actions
│   ├── app/                       # Next.js routes
│   │   ├── (main)/documents/      # Protected routes
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── editor/                # Editor components
│   │   └── navigation/            # Sidebar components
│   ├── lib/
│   │   ├── db.ts                  # Prisma client
│   │   └── utils.ts               # Utilities
│   └── middleware.ts              # Clerk auth
├── .env.example                   # Environment template
└── README.md                      # Main documentation
```

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models and relations |
| `src/actions/page.ts` | Server-side page operations |
| `src/lib/db.ts` | Prisma client singleton |
| `src/middleware.ts` | Authentication middleware |
| `src/components/editor/editor.tsx` | Tiptap rich text editor |
| `src/components/navigation/sidebar.tsx` | Main navigation |

## Server Actions

All in `src/actions/page.ts`:

```typescript
createPage(parentId?)        // Create new page
getPages(userId, parentId?)  // Get user's pages
getPageById(pageId)          // Get single page
updatePage(pageId, data)     // Update page
archivePage(pageId)          // Archive page
restorePage(pageId)          // Restore from archive
deletePage(pageId)           // Permanently delete
getArchivedPages()           // Get all archived
```

## Database Models

### User
- `id` - UUID primary key
- `clerkId` - Clerk user ID (unique)
- `email` - User email (unique)
- Relations: `pages[]`, `favorites[]`

### Page
- `id` - UUID primary key
- `title` - Page title
- `content` - Rich text content
- `userId` - Owner reference
- `parentId` - Parent page (nullable)
- `isArchived` - Soft delete flag
- `isPublished` - Public/private flag
- Relations: `user`, `parent`, `children[]`, `favorites[]`

### Favorite
- `userId` - User reference
- `pageId` - Page reference
- Unique constraint on `[userId, pageId]`

## Environment Variables

Required in `.env`:

```env
# Clerk (Get from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# EdgeStore (Optional - edgestore.dev)
EDGE_STORE_ACCESS_KEY=...
EDGE_STORE_SECRET_KEY=...
```

## Common Tasks

### Add a New Page
1. User clicks "New Page" in sidebar
2. Calls `createPage()` server action
3. Page created in DB
4. Router navigates to `/documents/[id]`

### Edit Page Content
1. User types in Tiptap editor
2. `onChange` triggers `updatePage()`
3. Content saved to DB
4. Cache revalidated

### Create Nested Page
1. Click "+" icon on page item
2. Calls `createPage(parentId)`
3. Child page created
4. Tree expands automatically

## Component Patterns

### Server Component (Default)
```typescript
// Can directly access database
export default async function Page() {
  const data = await db.page.findMany()
  return <div>{data}</div>
}
```

### Client Component (Interactive)
```typescript
"use client"
// Use for state, events, hooks
export function Interactive() {
  const [state, setState] = useState()
  return <button onClick={() => setState()}>
}
```

## Styling

Using Tailwind CSS utility classes:

```typescript
<div className="flex items-center gap-x-2 px-4 py-2">
  <Icon className="h-4 w-4" />
  <span className="text-sm font-medium">Text</span>
</div>
```

## Debugging Tips

```bash
# Check database
npx prisma studio

# View build output
npm run build

# Check environment
echo $DATABASE_URL

# Test Prisma connection
npx prisma db pull
```

## Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database URL configured
- [ ] Clerk keys added
- [ ] Build succeeds locally
- [ ] Database schema pushed
- [ ] Test authentication flow

## Helpful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Tiptap Docs](https://tiptap.dev/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check environment variables |
| Auth errors | Verify Clerk keys |
| DB errors | Run `npx prisma generate` |
| Port in use | Change port: `PORT=3001 npm run dev` |

## Code Style

- Use TypeScript for type safety
- Server Actions for mutations
- Server Components by default
- Client Components only when needed
- Tailwind for styling
- Descriptive variable names
