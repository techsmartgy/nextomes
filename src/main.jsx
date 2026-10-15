import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'

// The admin portal is a separate bundle with its own styles
const Root = location.pathname.startsWith('/admin')
  ? lazy(() => import('./admin/Admin.jsx'))
  : lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
