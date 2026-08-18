import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface StatTileProps {
  icon: string
  label: string
  value: string
}

export function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <Card sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
      <Box
        aria-hidden="true"
        sx={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.light',
          fontSize: 18,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Card>
  )
}
