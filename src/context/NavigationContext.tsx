import { createContext, useContext, useState, type ReactNode } from 'react';

interface NavState {
  highlightTicketId?: string;
}

interface NavigationContextValue {
  navState: NavState | null;
  setNavState: (s: NavState | null) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navState, setNavState] = useState<NavState | null>(null);
  return (
    <NavigationContext.Provider value={{ navState, setNavState }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
