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

type SimulatorContextType = {
  params: SimulatorParams
  setParams: React.Dispatch<React.SetStateAction<SimulatorParams>>
  resetParams: () => void
  zoom: number
  setZoom: React.Dispatch<React.SetStateAction<number>>
  pan: { x: number; y: number }
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultParams: SimulatorParams = {
  length: 100,
  mass: 1,
  startingAngle: 45,
  gravity: 9.81,
  damping: 0,
  timeInterval: 0.01,
  simulationSpeed: 30,
  currentAngle: 0,
  currentVelocity: 0,
};

const SimulatorContext = createContext<SimulatorContextType | undefined>(undefined);

export const SimulatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [params, setParams] = useState<SimulatorParams>(defaultParams);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const resetParams = () => {
    setParams({
      ...defaultParams,
      currentAngle: (defaultParams.startingAngle * Math.PI) / 180,
      currentVelocity: 0,
    });
    setIsPlaying(false);
  };

  const setValidatedParams: React.Dispatch<React.SetStateAction<SimulatorParams>> = (newParams) => {
    setParams((prevParams) => {
      const updatedParams = typeof newParams === 'function' ? newParams(prevParams) : newParams;
      const validatedParams = {
        ...prevParams,
        ...updatedParams,
        length: Math.max(updatedParams.length ?? prevParams.length, 0),
        mass: Math.max(updatedParams.mass ?? prevParams.mass, 0),
        timeInterval: Math.max(updatedParams.timeInterval ?? prevParams.timeInterval, 0),
        simulationSpeed: Math.max(updatedParams.simulationSpeed ?? prevParams.simulationSpeed, 0),
      };
      return validatedParams;
    });
  };

  return (
    <SimulatorContext.Provider value={{ params, setParams: setValidatedParams, resetParams, zoom, setZoom, pan, setPan, isPlaying, setIsPlaying }}>
      {children}
    </SimulatorContext.Provider>
  );
};

export const useSimulator = () => {
  const context = useContext(SimulatorContext);
  if (context === undefined) {
    throw new Error("useSimulator must be used within a SimulatorProvider");
  }
  return context;
};
