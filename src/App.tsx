import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'

// Code-split: the builder chunk (wizard steps, resume templates) is only
// fetched when someone actually navigates to /builder.
const BuilderPage = lazy(() => import('./pages/BuilderPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ink">
      <span className="label-readout text-gold/70">Charting a course // Loading builder</span>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/builder"
          element={
            <Suspense fallback={<RouteFallback />}>
              <BuilderPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
