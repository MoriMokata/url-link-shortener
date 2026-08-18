import { useRef } from 'react'
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
    <div className="card card-pad">
      <h3 style={{ marginBottom: 16 }}>QR CODE</h3>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <QRCodeCanvas ref={canvasRef} value={url} size={160} />
      </div>
      <button type="button" className="btn btn-block" onClick={handleDownload}>
        ⭳ ดาวน์โหลด QR
      </button>
    </div>
  )
}
