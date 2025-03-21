import type React from "react"
import { ChevronRight } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useSimulator } from "../context/SimulatorContext"

export const CodePanel: React.FC<{ 
  isOpen: boolean; 
  onToggle: () => void; 
  resetTrigger?: number;
  zoom?: number;
}> = ({ 
  isOpen, 
  onToggle,
  resetTrigger = 0,
  zoom = 1
}) => {
  const { params, isPlaying } = useSimulator()
  const [angle, setAngle] = useState(params.currentAngle)
  const [angleVelocity, setAngleVelocity] = useState(params.currentVelocity)
  const [previousAngle, setPreviousAngle] = useState(params.currentAngle)
  const [previousVelocity, setPreviousVelocity] = useState(params.currentVelocity)
  const [calculationSteps, setCalculationSteps] = useState<{
    description: string;
    equation: string;
    calculation: string;
    result: string;
  }[]>([])
  
  // Flag to track if initial calculations have been generated
  const initialCalculationsGenerated = useRef(false)

  // Update angle and velocity values and calculate physics steps
  useEffect(() => {
    // Force initial calculation generation
    if (!initialCalculationsGenerated.current) {
      updateCalculationSteps(
        params.currentAngle,
        params.currentVelocity,
        params.currentAngle, // Use current as previous for initial calculation
        params.currentVelocity,
        params
      )
      initialCalculationsGenerated.current = true
    }

    const interval = setInterval(() => {
      // Always update the angle and velocity from params
      setPreviousAngle(angle)
      setPreviousVelocity(angleVelocity)
      setAngle(params.currentAngle)
      setAngleVelocity(params.currentVelocity)
      
      // Always generate calculation steps, even if values haven't changed
      updateCalculationSteps(
        params.currentAngle, 
        params.currentVelocity, 
        previousAngle, 
        previousVelocity, 
        params
      )
    }, 100) // Update every 100ms for better performance

    return () => clearInterval(interval)
  }, [params, angle, angleVelocity, previousAngle, previousVelocity])

  // Reset angle and velocity when resetTrigger changes
  useEffect(() => {
    setAngle(params.currentAngle)
    setAngleVelocity(params.currentVelocity)
    setPreviousAngle(params.currentAngle)
    setPreviousVelocity(params.currentVelocity)
    
    // Generate new calculation steps on reset instead of clearing
    updateCalculationSteps(
      params.currentAngle,
      params.currentVelocity,
      params.currentAngle, // Use current as previous for reset calculation
      params.currentVelocity,
      params
    )
  }, [resetTrigger, params.currentAngle, params.currentVelocity])

  // Generate calculation steps based on current physics state
  const updateCalculationSteps = (
    currentAngle: number,
    currentVelocity: number,
    prevAngle: number,
    prevVelocity: number,
    params: any
  ) => {
    const dt = params.timeInterval
    const simulationSpeed = params.simulationSpeed
    const effectiveDT = dt * simulationSpeed
    const gravity = params.gravity
    const length = params.length / 100 // Convert to meters for physics calculations
    const damping = params.damping
    
    const steps = []
    
    // Step 1: Initial values
    steps.push({
      description: "Initial state of the pendulum",
      equation: "θ(t), ω(t)",
      calculation: `θ(t) = ${prevAngle.toFixed(4)} rad, ω(t) = ${prevVelocity.toFixed(4)} rad/s`,
      result: "These are the current angle and angular velocity"
    })
    
    // Step 2: Time step information
    steps.push({
      description: "Time step calculation",
      equation: "Δt = timeInterval × simulationSpeed",
      calculation: `Δt = ${dt.toFixed(4)} × ${simulationSpeed.toFixed(1)} = ${effectiveDT.toFixed(4)} s`,
      result: "This is how much simulation time passes in each calculation step"
    })
    
    if (damping === 0) {
      // Step 3: Acceleration calculation (no damping)
      const acceleration = (-gravity / length) * Math.sin(prevAngle)
      steps.push({
        description: "Angular acceleration calculation (no damping)",
        equation: "α = -(g/L) × sin(θ)",
        calculation: `α = -(${gravity.toFixed(2)}/${length.toFixed(2)}) × sin(${prevAngle.toFixed(4)}) = ${acceleration.toFixed(4)} rad/s²`,
        result: "This is the angular acceleration due to gravity"
      })
      
      // Step 4: Velocity update
      const velocityChange = acceleration * effectiveDT
      const newVelocity = prevVelocity + velocityChange
      steps.push({
        description: "Update angular velocity",
        equation: "ω(t+Δt) = ω(t) + α × Δt",
        calculation: `ω(t+Δt) = ${prevVelocity.toFixed(4)} + ${acceleration.toFixed(4)} × ${effectiveDT.toFixed(4)} = ${newVelocity.toFixed(4)} rad/s`,
        result: "The new angular velocity after applying acceleration"
      })
      
      // Step 5: Position update
      const angleChange = prevVelocity * effectiveDT
      const newAngle = prevAngle + angleChange
      steps.push({
        description: "Update angle position",
        equation: "θ(t+Δt) = θ(t) + ω(t) × Δt",
        calculation: `θ(t+Δt) = ${prevAngle.toFixed(4)} + ${prevVelocity.toFixed(4)} × ${effectiveDT.toFixed(4)} = ${newAngle.toFixed(4)} rad`,
        result: "The new angle after applying velocity"
      })
    } else {
      // Step 3: Acceleration function with damping
      const acceleration = (-gravity / length) * Math.sin(prevAngle) - damping * prevVelocity
      steps.push({
        description: "Angular acceleration with damping",
        equation: "α = -(g/L) × sin(θ) - b × ω",
        calculation: `α = -(${gravity.toFixed(2)}/${length.toFixed(2)}) × sin(${prevAngle.toFixed(4)}) - ${damping.toFixed(3)} × ${prevVelocity.toFixed(4)} = ${acceleration.toFixed(4)} rad/s²`,
        result: "This calculates acceleration with both gravity and damping"
      })
      
      // Step 4: RK4 integration explanation
      steps.push({
        description: "Integration",
        equation: "RK4 method",
        calculation: "k₁, k₂, k₃, k₄ calculated for both angle and velocity",
        result: "RK4 provides more accurate results than simple Euler integration"
      })
      
      // Step 5: Final RK4 result
      steps.push({
        description: "Final integration result",
        equation: "θ(t+Δt) = θ(t) + (Δt/6) × (k₁ + 2k₂ + 2k₃ + k₄)",
        calculation: `θ(t+Δt) = ${prevAngle.toFixed(4)} → ${currentAngle.toFixed(4)} rad`,
        result: `ω(t+Δt) = ${prevVelocity.toFixed(4)} → ${currentVelocity.toFixed(4)} rad/s`
      })
    }
    
    // Energy calculation removed as requested
    
    // Only update if we have valid steps
    if (steps.length > 0) {
      setCalculationSteps(steps)
    }
  }

  return (
    <div
      className={`
      fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-20
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div className="w-[450px] h-full bg-white p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Physics Calculations</h2>
        
        {/* Current state display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Angle</h3>
            <p className="font-mono">{angle.toFixed(4)} radians</p>
            <p className="font-mono">{(angle * (180 / Math.PI)).toFixed(2)}° degrees</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Velocity</h3>
            <p className="font-mono">{angleVelocity.toFixed(4)} rad/s</p>
            <p className="font-mono">{(angleVelocity * (180 / Math.PI)).toFixed(2)}° deg/s</p>
          </div>
        </div>
        
        {/* Parameter summary */}
        <div className="bg-blue-50 p-3 rounded-lg shadow-md mb-6">
          <h3 className="text-md font-semibold mb-2">Simulation Parameters</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Length: {params.length} cm</div>
            <div>Mass: {params.mass} kg</div>
            <div>Gravity: {params.gravity} m/s²</div>
            <div>Damping: {params.damping}</div>
            <div>Time Step: {params.timeInterval} s</div>
            <div>Sim Speed: {params.simulationSpeed}x</div>
          </div>
        </div>
        
        {/* Calculation steps */}
        <h3 className="text-lg font-semibold mb-2">Step-by-Step Calculation</h3>
        <div className="space-y-4">
          {calculationSteps.length > 0 ? (
            <>
              {calculationSteps.map((step, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="font-semibold text-sm text-gray-700 mb-1">Step {index + 1}: {step.description}</div>
                  <div className="bg-white p-2 rounded font-mono text-sm mb-1">{step.equation}</div>
                  <div className="bg-gray-100 p-2 rounded font-mono text-xs mb-1">{step.calculation}</div>
                  <div className="text-xs text-gray-600 italic">{step.result}</div>
                </div>
              ))}
              {!isPlaying && (
                <div className="bg-yellow-50 p-2 rounded-lg text-center mt-2">
                  <p className="text-sm">Simulation is paused. These calculations show the last physics update.</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p>Initializing calculations... If this persists, try adjusting the pendulum parameters.</p>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={onToggle}
        className="absolute right-0 top-1/2 translate-x-full -translate-y-1/2 
                   bg-white shadow-lg rounded-r-lg p-2 hover:bg-mint-50"
      >
        <ChevronRight
          className={`h-5 w-5 text-gray-600 transition-transform duration-300
          ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  )
}
