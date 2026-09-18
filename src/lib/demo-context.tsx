"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "neuroforge-demo-mode";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "on";
}

function getServerSnapshot() {
  return false;
}

type DemoContextValue = {
  demoMode: boolean;
  ready: boolean;
  setDemoMode: (value: boolean) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const demoMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setDemoMode = useCallback((value: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
    emit();
  }, []);

  const value = useMemo(
    () => ({ demoMode, ready: true, setDemoMode }),
    [demoMode, setDemoMode],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return context;
}
