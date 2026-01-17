# Notion Clone - Architecture Documentation

## Overview

This document provides a technical overview of the Notion Clone architecture, explaining key design decisions and implementation details.

## Tech Stack

### Frontend
- **Next.js 16.1.3**: React framework with App Router for server-side rendering and routing
- **React 19**: UI library with server components
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS v3**: Utility-first CSS framework
- **Shadcn UI**: Re-usable component library
- **Tiptap**: Rich text editor framework
- **Lucide React**: Icon library

### Backend
- **Next.js Server Actions**: Server-side data mutations
- **Prisma 5**: Type-safe ORM
- **PostgreSQL**: Relational database

### Authentication & Storage
- **Clerk v6**: Authentication and user management
- **EdgeStore**: File storage for images

### State Management
- **Zustand**: Lightweight state management (for future features)
- **React Hooks**: Component-level state

## Architecture Patterns

### 1. Server-First Architecture

The application uses Next.js App Router with a server-first approach:

```
Client Component → Server Action → Database
     ↓                  ↓              ↓
  UI Updates      Business Logic   Data Layer
```

**Benefits:**
- Reduced client-side JavaScript
- Improved security (API keys stay on server)
- Better SEO
- Faster initial page loads

### 2. Database Schema Design

#### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  pages     Page[]
  favorites Favorite[]
}
```

- **clerkId**: Links to Clerk authentication
- **One-to-Many**: User → Pages
- **One-to-Many**: User → Favorites

#### Page Model (Self-Referencing Hierarchy)
```prisma
model Page {
  id         String   @id @default(uuid())
  title      String
  content    String?  @db.Text
  userId     String
  parentId   String?
  
  user       User     @relation(fields: [userId], references: [id])
  parent     Page?    @relation("PageToPage", fields: [parentId], references: [id])
  children   Page[]   @relation("PageToPage")
}
```

**Key Features:**
- **Self-referencing relation**: Enables unlimited nesting
- **Cascade delete**: Deleting parent removes all children
- **Soft delete**: `isArchived` flag for trash functionality
- **Publishing**: `isPublished` flag for public/private control

#### Favorite Model (Many-to-Many)
```prisma
model Favorite {
  userId    String
  pageId    String
  
  user      User @relation(fields: [userId], references: [id])
  page      Page @relation(fields: [pageId], references: [id])
  
  @@unique([userId, pageId])
}
```

- Enables users to favorite multiple pages
- Prevents duplicate favorites with unique constraint

### 3. Server Actions Pattern

Located in `src/actions/page.ts`, these handle all CRUD operations:

```typescript
"use server"

export async function createPage(parentId?: string) {
  const { userId } = await auth()
  // Authorization check
  // Database operation
  // Revalidate cache
}
```

**Pattern Benefits:**
- Type-safe end-to-end
- Automatic request deduplication
- Built-in error handling
- No API routes needed

### 4. Component Architecture

```
App Layout (Root)
├── Clerk Provider
└── Main Layout
    ├── Sidebar (Navigation)
    │   └── Page Items (Recursive)
    └── Content Area
        ├── Document Header
        │   ├── Icon Picker
        │   └── Cover Image
        └── Document Editor (Tiptap)
```

#### Recursive Component Pattern

`PageItem` component renders itself recursively:

```typescript
<PageItem page={page} level={0}>
  {page.children.map(child => (
    <PageItem page={child} level={1}>
      {/* Renders recursively */}
    </PageItem>
  ))}
</PageItem>
```

### 5. Authentication Flow

```
User Access → Middleware → Clerk Check → Route
                ↓
         Unauthorized → Redirect to Sign In
                ↓
         Authorized → Get User Session → Render Page
```

**Middleware Configuration:**
```typescript
// src/middleware.ts
export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
});
```

### 6. Data Flow

#### Creating a Page
```
1. User clicks "New Page" button
   ↓
2. Client calls createPage() server action
   ↓
3. Server validates user authentication
   ↓
4. Server creates page in database
   ↓
5. revalidatePath() clears cache
   ↓
6. Client receives new page data
   ↓
