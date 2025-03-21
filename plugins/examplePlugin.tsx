import type { Plugin } from "./PluginInterface"
import React from 'react';

export const examplePlugin: Plugin = {
  name: "Example Plugin",
  init: (context) => {
    // Initialize plugin, e.g., add event listeners, modify context
  },
  render: () => {
    // Return React component to be rendered
    return <div>Example Plugin Content</div>
  },
}
