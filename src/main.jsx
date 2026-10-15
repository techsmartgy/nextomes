import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { ASSESS_PATH } from './constants.js'

// The admin portal and the assessment form are separate bundles from the marketing site
const path = location.pathname.replace(/\/+$/, '')
const Root = path.startsWith('/admin')
  ? lazy(() => import('./admin/Admin.jsx'))
  : path === ASSESS_PATH
    ? lazy(() => import('./assess/AssessPage.jsx'))
    : lazy(() => import('./App.jsx'))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Root />
    </Suspense>
  </StrictMode>,
)
