import { NavLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'

export function AppHeader() {
  return (
    <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 3, minHeight: 64 }}>
          <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
              <LinkRoundedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h2" component="span" sx={{ fontSize: '1.2rem' }}>
                gul.fy
              </Typography>
            </Box>
          </NavLink>

          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <Button
              component={NavLink}
              to="/"
              end
              sx={{
                color: 'text.secondary',
                '&.active': { color: 'primary.dark', bgcolor: 'primary.light' },
              }}
            >
              สร้างลิงก์
            </Button>
            <Button
              component={NavLink}
              to="/dashboard"
              sx={{
                color: 'text.secondary',
                '&.active': { color: 'primary.dark', bgcolor: 'primary.light' },
              }}
            >
              แดชบอร์ด
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
