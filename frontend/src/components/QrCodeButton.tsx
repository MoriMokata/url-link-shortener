import { useState } from 'react'
import type { MouseEvent } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Popover from '@mui/material/Popover'
import Box from '@mui/material/Box'
import { QRCodeSVG } from 'qrcode.react'
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded'

interface QrCodeButtonProps {
  url: string
  size?: 'small' | 'medium'
}

/** Compact toggle button used in the table/card rows — opens a small QR popover. */
export function QrCodeButton({ url, size = 'medium' }: QrCodeButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <>
      <Tooltip title="QR Code">
        <IconButton size={size} onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}>
          <QrCode2RoundedIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
          <QRCodeSVG value={url} size={140} />
        </Box>
      </Popover>
    </>
  )
}
