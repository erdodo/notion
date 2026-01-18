import { useEffect } from "react";

type KeyCombo = {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
};

type ShortcutAction = (e: KeyboardEvent) => void;

interface UseKeyboardShortcutsProps {
    shortcuts: {
        combo: KeyCombo;
        action: ShortcutAction;
        preventDefault?: boolean;
        stopPropagation?: boolean;
    }[];
    enabled?: boolean;
}

export const useKeyboardShortcuts = ({
    shortcuts,
    enabled = true,
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const { combo, action, preventDefault = true, stopPropagation = false } = shortcut;

                const matchesKey = e.key.toLowerCase() === combo.key.toLowerCase();

                // Exact match for convenience, but we might want "Cmd OR Ctrl" handling in the combo definition later.
                const matchesCtrl = !!combo.ctrl === e.ctrlKey;
                const matchesMeta = !!combo.meta === e.metaKey;
                const matchesShift = !!combo.shift === e.shiftKey;
                const matchesAlt = !!combo.alt === e.altKey;

                if (matchesKey && matchesCtrl && matchesMeta && matchesShift && matchesAlt) {
                    if (preventDefault) e.preventDefault();
                    if (stopPropagation) e.stopPropagation();
                    action(e);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [shortcuts, enabled]);
};
