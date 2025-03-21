import type React from "react"

export interface Plugin {
  name: string
  init: (context: any) => void
  render: () => React.ReactNode
}

