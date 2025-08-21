import React, { createContext, useContext, ReactNode } from 'react';

interface CurrencyContextType {
  currency: string;
  formatPrice: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  formatPrice: (amount: number) => `$${amount.toFixed(2)}`
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const formatPrice = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency: 'USD', formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}