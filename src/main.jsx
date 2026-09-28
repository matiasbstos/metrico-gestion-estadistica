import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-recarga transparente ante nuevos despliegues de versión (Vite Dynamic Import Recovery)
window.addEventListener('vite:preloadError', (event) => {
  console.warn('MÉTRICO: Nueva versión detectada en el servidor. Actualizando aplicación...', event);
  window.location.reload();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
