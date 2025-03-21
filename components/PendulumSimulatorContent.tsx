"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Settings, Play, Pause, RotateCcw, Upload, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useZoomAndPan } from "../hooks/useZoomAndPan"
import { SettingsPanel } from "./SettingsPanel"
import { ZoomControls } from "./ZoomControls"
import { CodePanel } from "./CodePanel"
import { PendulumVisualization } from "./PendulumVisualization"
import { ImageSettingsModal } from "./ImageSettingsModal"
import { useSimulator } from "../context/SimulatorContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Main component for the pendulum simulator
 */
export default function PendulumSimulatorContent() {
  // UI state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isCodeOpen, setIsCodeOpen] = useState(false)
  const [isImageSettingsOpen, setIsImageSettingsOpen] = useState(false)
  
  // Simulation state
  const { resetParams, params, isPlaying, setIsPlaying } = useSimulator()
  
  // Image state
  const [ballImage, setBallImage] = useState<string | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  
  // Canvas state
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 })
  const [resetTrigger, setResetTrigger] = useState(0)

  // References
  const containerRef = useRef<HTMLDivElement>(null)

  // Zoom and pan functionality
  const { zoom, pan, isDragging, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, setZoom, setPan } =
    useZoomAndPan()

  /**
   * Handle file upload for ball or background images
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "ball" | "background") => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === "ball") {
          setBallImage(reader.result as string)
          // Open image settings modal when a ball image is uploaded
          setIsImageSettingsOpen(true)
        } else {
          setBackgroundImage(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
    event.target.value = ""
  }

  /**
   * Update canvas size when container size changes
   */
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setCanvasSize({ width: width * 0.8, height: height * 0.8 })
      }
    }
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  /**
   * Reset the pendulum simulation
   */
  const handleReset = () => {
    setIsPlaying(false)
    resetParams()
    setResetTrigger((prev) => prev + 1)
  }

  return (
    <div
      className="min-h-screen bg-[#f3fff8]"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover" } : {}}
    >
      {/* Panels */}
      <CodePanel isOpen={isCodeOpen} onToggle={() => setIsCodeOpen(!isCodeOpen)} resetTrigger={resetTrigger} zoom={zoom} />
      <ImageSettingsModal isOpen={isImageSettingsOpen} onClose={() => setIsImageSettingsOpen(false)} />
      
      <main className="relative h-screen flex flex-col items-center justify-center p-4">
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
          {/* Ball Image Controls */}
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => document.getElementById("ball-upload")?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload ball image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {ballImage && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setIsImageSettingsOpen(true)}>
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Adjust image settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => setBallImage(null)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove ball image</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
          
          {/* Background Image Controls */}
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => document.getElementById("background-upload")?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload background image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {backgroundImage && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => setBackgroundImage(null)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove background image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          {/* Settings Button */}
          <div className="transition-all duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-[#e6fff0]"
            >
              <Settings className={`h-5 w-5 transition-all duration-300 ${isSettingsOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        <div
          className={`absolute top-[73px] right-4 z-30 w-72 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 ${
            isSettingsOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <SettingsPanel isOpen={isSettingsOpen} />
        </div>

        {/* Play/Reset Controls */}
        <div className="mb-4 z-30">
          <Button onClick={() => setIsPlaying(!isPlaying)} className="mr-2">
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* File Upload Inputs (hidden) */}
        <input id="ball-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "ball")} />
        <input id="background-upload" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "background")} />

        {/* Pendulum Visualization */}
        <div
          ref={containerRef}
          className="relative flex-grow w-full max-w-3xl mx-auto flex items-center justify-center overflow-hidden cursor-move transition-all duration-300"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${isSettingsOpen ? zoom * 0.9 : zoom})`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
          >
            <PendulumVisualization
              ballImage={ballImage}
              width={canvasSize.width}
              height={canvasSize.height}
              resetTrigger={resetTrigger}
            />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="mt-4 z-30">
          <ZoomControls
            onZoomIn={() => setZoom((z) => Math.min(5, z + 0.1))}
            onZoomOut={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            onReset={() => {
              setZoom(1)
              setPan({ x: 0, y: 0 })
            }}
          />
        </div>

        {/* Zoom Percentage Display */}
        <div 
          className={`
            absolute bottom-4 bg-white/80 backdrop-blur-sm rounded px-2 py-1 text-sm z-30
            transition-all duration-300 ease-in-out
            ${isCodeOpen ? 'left-[460px]' : 'left-4'}
          `}
        >
          Zoom: {(zoom * 100).toFixed(0)}%
        </div>
      </main>
    </div>
  )
}
