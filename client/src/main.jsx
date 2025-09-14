import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import { HeroUIProvider } from "@heroui/react"

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HeroUIProvider>
      <App />
    </HeroUIProvider>
  </React.StrictMode>,
);