import { useState, useEffect } from 'react';

/**
 * Custom hook to detect virtual keyboard visibility on mobile devices
 * 
 * Uses the Visual Viewport API for iOS and fallback window resize detection for Android
 * 
 * @returns Object containing keyboard visibility state and estimated height
 */
export function useKeyboardDetection() {
    const [keyboardState, setKeyboardState] = useState({
        isKeyboardVisible: false,
        keyboardHeight: 0,
    });

    useEffect(() => {
        // Only run on client-side
        if (typeof window === 'undefined') return;

        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;

        let initialViewportHeight = window.innerHeight;

        const handleViewportResize = () => {
            if (!window.visualViewport) {
                // Fallback for browsers without visualViewport API (older Android)
                const currentHeight = window.innerHeight;
                const heightDifference = initialViewportHeight - currentHeight;

                // Keyboard is likely visible if viewport shrunk by more than 150px
                const isVisible = heightDifference > 150;

                setKeyboardState({
                    isKeyboardVisible: isVisible,
                    keyboardHeight: isVisible ? heightDifference : 0,
                });
            } else {
                // Use Visual Viewport API (iOS and modern Android)
                const visualViewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                const heightDifference = windowHeight - visualViewportHeight;

                // Keyboard is visible if visual viewport is significantly smaller than window
                const isVisible = heightDifference > 150;

                setKeyboardState({
                    isKeyboardVisible: isVisible,
                    keyboardHeight: isVisible ? heightDifference : 0,
                });
            }
        };

        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            // Check if focused element is an input field or contenteditable
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true'
            ) {
                // Give the keyboard time to appear before measuring
                setTimeout(handleViewportResize, 300);
            }
        };

        const handleBlur = () => {
            // Immediately mark keyboard as hidden
            setKeyboardState({
                isKeyboardVisible: false,
                keyboardHeight: 0,
            });

            // Double-check after a brief delay to ensure accuracy
            setTimeout(() => {
                setKeyboardState({
                    isKeyboardVisible: false,
                    keyboardHeight: 0,
                });
            }, 100);
        };

        // Event listeners
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewportResize);
        } else {
            window.addEventListener('resize', handleViewportResize);
        }

        window.addEventListener('focus', handleFocus, true);
        window.addEventListener('blur', handleBlur, true);

        // Cleanup
        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewportResize);
            } else {
                window.removeEventListener('resize', handleViewportResize);
            }
            window.removeEventListener('focus', handleFocus, true);
            window.removeEventListener('blur', handleBlur, true);
        };
    }, []);

    return keyboardState;
}
