"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from "react";

interface DesignPageContextType {
  onPublishClick: () => void;
  setPublishHandler: (handler: (() => void) | null) => void;
  hasPublishHandler: boolean;
}

const DesignPageContext = createContext<DesignPageContextType | null>(null);

export function DesignPageProvider({ children }: { children: ReactNode }) {
  const [publishHandler, setPublishHandlerState] = useState<(() => void) | null>(null);

  const setPublishHandler = useCallback((handler: (() => void) | null) => {
    setPublishHandlerState(() => handler);
  }, []);

  const onPublishClick = useCallback(() => {
    publishHandler?.();
  }, [publishHandler]);

  const value = useMemo(() => ({
    onPublishClick,
    setPublishHandler,
    hasPublishHandler: publishHandler !== null,
  }), [onPublishClick, setPublishHandler, publishHandler]);

  return (
    <DesignPageContext.Provider value={value}>
      {children}
    </DesignPageContext.Provider>
  );
}

export function useDesignPage() {
  const context = useContext(DesignPageContext);
  return context;
}

