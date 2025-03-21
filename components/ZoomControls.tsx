import type React from "react"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

type ZoomControlsProps = {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => (
  <div className="absolute bottom-4 right-4 flex space-x-2">
    <Button
      variant="outline"
      size="icon"
      onClick={onZoomOut}
      className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-[#e6fff0]"
    >
      <ZoomOut className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={onZoomIn}
      className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-[#e6fff0]"
    >
      <ZoomIn className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      onClick={onReset}
      className="bg-white/80 backdrop-blur-sm shadow-md hover:bg-[#e6fff0]"
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
  </div>
)

