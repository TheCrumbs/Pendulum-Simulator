"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type SimulatorParams = {
  length: number
  mass: number
  startingAngle: number
  gravity: number
  damping: number
  timeInterval: number
  simulationSpeed: number
  currentAngle: number
  currentVelocity: number
}

type ImageSettings = {
  rotation: number
  scale: number
}

type SimulatorContextType = {
  params: SimulatorParams
  setParams: React.Dispatch<React.SetStateAction<SimulatorParams>>
  resetParams: () => void
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  pan: { x: number; y: number }
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  isPlaying: boolean
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
  imageSettings: ImageSettings
  setImageSettings: React.Dispatch<React.SetStateAction<ImageSettings>>
  resetImageSettings: () => void
}

// Define minimum safe values for parameters to prevent crashes
const MIN_SAFE_VALUES = {
  length: 1,        // Minimum 1 cm
  mass: 0.1,        // Minimum 0.1 kg
  gravity: 0.01,    // Minimum gravity (almost zero but not zero)
  damping: 0,       // Can be zero (no damping)
  timeInterval: 0.001, // Minimum time step to prevent division by zero
  simulationSpeed: 0.1  // Minimum simulation speed
}

const defaultParams: SimulatorParams = {
  length: 100,
  mass: 1,
  startingAngle: 45,
  gravity: 9.81,
  damping: 0,
  timeInterval: 0.01,
  simulationSpeed: 30,
  currentAngle: (45 * Math.PI) / 180,
  currentVelocity: 0,
}

const defaultImageSettings: ImageSettings = {
  rotation: 0,
  scale: 1,
}

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined)

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [params, setParams] = useState<SimulatorParams>(defaultParams)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPlaying, setIsPlaying] = useState(false)
  const [imageSettings, setImageSettings] = useState<ImageSettings>(defaultImageSettings)

  const resetParams = () => {
    setParams({
      ...defaultParams,
      currentAngle: (defaultParams.startingAngle * Math.PI) / 180,
      currentVelocity: 0,
    })
    setIsPlaying(false)
  }

  const resetImageSettings = () => {
    setImageSettings(defaultImageSettings)
  }

  const setValidatedParams: React.Dispatch<React.SetStateAction<SimulatorParams>> = (newParams) => {
    setParams((prevParams) => {
      const updatedParams = typeof newParams === 'function' ? newParams(prevParams) : newParams
      
      // Apply validation to ensure all parameters are within safe ranges
      const validatedParams = {
        ...prevParams,
        ...updatedParams,
        length: Math.max(updatedParams.length ?? prevParams.length, MIN_SAFE_VALUES.length),
        mass: Math.max(updatedParams.mass ?? prevParams.mass, MIN_SAFE_VALUES.mass),
        gravity: Math.max(updatedParams.gravity ?? prevParams.gravity, MIN_SAFE_VALUES.gravity),
        damping: Math.max(updatedParams.damping ?? prevParams.damping, MIN_SAFE_VALUES.damping),
        timeInterval: Math.max(updatedParams.timeInterval ?? prevParams.timeInterval, MIN_SAFE_VALUES.timeInterval),
        simulationSpeed: Math.max(updatedParams.simulationSpeed ?? prevParams.simulationSpeed, MIN_SAFE_VALUES.simulationSpeed),
      }
      
      return validatedParams
    })
  }

  return (
    <SimulatorContext.Provider 
      value={{ 
        params, 
        setParams: setValidatedParams, 
        resetParams, 
        zoom, 
        setZoom, 
        pan, 
        setPan, 
        isPlaying, 
        setIsPlaying,
        imageSettings,
        setImageSettings,
        resetImageSettings
      }}
    >
      {children}
    </SimulatorContext.Provider>
  )
}

export const useSimulator = () => {
  const context = useContext(SimulatorContext)
  if (context === undefined) {
    throw new Error("useSimulator must be used within a SimulatorProvider")
  }
  return context
}
