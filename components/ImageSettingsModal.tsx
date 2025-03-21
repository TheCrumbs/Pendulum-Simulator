import React, { useEffect, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useSimulator } from "../context/SimulatorContext"
import { DraggableModal } from "./DraggableModal"
import { TooltipTriggerIcon } from "./TooltipTriggerIcon"

interface ImageSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ImageSettingsModal: React.FC<ImageSettingsModalProps> = ({ isOpen, onClose }) => {
  const { imageSettings, setImageSettings, resetImageSettings } = useSimulator()
  const [initialPosition, setInitialPosition] = useState({ x: 50, y: 100 })

  // Calculate initial position on client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInitialPosition({ x: window.innerWidth / 2 - 160, y: 100 })
    }
  }, [])

  const handleRotationChange = (value: number) => {
    setImageSettings((prev) => ({ ...prev, rotation: value }))
  }

  const handleScaleChange = (value: number) => {
    setImageSettings((prev) => ({ ...prev, scale: value }))
  }

  const handleSliderValueChange = (handler: (value: number) => void) => {
    return (values: number[]) => {
      if (values.length > 0) {
        handler(values[0])
      }
    }
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Image Settings"
      initialPosition={initialPosition}
    >
      <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700">Rotation</label>
              <TooltipTriggerIcon paramKey="rotation" />
            </div>
            <Input
              type="number"
              value={imageSettings.rotation}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              className="w-20 text-right"
              step={1}
            />
          </div>
          <Slider
            value={[imageSettings.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={handleSliderValueChange(handleRotationChange)}
            className="bg-[#e6fff0]"
          />
        </div>
        
        {/* Scale Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <label className="text-sm font-medium text-gray-700">Scale</label>
              <TooltipTriggerIcon paramKey="scale" />
            </div>
            <Input
              type="number"
              value={imageSettings.scale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-20 text-right"
              step={0.1}
              min={0.1}
            />
          </div>
          <Slider
            value={[imageSettings.scale]}
            min={0.1}
            max={3}
            step={0.1}
            onValueChange={handleSliderValueChange(handleScaleChange)}
            className="bg-[#e6fff0]"
          />
        </div>
        
        {/* Reset Button */}
        <Button onClick={resetImageSettings} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Image Settings
        </Button>
      </div>
    </DraggableModal>
  )
} 