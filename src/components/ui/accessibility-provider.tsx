import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityContextType {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  announceMessage: (message: string) => void;
  focusElement: (selector: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    // Check for user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    // Apply CSS classes based on preferences
    const root = document.documentElement;
    
    if (prefersReducedMotion) {
      root.classList.add('reduce-motion');
    }
    
    if (prefersHighContrast) {
      root.classList.add('high-contrast');
    }

    root.classList.add(`font-size-${fontSize}`);

    // Listen for preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
      if (e.matches) {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
      if (e.matches) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    };

    motionMediaQuery.addEventListener('change', handleMotionChange);
    contrastMediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, [fontSize]);

  const announceMessage = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const changeFontSize = (newSize: 'small' | 'medium' | 'large') => {
    const root = document.documentElement;
    root.classList.remove(`font-size-${fontSize}`);
    root.classList.add(`font-size-${newSize}`);
    setFontSize(newSize);
    localStorage.setItem('accessibility-font-size', newSize);
  };

  const value = {
    reducedMotion,
    highContrast,
    fontSize,
    announceMessage,
    focusElement,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcements */}
      <div id="sr-announcements" className="sr-only" aria-live="polite" aria-atomic="true" />
      
      {/* Skip links */}
      <div className="skip-links">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Pular para o conteúdo principal
        </a>
        <a 
          href="#navigation" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        >
          Pular para a navegação
        </a>
      </div>

      {/* Accessibility controls */}
      <div className="fixed bottom-4 right-4 z-50">
        <details className="group">
          <summary className="list-none cursor-pointer p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <span className="sr-only">Opções de acessibilidade</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </summary>
          
          <div className="absolute bottom-full right-0 mb-2 p-4 bg-background border border-border rounded-lg shadow-xl min-w-[200px]">
            <h3 className="font-semibold mb-3">Acessibilidade</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tamanho da fonte:</label>
                <div className="flex gap-1">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => changeFontSize(size)}
                      className={cn(
                        "px-2 py-1 text-xs rounded border",
                        fontSize === size 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "bg-background border-border hover:bg-muted"
                      )}
                    >
                      {size === 'small' ? 'P' : size === 'medium' ? 'M' : 'G'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• Use Tab para navegar</p>
                <p>• Use Enter para ativar</p>
                <p>• Use Esc para fechar</p>
              </div>
            </div>
          </div>
        </details>
      </div>
    </AccessibilityContext.Provider>
  );
};

// Hook for keyboard navigation
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to close modals/dropdowns
      if (event.key === 'Escape') {
        const openElements = document.querySelectorAll('[data-state="open"]');
        openElements.forEach((element) => {
          const closeButton = element.querySelector('[aria-label*="fechar"], [aria-label*="close"]') as HTMLElement;
          if (closeButton) {
            closeButton.click();
          }
        });
      }

      // Arrow keys for menu navigation
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const focusedElement = document.activeElement;
        if (focusedElement?.getAttribute('role') === 'menuitem') {
          event.preventDefault();
          const menuItems = Array.from(
            focusedElement.closest('[role="menu"]')?.querySelectorAll('[role="menuitem"]') || []
          ) as HTMLElement[];
          
          const currentIndex = menuItems.indexOf(focusedElement as HTMLElement);
          const nextIndex = event.key === 'ArrowDown' 
            ? (currentIndex + 1) % menuItems.length
            : (currentIndex - 1 + menuItems.length) % menuItems.length;
          
          menuItems[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};