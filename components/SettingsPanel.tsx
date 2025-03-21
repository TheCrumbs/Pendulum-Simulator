import type React from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSimulator } from "../context/SimulatorContext"
import { RotateCcw } from "lucide-react"
import { TooltipTriggerIcon } from "./TooltipTriggerIcon"

// Define minimum safe values for parameters to prevent crashes
const MIN_SAFE_VALUES = {
  length: 1,        // Minimum 1 cm
  mass: 0.1,        // Minimum 0.1 kg
  gravity: 0.01,    // Minimum gravity (almost zero but not zero)
  damping: 0,       // Can be zero (no damping)
  timeInterval: 0.001, // Minimum time step to prevent division by zero
  simulationSpeed: 0.1  // Minimum simulation speed
}

/**
 * Settings panel component for adjusting pendulum simulation parameters
 */
export const SettingsPanel: React.FC<{ isOpen: boolean }> = ({ isOpen = false }) => {
  const { params, setParams, resetParams, isPlaying, setIsPlaying } = useSimulator()

  /**
   * Handle changes to input fields
   * @param key - Parameter key to update
   * @param value - New parameter value
   */
  const handleInputChange = (key: string, value: number) => {
    // Apply minimum safe values before updating
    const safeValue = Math.max(value, getSafeMinValue(key))
    setParams((prev) => ({ ...prev, [key]: safeValue }))
  }

  /**
   * Handle slider value changes
   * @param key - Parameter key to update
   */
  const handleSliderChange = (key: string) => {
    return (values: number[]) => {
      if (values.length > 0) {
        handleInputChange(key, values[0])
      }
    }
  }

  /**
   * Get the safe minimum value for a parameter
   */
  const getSafeMinValue = (key: string): number => {
    return MIN_SAFE_VALUES[key as keyof typeof MIN_SAFE_VALUES] ?? 0
  }

  return (
    <Card
      className={`
      absolute right-1 top-24 w-80 p-4 bg-white/80 backdrop-blur-sm
      transition-all duration-300 ease-in-out origin-top-right
      ${isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"}
    `}
    >
      <div className="space-y-6">
        {/* Filter out internal state parameters */}
        {Object.entries(params)
          .filter(([key]) => key !== "currentAngle" && key !== "currentVelocity")
          .map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 capitalize">{key}</label>
                  <TooltipTriggerIcon paramKey={key} />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleInputChange(key, Number.parseFloat(e.target.value))}
                        className="w-20 text-right"
                        step={getSliderStep(key)}
                        min={getSafeMinValue(key)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getTooltipContent(key)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Slider
                value={[value]}
                min={Math.max(getSliderMin(key), getSafeMinValue(key))}
                max={getSliderMax(key)}
                step={getSliderStep(key)}
                onValueChange={handleSliderChange(key)}
                className="bg-[#e6fff0]"
              />
            </div>
          ))}
        <Button onClick={() => setIsPlaying(!isPlaying)} className="w-full">
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={resetParams} className="w-full mt-2">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset All
        </Button>
      </div>
    </Card>
  )
}

/**
 * Get the minimum value for a slider based on parameter key
 */
function getSliderMin(key: string): number {
  switch (key) {
    case "length":
      return 1 // 1 cm minimum
    case "mass":
      return 0.1
    case "startingAngle":
      return -180
    case "gravity":
      return 0.01
    case "damping":
      return 0
    case "timeInterval":
      return 0.001
    case "simulationSpeed":
      return 0.1
    default:
      return 0
  }
}

/**
 * Get the maximum value for a slider based on parameter key
 */
function getSliderMax(key: string): number {
  switch (key) {
    case "length":
      return 200 // 200 cm maximum
    case "mass":
      return 10
    case "startingAngle":
      return 180
    case "gravity":
      return 20
    case "damping":
      return 2
    case "timeInterval":
      return 1
    case "simulationSpeed":
      return 50
    default:
      return 100
  }
}

/**
 * Get the step size for a slider based on parameter key
 */
function getSliderStep(key: string): number {
  switch (key) {
    case "length":
      return 1 // 1 cm steps
    case "startingAngle":
      return 1
    case "timeInterval":
      return 0.001
    case "damping":
      return 0.01 // More precise damping steps
    case "simulationSpeed":
      return 0.1
    default:
      return 0.01
  }
}

/**
 * Get the tooltip content for a parameter
 */
function getTooltipContent(key: string): string {
  switch (key) {
    case "length":
      return "Length of the pendulum string (centimeters)"
    case "mass":
      return "Mass of the pendulum bob (kg). Won't change anything but size"
    case "startingAngle":
      return "Initial angle of the pendulum (degrees)"
    case "gravity":
      return "Acceleration due to gravity (m/s²)"
    case "damping":
      return "Damping factor (air resistance)"
    case "timeInterval":
      return "Time step for simulation (seconds)"
    case "simulationSpeed":
      return "Speed multiplier for simulation integration"
    default:
      return ""
  }
}
