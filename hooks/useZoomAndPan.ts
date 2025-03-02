"use client"

import type React from "react"
import { useState, useCallback } from "react"

/**
 * Custom hook for handling zoom and pan functionality
 * 
 * Provides state and handlers for implementing zoom and pan interactions
 * on any component, particularly useful for canvas-based visualizations.
 */
export const useZoomAndPan = () => {
  // State for zoom level and pan position
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  /**
   * Handle mouse down event to start dragging
   */
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    },
    [pan],
  )

  /**
   * Handle mouse move event to update pan position during dragging
   */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    },
    [isDragging, dragStart],
  )

  /**
   * Handle mouse up event to end dragging
   */
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  /**
   * Handle mouse wheel event to zoom in/out
   */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((prevZoom) => Math.max(0.5, Math.min(5, prevZoom - e.deltaY * 0.001)))
  }, [])

  /**
   * Reset zoom and pan to default values
   */
  const resetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resetView,
  }
}

