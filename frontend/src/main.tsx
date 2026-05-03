import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/authContext.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
<BrowserRouter>
<AuthProvider>
    <App />
  </AuthProvider>
</BrowserRouter>
)
