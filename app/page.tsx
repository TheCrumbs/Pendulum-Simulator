"use client"
import { SimulatorProvider } from "../context/SimulatorContext"
import { PluginProvider } from "../plugins/PluginManager"
import { examplePlugin } from "../plugins/examplePlugin"
import PendulumSimulatorContent from "../components/PendulumSimulatorContent"

export default function PendulumSimulator() {
  const plugins = [examplePlugin]

  return (
    <SimulatorProvider>
      <PluginProvider plugins={plugins}>
        <PendulumSimulatorContent />
      </PluginProvider>
    </SimulatorProvider>
  )
}

