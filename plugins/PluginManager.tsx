"use client"

import type React from "react"
import { createContext, useContext } from "react"
import type { Plugin } from "./PluginInterface"

const PluginContext = createContext<Plugin[]>([])

export const PluginProvider: React.FC<{ children: React.ReactNode; plugins: Plugin[] }> = ({ children, plugins }) => {
  return <PluginContext.Provider value={plugins}>{children}</PluginContext.Provider>
}

export const usePlugins = () => useContext(PluginContext)

