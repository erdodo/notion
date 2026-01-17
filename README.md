# Notion Clone

A full-featured Notion clone built with modern web technologies including Next.js 14+, Prisma, Tailwind CSS, and Clerk authentication.

## Features

- 🔐 **Authentication** - Secure user authentication with Clerk, dedicated sign-in/sign-up pages
- 📝 **Rich Text Editor** - Notion-style block-based editor with Tiptap
- 📁 **Hierarchical Pages** - Unlimited nested pages with parent-child relationships
- 🎨 **Customization** - Page icons and cover images
- 🗑️ **Trash/Archive** - Soft delete functionality with restore capability
- ⭐ **Favorites** - Mark pages as favorites for quick access
- 🔍 **Search** - Quick search through all pages (Command+K)
- 🌓 **Dark Mode** - Full dark mode support
- 📱 **Responsive** - Mobile-friendly design

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Rich Text Editor**: Tiptap
- **File Storage**: EdgeStore
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
notion/
├── prisma/
│   └── schema.prisma          # Database schema with User, Page, Favorite models
├── src/
│   ├── actions/
│   │   └── page.ts            # Server Actions for page CRUD operations
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx       # Sign-in page
│   │   │   ├── sign-up/
│   │   │   │   └── page.tsx       # Sign-up page
│   │   │   └── layout.tsx         # Centered auth layout
│   │   ├── (main)/
│   │   │   ├── documents/
│   │   │   │   ├── [documentId]/
│   │   │   │   │   └── page.tsx    # Individual document page
│   │   │   │   └── page.tsx        # Documents list page
│   │   │   └── layout.tsx          # Main app layout with sidebar
│   │   ├── api/                    # API routes
│   │   ├── layout.tsx              # Root layout with Clerk
│   │   ├── page.tsx                # Landing page (redirects)
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── editor/
│   │   │   ├── editor.tsx          # Tiptap editor component
│   │   │   ├── document-header.tsx # Page header with title/icon
│   │   │   └── document-editor.tsx # Document editor wrapper
│   │   ├── navigation/
│   │   │   ├── sidebar.tsx         # Main sidebar navigation
│   │   │   └── page-item.tsx       # Individual page item with expand/collapse
│   │   └── ui/                     # Shadcn UI components
│   ├── lib/
│   │   ├── db.ts                   # Prisma client instance
│   │   └── utils.ts                # Utility functions
│   └── middleware.ts               # Clerk authentication middleware
├── .env.example                    # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Database Schema

### User Model
- Stores user information synced with Clerk
- One-to-many relationship with Pages and Favorites

### Page Model
- Hierarchical structure with self-referencing parent-child relationship
- Supports icons, cover images, and rich text content
- Soft delete with `isArchived` flag
- Publishing capability with `isPublished` flag

### Favorite Model
- Many-to-many relationship between Users and Pages
- Allows users to mark pages as favorites

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account
- EdgeStore account (for file uploads)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/erdodo/notion.git
cd notion
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- Clerk API keys
- PostgreSQL database URL
- EdgeStore credentials

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Features Implementation

### Server Actions

All page operations are handled through Server Actions for optimal performance:

- `createPage(parentId?)` - Create a new page
- `getPages(userId, parentId?)` - Get all pages for a user
- `getPageById(pageId)` - Get a specific page
- `updatePage(pageId, data)` - Update page content/metadata
- `archivePage(pageId)` - Archive a page and its children
- `restorePage(pageId)` - Restore an archived page
- `deletePage(pageId)` - Permanently delete a page
- `getArchivedPages()` - Get all archived pages

### Hierarchical Navigation

The sidebar implements a tree structure with:
- Expandable/collapsible page items
- Nested page creation
- Drag-and-drop support (planned)
- Visual hierarchy with indentation

### Rich Text Editor

Built with Tiptap, supporting:
- Headings (H1, H2, H3)
- Bold, italic, strikethrough
- Lists (ordered, unordered)
- Code blocks
- Blockquotes
- Links
- And more...

## Development

### Running Prisma Studio

View and edit your database:
```bash
npx prisma studio
```

### Building for Production

```bash
npm run build
npm start
```

## Planned Features

- [ ] Slash commands (/) for quick formatting
- [ ] Drag-and-drop page reordering
- [ ] Real-time collaboration
- [ ] Page templates
- [ ] Export functionality
- [ ] Advanced search with filters
- [ ] Page permissions and sharing
- [ ] Comments and discussions

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
