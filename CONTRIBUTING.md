# Contributing to Notion Clone

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/notion.git
   cd notion
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Add your credentials to .env
   ```

5. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Code Standards

### TypeScript
- Use strict typing - avoid `any`
- Define interfaces for complex objects
- Use type inference when obvious

```typescript
// Good
interface PageData {
  title: string
  content?: string
}

const page: PageData = { title: "My Page" }

// Avoid
const page: any = { title: "My Page" }
```

### React Components

**Server Components (Default)**
```typescript
// For non-interactive components
export default async function PageList() {
  const pages = await getPages()
  return <div>{pages.map(...)}</div>
}
```

**Client Components**
```typescript
"use client"

// Only when you need:
// - useState, useEffect, etc.
// - Event handlers
// - Browser APIs

export function InteractiveButton() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>
}
```

### Server Actions

Place in `src/actions/` directory:

```typescript
"use server"

export async function actionName(params: ParamType) {
  // 1. Authenticate
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  
  // 2. Validate input
  if (!params.id) throw new Error("Invalid params")
  
  // 3. Database operation
  const result = await db.model.operation()
  
  // 4. Revalidate cache
  revalidatePath("/path")
  
  // 5. Return result
  return result
}
```

### Styling with Tailwind

```typescript
// Use utility classes
<div className="flex items-center gap-x-2 px-4 py-2">

// Use cn() for conditional classes
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "disabled-classes"
)}>
```

## Database Changes

### Adding a Model

1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push` (dev) or `npx prisma migrate dev` (prod)

### Example: Adding a Comment Model

```prisma
model Comment {
  id        String   @id @default(uuid())
  content   String
  createdAt DateTime @default(now())
  
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id])
  
  @@index([pageId])
  @@index([userId])
}

// Add to Page model
model Page {
  // ... existing fields
  comments  Comment[]
}

// Add to User model
model User {
  // ... existing fields
  comments  Comment[]
}
```

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(editor): add slash command support
fix(sidebar): correct page nesting order
docs(readme): update installation steps
refactor(actions): simplify page creation logic
```

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat(component): description"
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/my-feature
   ```

4. **Create Pull Request**
   - Clear title and description
   - Reference related issues
   - Add screenshots for UI changes
   - Ensure all checks pass

5. **Address review comments**
6. **Squash and merge**

## Testing (Future)

When we add tests, follow these patterns:

### Unit Tests
```typescript
// __tests__/actions/page.test.ts
describe('createPage', () => {
  it('should create a page', async () => {
    const page = await createPage()
    expect(page.title).toBe('Untitled')
  })
})
```

### Component Tests
```typescript
// __tests__/components/editor.test.tsx
describe('Editor', () => {
  it('should render', () => {
    render(<Editor />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
```

## Code Review Guidelines

### As a Reviewer

- Be constructive and kind
- Explain the "why" behind suggestions
- Approve if no blocking issues
- Request changes for critical issues

### As an Author

- Respond to all comments
- Don't take feedback personally
- Ask for clarification if needed
- Make requested changes promptly

## Feature Development Checklist

When adding a new feature:

- [ ] Design database schema changes (if any)
- [ ] Create/update Prisma models
- [ ] Write server actions
- [ ] Build UI components
- [ ] Add client-side interactions
- [ ] Update documentation
- [ ] Test manually
- [ ] Submit PR

## Common Patterns

### CRUD Operations

```typescript
// Create
const item = await db.model.create({ data: {...} })

// Read
const item = await db.model.findUnique({ where: { id } })
const items = await db.model.findMany({ where: {...} })

// Update
const item = await db.model.update({
  where: { id },
  data: {...}
})

// Delete
await db.model.delete({ where: { id } })
```

### Authorization Check

```typescript
export async function protectedAction(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")
  
  const user = await db.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) throw new Error("User not found")
  
  // Ensure user owns resource
  const resource = await db.resource.findFirst({
    where: { id, userId: user.id }
  })
  
  if (!resource) throw new Error("Not found")
  
  return resource
}
```

## Documentation

When adding features, update:

- `README.md` - Main documentation
- `SETUP.md` - Setup instructions (if affected)
- `ARCHITECTURE.md` - Architecture details (if significant)
- `QUICK_REFERENCE.md` - Quick commands/patterns
- Code comments - For complex logic

## Questions?

- Check existing documentation
- Search closed issues
- Open a new discussion
- Ask in pull request comments

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing! 🎉
