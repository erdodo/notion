import '@testing-library/jest-dom';
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
window.PointerEvent = MockPointerEvent as any;
