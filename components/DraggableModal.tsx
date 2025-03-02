import React, { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

interface DraggableModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  initialPosition?: { x: number, y: number }
}

export const DraggableModal: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  initialPosition = { x: 50, y: 50 }
}) => {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)
  const hasInitializedRef = useRef(false)

  // Set initial position only when modal first opens
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      setPosition(initialPosition)
      hasInitializedRef.current = true
    } else if (!isOpen) {
      // Reset the initialization flag when modal closes
      hasInitializedRef.current = false
    }
  }, [isOpen, initialPosition])

  // Handle mouse down on header to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  // Handle mouse move to update position during dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add and remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
    >
      <Card
        ref={modalRef}
        className="absolute shadow-lg bg-white pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '320px',
        }}
      >
        {/* Modal Header - Draggable */}
        <div 
          className="p-3 border-b flex justify-between items-center cursor-move bg-gray-50"
          onMouseDown={handleMouseDown}
        >
          <h3 className="font-medium">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-4">
          {children}
        </div>
      </Card>
    </div>
  )
} 