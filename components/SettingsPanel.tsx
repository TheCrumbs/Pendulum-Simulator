import type React from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSimulator } from "../context/SimulatorContext"
import { RotateCcw } from "lucide-react"

export const SettingsPanel: React.FC<{ isOpen: boolean }> = ({ isOpen = false }) => {
  const { params, setParams, resetParams, isPlaying, setIsPlaying } = useSimulator()

  const handleInputChange = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
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
        {Object.entries(params).filter(([key]) => key !== "currentAngle" && key !== "currentVelocity").map(([key, value]) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-70 capitalize">{key}</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => handleInputChange(key, Number.parseFloat(e.target.value))}
                      className="w-20 text-right"
                      step={getSliderStep(key)}
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
              min={getSliderMin(key)}
              max={getSliderMax(key)}
              step={getSliderStep(key)}
              onValueChange={([newValue]) => handleInputChange(key, newValue)}
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

function getSliderMin(key: string): number {
  switch (key) {
    case "length":
      return 10 // 10 cm minimum
    case "mass":
      return 0.1
    case "startingAngle":
      return -180
    case "gravity":
      return 0
    case "damping":
      return 0
    case "timeInterval":
      return 0.01
    case "simulationSpeed":
      return 0.5
    default:
      return 0
  }
}

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

function getSliderStep(key: string): number {
  switch (key) {
    case "length":
      return 1 // 1 cm steps
    case "startingAngle":
      return 1
    case "timeInterval":
      return 0.01
    case "damping":
      return 0.01 // More precise damping steps
    case "simulationSpeed":
      return 0.1
    default:
      return 0.01
  }
}

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
