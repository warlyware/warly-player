import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LoadingProvider } from './hooks/useLoading.tsx'
import { AudioProvider } from './contexts/AudioContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </LoadingProvider>
  </StrictMode>,
)
