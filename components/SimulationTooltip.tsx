"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"
import { useSimulator } from "../context/SimulatorContext"

interface SimulationTooltipProps {
  isOpen: boolean
  onClose: () => void
  paramKey: string
  title: string
  description: string
  equation?: string
  minValue: number
  maxValue: number
  step: number
  defaultValue: number
  comparisonValue: number
}

/**
 * Component that displays a tooltip with detailed explanation and two pendulum simulations for comparison
 */
export const SimulationTooltip: React.FC<SimulationTooltipProps> = ({
  isOpen,
  onClose,
  paramKey,
  title,
  description,
  equation,
  minValue,
  maxValue,
  step,
  defaultValue,
  comparisonValue,
}) => {
  const [sliderValue, setSliderValue] = useState(comparisonValue)
  const defaultCanvasRef = useRef<HTMLCanvasElement>(null)
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const { params } = useSimulator()
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset slider value when tooltip opens
  useEffect(() => {
    if (isOpen) {
      setSliderValue(comparisonValue)
    }
  }, [isOpen, comparisonValue])

  // Initialize and run the pendulum simulations
  useEffect(() => {
    if (!isOpen) return

    const defaultCanvas = defaultCanvasRef.current
    const comparisonCanvas = comparisonCanvasRef.current
    if (!defaultCanvas || !comparisonCanvas) return

    // Set canvas dimensions
    const canvasWidth = 150
    const canvasHeight = 150
    defaultCanvas.width = canvasWidth
    defaultCanvas.height = canvasHeight
    comparisonCanvas.width = canvasWidth
    comparisonCanvas.height = canvasHeight

    const defaultCtx = defaultCanvas.getContext("2d")
    const comparisonCtx = comparisonCanvas.getContext("2d")
    if (!defaultCtx || !comparisonCtx) return

    // Initialize simulation parameters
    const defaultSimParams = { ...params }
    const comparisonSimParams = { ...params, [paramKey]: sliderValue }

    // Initialize simulation state
    let defaultAngle = (defaultSimParams.startingAngle * Math.PI) / 180
    let defaultVelocity = 0
    let comparisonAngle = (comparisonSimParams.startingAngle * Math.PI) / 180
    let comparisonVelocity = 0

    // Base simulation speed - adjusted for different parameters
    let baseSimulationSpeed = 20
    
    // Special handling for timeInterval and simulationSpeed parameters
    if (paramKey === 'timeInterval') {
      // For timeInterval, we want to show the effect of different time steps
      // Smaller time steps should be more accurate but similar speed
      baseSimulationSpeed = 30;
    } else if (paramKey === 'simulationSpeed') {
      // For simulationSpeed, we want to show different speeds
      // Default will use baseSimulationSpeed, comparison will use the slider value
      baseSimulationSpeed = 10;
    }
    
    const defaultDt = paramKey === 'timeInterval' ? defaultSimParams.timeInterval : 0.01
    const comparisonDt = paramKey === 'timeInterval' ? comparisonSimParams.timeInterval : 0.01
    
    const defaultSimSpeed = paramKey === 'simulationSpeed' ? defaultSimParams.simulationSpeed : baseSimulationSpeed
    const comparisonSimSpeed = paramKey === 'simulationSpeed' ? comparisonSimParams.simulationSpeed : baseSimulationSpeed
    
    let lastTimestamp: number | null = null
    let defaultAccumulator = 0
    let comparisonAccumulator = 0

    // Animation function
    const animate = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }
      const frameTime = Math.min((timestamp - lastTimestamp) / 1000, 0.1) // Cap to avoid large jumps
      lastTimestamp = timestamp
      
      defaultAccumulator += frameTime
      comparisonAccumulator += frameTime

      // Clear canvases
      defaultCtx.clearRect(0, 0, canvasWidth, canvasHeight)
      comparisonCtx.clearRect(0, 0, canvasWidth, canvasHeight)

      // Draw default pendulum
      drawPendulum(
        defaultCtx,
        defaultAngle,
        defaultSimParams,
        canvasWidth,
        canvasHeight
      )

      // Draw comparison pendulum
      drawPendulum(
        comparisonCtx,
        comparisonAngle,
        comparisonSimParams,
        canvasWidth,
        canvasHeight
      )

      // Fixed time step physics update for default pendulum
      const defaultFixedDt = defaultDt * defaultSimSpeed
      
      // Perform physics updates with fixed time step for default pendulum
      while (defaultAccumulator >= defaultDt) {
        // Update default pendulum with proper damping
        const defaultGravity = Math.max(defaultSimParams.gravity, 0.01)
        const defaultLength = Math.max((defaultSimParams.length / 200) * (canvasHeight * 0.8), 1)
        const defaultDamping = defaultSimParams.damping
        
        // Apply damping to velocity first
        defaultVelocity *= (1 - defaultDamping * defaultDt)
        
        // Then apply gravity
        defaultVelocity += (-defaultGravity / defaultLength) * Math.sin(defaultAngle) * defaultFixedDt
        defaultAngle += defaultVelocity * defaultFixedDt
        
        defaultAccumulator -= defaultDt
      }

      // Fixed time step physics update for comparison pendulum
      const comparisonFixedDt = comparisonDt * comparisonSimSpeed
      
      // Perform physics updates with fixed time step for comparison pendulum
      while (comparisonAccumulator >= comparisonDt) {
        // Update comparison pendulum with proper damping
        const comparisonGravity = Math.max(comparisonSimParams.gravity, 0.01)
        const comparisonLength = Math.max((comparisonSimParams.length / 200) * (canvasHeight * 0.8), 1)
        const comparisonDamping = comparisonSimParams.damping
        
        // Apply damping to velocity first
        comparisonVelocity *= (1 - comparisonDamping * comparisonDt)
        
        // Then apply gravity
        comparisonVelocity += (-comparisonGravity / comparisonLength) * Math.sin(comparisonAngle) * comparisonFixedDt
        comparisonAngle += comparisonVelocity * comparisonFixedDt
        
        comparisonAccumulator -= comparisonDt
      }

      // Continue animation
      animationRef.current = requestAnimationFrame(animate)
    }

    // Helper function to draw a pendulum
    const drawPendulum = (
      ctx: CanvasRenderingContext2D,
      angle: number,
      simParams: typeof params,
      width: number,
      height: number
    ) => {
      // Draw anchor point
      ctx.beginPath()
      ctx.arc(width / 2, 10, 4, 0, 2 * Math.PI)
      ctx.fillStyle = "black"
      ctx.fill()

      // Calculate pendulum position
      const maxLength = Math.min(width, height) * 0.8
      const scaledLength = Math.max((simParams.length / 200) * maxLength, 1)
      const x = width / 2 + scaledLength * Math.sin(angle)
      const y = 10 + scaledLength * Math.cos(angle)

      // Draw pendulum string
      ctx.beginPath()
      ctx.moveTo(width / 2, 10)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "black"
      ctx.stroke()

      // Draw pendulum weight
      ctx.beginPath()
      ctx.arc(x, y, Math.max(simParams.mass * 8, 2), 0, 2 * Math.PI)
      ctx.fillStyle = "gray"
      ctx.fill()
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isOpen, paramKey, sliderValue, params])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Get parameter-specific content
  const getParameterDescription = () => {
    return description || "No description available."
  }

  // Format the parameter value for display
  const formatParamValue = (value: number) => {
    // For small values like timeInterval, show more decimal places
    if (value < 0.1) {
      return value.toFixed(3);
    }
    // For larger values, show fewer decimal places
    return value.toFixed(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <Card 
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-[500px] max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Description */}
          <div className="text-sm">
            <p className="mb-2">{getParameterDescription()}</p>
            {equation && (
              <div className="bg-gray-100 p-2 rounded my-2 font-mono text-center text-sm">
                {equation}
              </div>
            )}
          </div>

          {/* Simulation comparison */}
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                {/* Fixed height container for the label */}
                <div className="h-10 flex items-center justify-center">
                  <h3 className="text-xs font-medium text-center">
                    Default ({paramKey}: {formatParamValue(defaultValue)})
                  </h3>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                  <canvas 
                    ref={defaultCanvasRef} 
                    width={150} 
                    height={150}
                    className="rounded"
                  />
                </div>
              </div>
              <div>
                {/* Fixed height container for the label */}
                <div className="h-10 flex items-center justify-center">
                  <h3 className="text-xs font-medium text-center">
                    Modified ({paramKey}: {formatParamValue(sliderValue)})
                  </h3>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 flex justify-center">
                  <canvas 
                    ref={comparisonCanvasRef} 
                    width={150} 
                    height={150}
                    className="rounded"
                  />
                </div>
              </div>
            </div>

            {/* Slider for adjusting the comparison value */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 capitalize">{paramKey}</label>
                <span className="text-sm">{formatParamValue(sliderValue)}</span>
              </div>
              <Slider
                value={[sliderValue]}
                min={minValue}
                max={maxValue}
                step={step}
                onValueChange={(values) => {
                  if (values.length > 0) {
                    setSliderValue(values[0])
                  }
                }}
                className="bg-[#e6fff0]"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 