# Notion Clone

A full-featured Notion clone built with modern web technologies including Next.js 14+, Prisma, Tailwind CSS, and Clerk authentication.

## Features

- 🔐 **Authentication** - Secure user authentication with Clerk, dedicated sign-in/sign-up pages
- 📝 **Rich Text Editor** - Notion-style block-based editor with Tiptap
- 📁 **Hierarchical Pages** - Unlimited nested pages with parent-child relationships and on-demand loading
- 🎨 **Customization** - Page icons and cover images
- 🗑️ **Trash/Archive** - Soft delete functionality with restore capability
- ⭐ **Favorites** - Mark pages as favorites for quick access
- 🔍 **Search** - Advanced search with Command+K (⌘K) keyboard shortcut, real-time filtering through page titles and content with debouncing
- 🌓 **Dark Mode** - Full dark mode support
- 📱 **Responsive** - Mobile-friendly design with collapsible sidebar
- 📏 **Resizable Sidebar** - Drag to resize sidebar (240px - 480px)
- 🔄 **Recursive Loading** - Efficient lazy loading of nested documents

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
│   │   └── page.ts            # Server Actions for page CRUD and search operations
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
│   │   ├── providers/
│   │   │   ├── modal-provider.tsx  # Modal provider (includes SearchCommand)
│   │   │   ├── theme-provider.tsx  # Dark/light theme provider
│   │   │   └── edgestore-provider.tsx # File storage provider
│   │   ├── search-command.tsx      # Command palette (⌘K) search component
│   │   └── ui/                     # Shadcn UI components
│   ├── hooks/
│   │   └── use-search.tsx          # Zustand store for search modal state
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
- `searchPages(query)` - Search pages by title and content with security filtering

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

### Command Palette Search (⌘K / Ctrl+K)

Professional Omnibar-style search system:
- **Keyboard-First**: Global `Cmd+K` (Mac) or `Ctrl+K` (Windows) shortcut
- **Real-Time Search**: Debounced search (300ms) for optimal performance
- **Content Search**: Searches both page titles and content using PostgreSQL case-insensitive queries
- **Visual Hierarchy**: Shows page icons (emoji) and parent page breadcrumbs
- **Security**: Only searches user's own non-archived pages
- **Instant Navigation**: Click or press Enter to navigate to selected page
- **Theme Aware**: Fully integrated with dark/light mode
- **Loading States**: Visual feedback with spinner during search

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
- [ ] Full-text search with PostgreSQL tsvector
- [ ] Advanced search with filters (date, author, tags)
- [ ] Page permissions and sharing
- [ ] Comments and discussions

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
