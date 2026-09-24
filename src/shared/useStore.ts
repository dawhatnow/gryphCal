// React hook: gives a component the latest Store and re-renders when it changes.
// This is how the popup updates live while a sync is running.
import { useEffect, useState } from "react";
import type { Store } from "../types";
import { readStore } from "./storage";

export function useStore(): Store | null {
  const [store, setStore] = useState<Store | null>(null);
  useEffect(() => {
    const load = () => void readStore().then(setStore);
    load();
    chrome.storage.onChanged.addListener(load);
    return () => chrome.storage.onChanged.removeListener(load);
  }, []);
  return store;
}
