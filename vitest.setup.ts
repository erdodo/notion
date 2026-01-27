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

// Mock next/server to prevent import errors in JSDOM
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data) => ({ json: async () => data })),
        redirect: vi.fn(),
        next: vi.fn(),
    },
}));

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
