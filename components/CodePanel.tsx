import type React from "react"
import { ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useSimulator } from "../context/SimulatorContext"

export const CodePanel: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const { params, isPlaying } = useSimulator()
  const [angle, setAngle] = useState(0)
  const [angleVelocity, setAngleVelocity] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle(params.currentAngle)
      setAngleVelocity(params.currentVelocity)
    }, 10) // Update every 10ms

    return () => clearInterval(interval)
  }, [params])

  return (
    <div
      className={`
      fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-20
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
    `}
    >
      <div className="w-[400px] h-full bg-white p-4">
        <div className="font-mono text-sm space-y-2">
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Active Angle</h3>
            <p>{angle.toFixed(2)} radians</p>
            <p>{(angle * (180 / Math.PI)).toFixed(2)} degrees</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold">Active Velocity</h3>
            <p>{angleVelocity.toFixed(2)} rad/s</p>
            <p>{(angleVelocity * (180 / Math.PI)).toFixed(2)} deg/s</p>
          </div>
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
