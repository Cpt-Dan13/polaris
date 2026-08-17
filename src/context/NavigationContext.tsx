import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Page } from '../types';

export interface NavState {
  highlightTicketId?: string;
  profileUserId?:     string;
  fromPage?:          Page;
}

interface NavigationContextValue {
  currentPage: Page;
  navigate:    (page: Page, state?: NavState) => void;
  navState:    NavState | null;
  setNavState: (s: NavState | null) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('overview');
  const [navState,    setNavState]    = useState<NavState | null>(null);

  const navigate = (page: Page, state?: NavState) => {
    setCurrentPage(page);
    setNavState(state ?? null);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigate, navState, setNavState }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
