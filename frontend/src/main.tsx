import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(rootElement)

// Definition der App mit Router
const AppWithRouter = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// Typ-Definitionen für TypeScript, damit es nicht meckert
interface ImportMetaEnv {
  DEV?: boolean
}

interface ImportMeta {
  env?: ImportMetaEnv
}

// Prüfung, ob wir im Development-Modus sind
const isDev =
  process.env.NODE_ENV === 'development' ||
  (typeof import.meta !== 'undefined' && (import.meta as unknown as ImportMeta).env?.DEV)

// Rendering: StrictMode nur im Development
if (isDev) {
  root.render(<React.StrictMode>{AppWithRouter}</React.StrictMode>)
} else {
  root.render(AppWithRouter)
}
