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

export const PendulumVisualization: React.FC<PendulumVisualizationProps> = ({
  ballImage,
  width,
  height,
  resetTrigger,
}) => {
  const { params, isPlaying } = useSimulator()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [angle, setAngle] = useState((params.startingAngle * Math.PI) / 180)
  const [angleVelocity, setAngleVelocity] = useState(0)

  // Create a ref to always have the latest isPlaying value without reinitializing the simulation.
  const isPlayingRef = useRef(isPlaying)
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    setAngle((params.startingAngle * Math.PI) / 180)
    setAngleVelocity(0)
  }, [params.startingAngle, resetTrigger])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Initialize simulation state variables using a fixed time step.
    let currentAngle = (params.startingAngle * Math.PI) / 180
    let currentVelocity = 0
    const dt = params.timeInterval  // fixed simulation time step
    const simulationSpeed = params.simulationSpeed
    let accumulator = 0

    let animationId: number
    let lastTimestamp: number | null = null

    const draw = (timestamp: number) => {
      if (!ctx) return

      if (lastTimestamp === null) {
        lastTimestamp = timestamp
      }
      const frameTime = (timestamp - lastTimestamp) / 1000

      if (!isPlayingRef.current) {
        // When paused, update the timestamp but do not integrate.
        lastTimestamp = timestamp
      } else {
        accumulator += frameTime
        lastTimestamp = timestamp
      }

      // Clear canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw anchor point.
      ctx.beginPath()
      ctx.arc(canvas.width / 2, 10, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "black"
      ctx.fill()

      // Calculate pendulum position using current simulation state.
      const maxLength = Math.min(canvas.width, canvas.height) * 0.8
      const scaledLength = (params.length / 200) * maxLength
      const x = canvas.width / 2 + scaledLength * Math.sin(currentAngle)
      const y = 10 + scaledLength * Math.cos(currentAngle)

      // Draw pendulum string.
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2, 10)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "black"
      ctx.stroke()

      // Draw pendulum ball.
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-(currentAngle - Math.PI / 2))

      if (ballImage) {
        const img = new Image()
        img.src = ballImage
        const size = params.mass * 20
        ctx.drawImage(img, -size / 2, -size / 2, size, size)
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, params.mass * 10, 0, 2 * Math.PI)
        ctx.fillStyle = "gray"
        ctx.fill()
      }
      ctx.restore()

      if (isPlayingRef.current) {
        // Perform fixed-step integration updates only if playing.
        while (accumulator >= dt) {
          if (params.damping === 0) {
            // Semi-implicit Euler integration for zero damping.
            currentVelocity += (-params.gravity / scaledLength) * Math.sin(currentAngle) * dt * simulationSpeed
            currentAngle += currentVelocity * dt * simulationSpeed
          } else {
            // RK4 integration for damping.
            const effectiveDT = dt * simulationSpeed
            const acceleration = (theta: number, omega: number) =>
              (-params.gravity / scaledLength) * Math.sin(theta) - params.damping * omega

            const k1Angle = currentVelocity
            const k1Omega = acceleration(currentAngle, currentVelocity)

            const k2Angle = currentVelocity + k1Omega * effectiveDT / 2
            const k2Omega = acceleration(currentAngle + k1Angle * effectiveDT / 2, currentVelocity + k1Omega * effectiveDT / 2)

            const k3Angle = currentVelocity + k2Omega * effectiveDT / 2
            const k3Omega = acceleration(currentAngle + k2Angle * effectiveDT / 2, currentVelocity + k2Omega * effectiveDT / 2)

            const k4Angle = currentVelocity + k3Omega * effectiveDT
            const k4Omega = acceleration(currentAngle + k3Angle * effectiveDT, currentVelocity + k3Omega * effectiveDT)

            currentAngle = currentAngle + (effectiveDT / 6) * (k1Angle + 2 * k2Angle + 2 * k3Angle + k4Angle)
            currentVelocity = currentVelocity + (effectiveDT / 6) * (k1Omega + 2 * k2Omega + 2 * k3Omega + k4Omega)
          }
          accumulator -= dt
        }
        // Update state with the new simulation values.
        setAngle(currentAngle);
        setAngleVelocity(currentVelocity);
        params.currentAngle = currentAngle;
        params.currentVelocity = currentVelocity;
      }

      animationId = requestAnimationFrame(draw)
    }

    animationId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animationId)
  }, [params, ballImage, width, height, resetTrigger])

  return <canvas ref={canvasRef} width={width} height={height} style={{ maxWidth: "100%", maxHeight: "100%" }} />
}