7. Router navigates to new page
```

#### Editing Content
```
1. User types in editor
   ↓
2. Tiptap onChange event fires
   ↓
3. Debounced call to updatePage()
   ↓
4. Server saves to database
   ↓
5. Cache revalidation
```

## Performance Optimizations

### 1. Database Indexing

```prisma
model Page {
  @@index([userId])
  @@index([parentId])
  @@index([isArchived])
  @@index([isPublished])
}
```

Indexes on frequently queried fields improve query performance.

### 2. Dynamic Rendering

```typescript
export const dynamic = 'force-dynamic'
```

Used on auth-protected pages to prevent static generation issues.

### 3. Prisma Connection Pooling

```typescript
// src/lib/db.ts
const db = globalThis.prisma || new PrismaClient()
```

Reuses database connection in development to prevent exhausting connections.

### 4. Component Optimization

- **Client Components**: Only when interactivity needed
- **Server Components**: Default for better performance
- **Lazy Loading**: Future optimization for large page trees

## Security Considerations

### 1. Row-Level Security

All queries filter by `userId`:

```typescript
const page = await db.page.findFirst({
  where: {
    id: pageId,
    userId: user.id, // Ensures user owns the page
  }
})
```

### 2. Server-Side Validation

All mutations happen server-side with auth checks:

```typescript
const { userId } = await auth()
if (!userId) throw new Error("Unauthorized")
```

### 3. Cascade Deletes

Properly configured to prevent orphaned records:

```prisma
user User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

## Scalability Considerations

### Current Limitations
- Single database instance
- No horizontal scaling
- Limited to PostgreSQL features

### Future Enhancements

1. **Caching Layer**: Redis for frequently accessed pages
2. **CDN**: For static assets and published pages
3. **Database Replication**: Read replicas for scaling
4. **Search Service**: Elasticsearch for advanced search
5. **Message Queue**: For background jobs (exports, etc.)
6. **WebSocket**: Real-time collaboration

## File Structure Philosophy

```
src/
├── actions/        # Server Actions (business logic)
├── app/            # Routes and layouts
├── components/     # Reusable UI components
│   ├── editor/    # Editor-specific
│   ├── navigation/# Navigation-specific
│   └── ui/        # Generic UI
└── lib/           # Utilities and clients
```

**Principles:**
- Colocation of related code
- Clear separation of concerns
- Easy to locate functionality
- Scalable structure

## Testing Strategy (Future)

### Unit Tests
- Server actions
- Utility functions
- Component logic

### Integration Tests
- Page CRUD operations
- Authentication flows
- Hierarchical operations

### E2E Tests
- User workflows
- Editor functionality
- Navigation

## Deployment Architecture

```
GitHub → Vercel → PostgreSQL (Cloud)
   ↓        ↓
 Build  Serverless Functions
          ↓
     Next.js App
```

**Vercel Benefits:**
- Automatic deployments
- Serverless scaling
- Edge caching
- Analytics

## Error Handling

### Server Actions
```typescript
try {
  await db.page.create(...)
} catch (error) {
  console.error(error)
  throw new Error("Failed to create page")
}
```

### Client Components
```typescript
try {
  await createPage()
} catch (error) {
  toast.error("Failed to create page")
}
```

## Monitoring & Observability (Future)

- **Logging**: Structured logging with Winston
- **Error Tracking**: Sentry integration
- **Analytics**: Vercel Analytics + PostHog
- **Performance**: Web Vitals monitoring

## API Design Philosophy

Using Server Actions instead of REST/GraphQL:

**Advantages:**
- Type safety end-to-end
- No API versioning needed
- Automatic serialization
- Simplified error handling

**Tradeoffs:**
- Tied to Next.js
- Limited to React ecosystem
- No third-party API consumption

## Conclusion

This architecture provides:
- **Simplicity**: Fewer moving parts
- **Performance**: Server-first rendering
- **Security**: Built-in authentication
- **Scalability**: Ready for future enhancements
- **Developer Experience**: Type safety and modern tooling

The codebase is designed to be production-ready while remaining maintainable and extensible for future features.
