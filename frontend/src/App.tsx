import { Route, Routes } from 'react-router-dom'
import Box from '@mui/material/Box'
import { AppHeader } from './components/AppHeader'
import { CreateLinkPage } from './pages/CreateLinkPage'
import { DashboardPage } from './pages/DashboardPage'
import { LinkDetailPage } from './pages/LinkDetailPage'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Box sx={{ flex: 1, pb: 8 }}>
        <Routes>
          <Route path="/" element={<CreateLinkPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/links/:code" element={<LinkDetailPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
