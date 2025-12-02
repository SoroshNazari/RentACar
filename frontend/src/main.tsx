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

// StrictMode nur im Development für bessere Performance in Production
const AppWithRouter = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// Check if we're in development mode
interface ImportMetaEnv {
  DEV?: boolean
}

interface ImportMeta {
  env?: ImportMetaEnv
}

const isDev =
  process.env.NODE_ENV === 'development' ||
  (typeof import.meta !== 'undefined' && (import.meta as ImportMeta).env?.DEV)

if (isDev) {
  root.render(<React.StrictMode>{AppWithRouter}</React.StrictMode>)
} else {
  root.render(AppWithRouter)
}

  <BrowserRouter>
    <App />
  </BrowserRouter>
)

// Check if we're in development mode
interface ImportMetaEnv {
  DEV?: boolean
}

interface ImportMeta {
  env?: ImportMetaEnv
}

const isDev =
  process.env.NODE_ENV === 'development' ||
  (typeof import.meta !== 'undefined' && (import.meta as ImportMeta).env?.DEV)

if (isDev) {
  root.render(<React.StrictMode>{AppWithRouter}</React.StrictMode>)
} else {
  root.render(AppWithRouter)
}
