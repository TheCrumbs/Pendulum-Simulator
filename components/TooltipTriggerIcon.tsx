import React, { useState, useEffect } from "react"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimulationTooltip } from "./SimulationTooltip"
import { useSimulator } from "../context/SimulatorContext"

// Global state to track which tooltip is currently open
let activeTooltipKey: string | null = null;
const tooltipSubscribers: Set<() => void> = new Set();

// Function to notify all subscribers when the active tooltip changes
const notifyTooltipChange = () => {
  tooltipSubscribers.forEach(callback => callback());
};

// Parameter descriptions and equations
const PARAMETER_INFO = {
  length: {
    title: "Pendulum Length",
    description: "The length of the pendulum affects the period of oscillation. A longer pendulum swings more slowly than a shorter one.",
    equation: "T = 2π√(L/g)",
    comparisonValue: 50,
    defaultValue: 100,
  },
  mass: {
    title: "Pendulum Mass",
    description: "In an ideal pendulum, mass doesn't affect the period of oscillation. It only changes the visual size of the pendulum bob.",
    equation: "Mass doesn't affect period: T = 2π√(L/g)",
    comparisonValue: 2,
    defaultValue: 1,
  },
  startingAngle: {
    title: "Starting Angle",
    description: "The initial angle from which the pendulum is released. Larger angles result in more nonlinear behavior.",
    equation: "For small angles: θ(t) ≈ θ₀cos(ωt)",
    comparisonValue: 90,
    defaultValue: 45,
  },
  gravity: {
    title: "Gravity",
    description: "The gravitational acceleration affects the pendulum's period. Higher gravity results in faster oscillations.",
    equation: "T = 2π√(L/g)",
    comparisonValue: 5,
    defaultValue: 9.81,
  },
  damping: {
    title: "Damping",
    description: "Damping represents air resistance or friction. Higher damping causes the pendulum to slow down faster.",
    equation: "d²θ/dt² + b·dθ/dt + (g/L)·sin(θ) = 0",
    comparisonValue: 0.5,
    defaultValue: 0,
  },
  timeInterval: {
    title: "Time Interval",
    description: "The time step used in the physics simulation. Smaller values give more accurate results but may be slower.",
    equation: "Numerical integration: θₙ₊₁ = θₙ + Δt·ω",
    comparisonValue: 0.1,
    defaultValue: 0.016,
  },
  simulationSpeed: {
    title: "Simulation Speed",
    description: "Controls how fast the simulation runs. Higher values make the pendulum move faster.",
    equation: "Effective Δt = timeInterval × simulationSpeed",
    comparisonValue: 40,
    defaultValue: 1,
  },
  rotation: {
    title: "Image Rotation",
    description: "Rotates the pendulum bob image. This is purely visual and doesn't affect the physics.",
    comparisonValue: 90,
    defaultValue: 0,
  },
  scale: {
    title: "Image Scale",
    description: "Scales the pendulum bob image. This is purely visual and doesn't affect the physics.",
    comparisonValue: 2,
    defaultValue: 1,
  },
}

interface TooltipTriggerIconProps {
  paramKey: string
}

export const TooltipTriggerIcon: React.FC<TooltipTriggerIconProps> = ({ paramKey }) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const { params, imageSettings } = useSimulator()
  
  // Subscribe to global tooltip state changes
  useEffect(() => {
    const updateTooltipState = () => {
      setIsTooltipOpen(activeTooltipKey === paramKey);
    };
    
    tooltipSubscribers.add(updateTooltipState);
    
    return () => {
      tooltipSubscribers.delete(updateTooltipState);
    };
  }, [paramKey]);

  // Get parameter info
  const info = (PARAMETER_INFO[paramKey as keyof typeof PARAMETER_INFO] || {
    title: paramKey,
    description: "No description available.",
    comparisonValue: 0,
    defaultValue: 0,
  }) as {
    title: string;
    description: string;
    equation?: string;
    comparisonValue: number;
    defaultValue: number;
  }

  // Get current value and range for the parameter
  const getCurrentValue = () => {
    return info.defaultValue;
  }

  const getMinValue = () => {
    switch (paramKey) {
      case "length": return 1
      case "mass": return 0.1
      case "startingAngle": return -180
      case "gravity": return 0.01
      case "damping": return 0
      case "timeInterval": return 0.001
      case "simulationSpeed": return 0.1
      case "rotation": return -180
      case "scale": return 0.1
      default: return 0
    }
  }

  const getMaxValue = () => {
    switch (paramKey) {
      case "length": return 200
      case "mass": return 10
      case "startingAngle": return 180
      case "gravity": return 20
      case "damping": return 2
      case "timeInterval": return 0.099
      case "simulationSpeed": return 50
      case "rotation": return 180
      case "scale": return 6
      default: return 100
    }
  }

  const getStep = () => {
    switch (paramKey) {
      case "length": return 1
      case "startingAngle": return 1
      case "timeInterval": return 0.001
      case "damping": return 0.01
      case "simulationSpeed": return 0.1
      case "rotation": return 1
      case "scale": return 0.1
      default: return 0.01
    }
  }

  const handleOpenTooltip = () => {
    // Close any open tooltip and set this one as active
    activeTooltipKey = paramKey;
    notifyTooltipChange();
  };

  const handleCloseTooltip = () => {
    // Only clear if this is the active tooltip
    if (activeTooltipKey === paramKey) {
      activeTooltipKey = null;
      notifyTooltipChange();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full p-0 hover:bg-gray-100"
        onClick={handleOpenTooltip}
      >
        <HelpCircle className="h-4 w-4 text-gray-500" />
      </Button>

      <SimulationTooltip
        isOpen={isTooltipOpen}
        onClose={handleCloseTooltip}
        paramKey={paramKey}
        title={info.title}
        description={info.description}
        equation={info.equation}
        minValue={getMinValue()}
        maxValue={getMaxValue()}
        step={getStep()}
        defaultValue={getCurrentValue()}
        comparisonValue={info.comparisonValue}
      />
    </>
  )
} 