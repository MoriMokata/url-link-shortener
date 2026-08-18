import { Route, Routes } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { CreateLinkPage } from './pages/CreateLinkPage'
import { DashboardPage } from './pages/DashboardPage'
import { LinkDetailPage } from './pages/LinkDetailPage'

function App() {
  return (
    <div className="page">
      <AppHeader />
      <div className="page-body">
        <Routes>
          <Route path="/" element={<CreateLinkPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/links/:code" element={<LinkDetailPage />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
