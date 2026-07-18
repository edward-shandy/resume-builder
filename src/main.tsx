// NOTE: StrictMode is intentionally disabled — its dev-only double-mount makes
// @react-three/fiber force-lose the WebGL context on the reused <canvas>, which
// permanently blanks the 3D scene in dev.
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<App />)
