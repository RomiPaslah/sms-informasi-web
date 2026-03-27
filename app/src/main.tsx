import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;background:#f9fafb"><div style="background:white;padding:40px;border-radius:8px;text-align:center;max-width:400px"><h1 style="color:#dc2626">Root element not found</h1><p>Check index.html has &lt;div id="root"&gt;&lt;/div&gt;</p></div></div>'
  throw new Error('Root element missing')
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (error) {
  console.error('[App Load Error]', error)
  document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f9fafb"><div style="background:white;padding:40px;border-radius:8px;text-align:center;max-width:500px"><h1 style="color:#dc2626">Application Error</h1><p style="color:#6b7280">Failed to load. Check F12 Console for details.</p><button onclick="location.reload()" style="padding:10px 20px;background:#dc2626;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:20px">Reload</button></div></div>'
}
