import '@testing-library/jest-dom';
import { vi } from 'vitest';

console.log("Global setup running");

global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

window.HTMLElement.prototype.scrollIntoView = function () { };
window.HTMLElement.prototype.releasePointerCapture = function () { };
window.HTMLElement.prototype.hasPointerCapture = function () { return false; };

class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;
    constructor(type: string, props: any) {
        super(type, props);
        this.button = props.button || 0;
        this.ctrlKey = props.ctrlKey || false;
        this.pointerType = props.pointerType || 'mouse';
    }
}
class MockDataTransfer {
    getData = vi.fn();
    setData = vi.fn();
}
window.DataTransfer = MockDataTransfer as any;

// Mock ClipboardEvent
class MockClipboardEvent extends Event {
    clipboardData: {
        getData: (format: string) => string;
        setData: (format: string, data: string) => void;
    };
    constructor(type: string, options?: any) {
        super(type, options);
        this.clipboardData = {
            getData: vi.fn(),
            setData: vi.fn(),
            ...options?.clipboardData,
        };
    }
}
window.ClipboardEvent = MockClipboardEvent as any;

// Mock Range and Selection for Editor
document.createRange = () => {
    const range = new Range();
    range.getBoundingClientRect = vi.fn(() => ({
        x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0, toJSON: () => { }
    }));
    range.getClientRects = vi.fn(() => ({
        item: () => null,
        length: 0,
        [Symbol.iterator]: vi.fn()
    }) as any);
    return range;
};

document.elementFromPoint = (x: number, y: number) => {
    return document.body;
};

window.getSelection = () => {
    return {
        removeAllRanges: vi.fn(),
        addRange: vi.fn(),
        getRangeAt: vi.fn(() => document.createRange()),
        toString: vi.fn(() => ''),
        anchorNode: null,
        focusNode: null,
        isCollapsed: true,
        rangeCount: 0,
    } as any;
};

// Mock Scroll methods
Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

// --- Next.js / NextAuth Mocks ---

// Mock lucide-react
vi.mock('lucide-react', () => {
  const createMockIcon = (name: string) => {
    const Icon = vi.fn((props: any) => null) as any;
    Icon.displayName = name;
    return Icon;
  };
  return {
    LayoutTemplate: createMockIcon('LayoutTemplate'),
    ChevronRight: createMockIcon('ChevronRight'),
    ChevronDown: createMockIcon('ChevronDown'),
    Plus: createMockIcon('Plus'),
    Trash2: createMockIcon('Trash2'),
    Archive: createMockIcon('Archive'),
    Copy: createMockIcon('Copy'),
    Share2: createMockIcon('Share2'),
    MoreVertical: createMockIcon('MoreVertical'),
    Edit: createMockIcon('Edit'),
    Eye: createMockIcon('Eye'),
    EyeOff: createMockIcon('EyeOff'),
    Lock: createMockIcon('Lock'),
    Unlock: createMockIcon('Unlock'),
    Download: createMockIcon('Download'),
    Upload: createMockIcon('Upload'),
    Search: createMockIcon('Search'),
    X: createMockIcon('X'),
    Check: createMockIcon('Check'),
    AlertCircle: createMockIcon('AlertCircle'),
    Info: createMockIcon('Info'),
    Settings: createMockIcon('Settings'),
    Menu: createMockIcon('Menu'),
    Home: createMockIcon('Home'),
    FileText: createMockIcon('FileText'),
    Folder: createMockIcon('Folder'),
    Calendar: createMockIcon('Calendar'),
    Clock: createMockIcon('Clock'),
    User: createMockIcon('User'),
    LogOut: createMockIcon('LogOut'),
    LogIn: createMockIcon('LogIn'),
    Bell: createMockIcon('Bell'),
    MessageSquare: createMockIcon('MessageSquare'),
    Heart: createMockIcon('Heart'),
    Share: createMockIcon('Share'),
    Bookmark: createMockIcon('Bookmark'),
    Flag: createMockIcon('Flag'),
    Zap: createMockIcon('Zap'),
    Layers: createMockIcon('Layers'),
    Grid: createMockIcon('Grid'),
    List: createMockIcon('List'),
    RotateCcw: createMockIcon('RotateCcw'),
    Star: createMockIcon('Star'),
    Globe: createMockIcon('Globe'),
    Link2: createMockIcon('Link2'),
    Users: createMockIcon('Users'),
    ArrowUpRight: createMockIcon('ArrowUpRight'),
    MoreHorizontal: createMockIcon('MoreHorizontal'),
    FolderOpen: createMockIcon('FolderOpen'),
    Table: createMockIcon('Table'),
    Loader2: createMockIcon('Loader2'),
    CheckCircle: createMockIcon('CheckCircle'),
    XCircle: createMockIcon('XCircle'),
    ImageIcon: createMockIcon('ImageIcon'),
    FileCode: createMockIcon('FileCode'),
    Sun: createMockIcon('Sun'),
    Moon: createMockIcon('Moon'),
    Database: createMockIcon('Database'),
    Undo: createMockIcon('Undo'),
    Trash: createMockIcon('Trash'),
    FileDown: createMockIcon('FileDown'),
    ArrowUpDown: createMockIcon('ArrowUpDown'),
    FileImage: createMockIcon('FileImage'),
    History: createMockIcon('History'),
    Loader: createMockIcon('Loader'),
    FilePlus: createMockIcon('FilePlus'),
  };
});

// Mock next/server to prevent import errors in JSDOM
vi.mock('next/server', () => {
    class MockNextResponse extends Response {
        constructor(body?: BodyInit | null, init?: ResponseInit) {
            super(body, init);
        }
        static json(data: any, init?: ResponseInit) {
            return new MockNextResponse(JSON.stringify(data), {
                ...init,
                headers: {
                    'Content-Type': 'application/json',
                    ...(init?.headers || {}),
                },
            });
        }
    }
    return {
        NextResponse: MockNextResponse,
        NextRequest: class NextRequest extends Request {
            constructor(url: string, options?: RequestInit) {
                super(url, options);
            }
        },
    };
});

// Mock next-auth to prevent server-side code execution
vi.mock('next-auth', () => ({
    __esModule: true,
    default: vi.fn(),
    getServerSession: vi.fn(() => Promise.resolve(null)),
}));

// Mock the internal auth module
vi.mock('@/lib/auth', () => ({
    auth: vi.fn(() => Promise.resolve(null)),
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(() => Promise.resolve(null)),
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
    redirect: vi.fn(),
}));
