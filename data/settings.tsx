"use client";
import { createContext, useContext } from "react";
export const SettingsContext = createContext<Record<string, string>>({});
export function useSettings() {
  return useContext(SettingsContext);
}
