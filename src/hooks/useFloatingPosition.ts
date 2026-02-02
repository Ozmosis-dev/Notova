import { useMemo } from 'react';

interface TouchPosition {
    x: number;
    y: number;
}

interface ToolbarDimensions {
    width: number;
    height: number;
}

interface ViewportDimensions {
    width: number;
    height: number;
}

interface FloatingPosition {
    x: number;
    y: number;
    placement: 'above' | 'below' | 'left' | 'right';
}

/**
 * Custom hook to calculate optimal position for floating toolbar
 * 
 * @param touchPosition - Current touch/cursor coordinates
 * @param toolbarDimensions - Width and height of the toolbar
 * @param viewportDimensions - Screen/viewport dimensions
 * @param keyboardHeight - Height of virtual keyboard if visible
 * @returns Calculated position and placement direction
 */
export function useFloatingPosition(
    touchPosition: TouchPosition | null,
    toolbarDimensions: ToolbarDimensions,
    viewportDimensions: ViewportDimensions,
    keyboardHeight: number = 0
): FloatingPosition | null {
    return useMemo(() => {
        if (!touchPosition) return null;

        const PADDING = 20; // Minimum padding from viewport edges
        const GAP = 20; // Gap between toolbar and touch point

        const { x: touchX, y: touchY } = touchPosition;
        const { width: toolbarWidth, height: toolbarHeight } = toolbarDimensions;
        const { width: viewportWidth, height: viewportHeight } = viewportDimensions;

        // Available space in each direction
        const availableHeight = viewportHeight - keyboardHeight;

        // Calculate position preferring above the touch point
        let x = touchX - toolbarWidth / 2; // Center horizontally on touch point
        let y = touchY - toolbarHeight - GAP; // Position above touch point
        let placement: 'above' | 'below' | 'left' | 'right' = 'above';

        // Check if toolbar would go above the viewport (too close to top)
        if (y < PADDING) {
            // Try positioning below instead
            y = touchY + GAP;
            placement = 'below';

            // If below would go past keyboard or bottom, revert to above with adjustment
            if (y + toolbarHeight + PADDING > availableHeight) {
                y = Math.max(PADDING, availableHeight - toolbarHeight - PADDING);
                placement = 'above';
            }
        }

        // Ensure toolbar doesn't go past bottom even when positioned above
        if (y + toolbarHeight + PADDING > availableHeight) {
            y = availableHeight - toolbarHeight - PADDING;
        }

        // Horizontal bounds checking
        if (x < PADDING) {
            x = PADDING;
        } else if (x + toolbarWidth + PADDING > viewportWidth) {
            x = viewportWidth - toolbarWidth - PADDING;
        }

        // Final safety check - ensure toolbar is always visible
        x = Math.max(PADDING, Math.min(x, viewportWidth - toolbarWidth - PADDING));
        y = Math.max(PADDING, Math.min(y, availableHeight - toolbarHeight - PADDING));

        return {
            x: Math.round(x),
            y: Math.round(y),
            placement,
        };
    }, [touchPosition, toolbarDimensions, viewportDimensions, keyboardHeight]);
}
