"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { useSimulator } from "../context/SimulatorContext"

interface PendulumVisualizationProps {
  ballImage: string | null
  width: number
  height: number
  resetTrigger: number
}

/**
 * Component that renders the pendulum visualization on a canvas
 */
export const PendulumVisualization: React.FC<PendulumVisualizationProps> = ({
  ballImage,
  width,
  height,
  resetTrigger,
}) => {
  const { params, isPlaying, imageSettings } = useSimulator()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [angle, setAngle] = useState(params.currentAngle)
  const [angleVelocity, setAngleVelocity] = useState(params.currentVelocity)

  // Use a ref for isPlaying to avoid reinitializing the animation loop
  const isPlayingRef = useRef(isPlaying)
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Reset angle and velocity when starting angle changes or reset is triggered
  useEffect(() => {
    setAngle(params.currentAngle)
    setAngleVelocity(params.currentVelocity)
  }, [params.currentAngle, params.currentVelocity, resetTrigger])

  // Main animation and physics simulation effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize simulation state
    let currentAngle = (params.startingAngle * Math.PI) / 180
    let currentVelocity = 0
    const dt = Math.max(params.timeInterval, 0.001)  // Ensure dt is never too small
    const simulationSpeed = Math.max(params.simulationSpeed, 0.1)  // Ensure speed is never too small
    let accumulator = 0

    let animationId: number
    let lastTimestamp: number | null = null

    /**
     * Main animation loop function
     * @param timestamp - Current animation frame timestamp
     */
    const draw = (timestamp: number) => {
      if (!ctx) return

      // Initialize timestamp on first frame
      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }
      const frameTime = (timestamp - lastTimestamp) / 1000

      // Handle simulation timing
      if (!isPlayingRef.current) {
        // When paused, update the timestamp but do not integrate
        lastTimestamp = timestamp
      } else {
        accumulator += frameTime
        lastTimestamp = timestamp
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw anchor point
      ctx.beginPath()
      ctx.arc(canvas.width / 2, 10, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "black"
      ctx.fill()

      // Calculate pendulum position
      const maxLength = Math.min(canvas.width, canvas.height) * 0.8
      const scaledLength = Math.max((params.length / 200) * maxLength, 1)  // Ensure length is never zero
      const x = canvas.width / 2 + scaledLength * Math.sin(currentAngle)
      const y = 10 + scaledLength * Math.cos(currentAngle)

      // Draw pendulum string
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, 10)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "black"
      ctx.stroke()

      // Draw pendulum weight
      ctx.save()
      ctx.translate(x, y)
      
      // Apply pendulum physics rotation
      ctx.rotate(-(currentAngle - Math.PI / 2))
      
      if (ballImage) {
        // Draw custom image for weight
        const img = new Image()
        img.src = ballImage
        const baseSize = Math.max(params.mass * 20, 5)  // Ensure size is never too small
        
        // Apply user-defined rotation and scale
        ctx.rotate(imageSettings.rotation * Math.PI / 180)
        const size = baseSize * Math.max(imageSettings.scale, 0.1)  // Ensure scale is never too small
        
        ctx.drawImage(img, -size / 2, -size / 2, size, size)
      } else {
        // Draw default circle for weight
        ctx.beginPath()
        ctx.arc(0, 0, Math.max(params.mass * 10, 2), 0, 2 * Math.PI)  // Ensure radius is never too small
        ctx.fillStyle = "gray"
        ctx.fill()
      }
      ctx.restore()

      // Physics integration
      if (isPlayingRef.current) {
        // Perform fixed-step integration updates
        while (accumulator >= dt) {
          try {
            if (params.damping === 0) {
              // Semi-implicit Euler integration for zero damping (more efficient)
              const gravity = Math.max(params.gravity, 0.01)  // Ensure gravity is never too small
              currentVelocity += (-gravity / scaledLength) * Math.sin(currentAngle) * dt * simulationSpeed
              currentAngle += currentVelocity * dt * simulationSpeed
            } else {
              // RK4 integration for damping (more accurate)
              const effectiveDT = dt * simulationSpeed
              const gravity = Math.max(params.gravity, 0.01)  // Ensure gravity is never too small
              
              const acceleration = (theta: number, omega: number) =>
                (-gravity / scaledLength) * Math.sin(theta) - params.damping * omega

              // RK4 integration steps
              const k1Angle = currentVelocity
              const k1Omega = acceleration(currentAngle, currentVelocity)

              const k2Angle = currentVelocity + k1Omega * effectiveDT / 2
              const k2Omega = acceleration(currentAngle + k1Angle * effectiveDT / 2, currentVelocity + k1Omega * effectiveDT / 2)

              const k3Angle = currentVelocity + k2Omega * effectiveDT / 2
              const k3Omega = acceleration(currentAngle + k2Angle * effectiveDT / 2, currentVelocity + k2Omega * effectiveDT / 2)

              const k4Angle = currentVelocity + k3Omega * effectiveDT
              const k4Omega = acceleration(currentAngle + k3Angle * effectiveDT, currentVelocity + k3Omega * effectiveDT)

              // Combine RK4 steps
              currentAngle = currentAngle + (effectiveDT / 6) * (k1Angle + 2 * k2Angle + 2 * k3Angle + k4Angle)
              currentVelocity = currentVelocity + (effectiveDT / 6) * (k1Omega + 2 * k2Omega + 2 * k3Omega + k4Omega)
            }
          } catch (error) {
            console.error("Physics calculation error:", error)
            // If there's an error in the physics calculation, just skip this step
          }
          
          accumulator -= dt
        }
        
        // Update state with the new simulation values
        setAngle(currentAngle)
        setAngleVelocity(currentVelocity)
        params.currentAngle = currentAngle
        params.currentVelocity = currentVelocity
      }

      // Continue animation loop
      animationId = requestAnimationFrame(draw)
    }

    // Start animation loop
    animationId = requestAnimationFrame(draw)
    
    // Clean up animation on unmount
    return () => cancelAnimationFrame(animationId)
  }, [params, ballImage, width, height, resetTrigger, imageSettings])

  return <canvas ref={canvasRef} width={width} height={height} style={{ maxWidth: "100%", maxHeight: "100%" }} />
}
