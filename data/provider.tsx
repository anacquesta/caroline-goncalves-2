"use client";
import { createContext, useContext } from "react";
import { seed, type Store, visible } from "@/lib/cms/seed";
export const ContentContext = createContext<Store>(seed);
export function useCollection(section: string) {
  return (useContext(ContentContext)[section] || []).filter(visible);
}
