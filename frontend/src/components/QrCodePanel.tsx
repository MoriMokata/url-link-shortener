import { useRef } from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import { QRCodeCanvas } from 'qrcode.react'

interface QrCodePanelProps {
  url: string
  fileName: string
}

/** Permanent QR panel shown on the link detail page, with a PNG download. */
export function QrCodePanel({ url, fileName }: QrCodePanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${fileName}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h3" sx={{ mb: 2, fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' }}>
        QR Code
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
        <QRCodeCanvas ref={canvasRef} value={url} size={160} />
      </Box>
      <Button variant="outlined" fullWidth startIcon={<DownloadRoundedIcon />} onClick={handleDownload}>
        ดาวน์โหลด QR
      </Button>
    </Card>
  )
}
