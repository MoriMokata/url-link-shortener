import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface QrCodeButtonProps {
  url: string
  className?: string
}

/** Compact toggle button used in the table/card rows — opens a small QR popover. */
export function QrCodeButton({ url, className = 'btn btn-sm btn-icon' }: QrCodeButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" className={className} title="QR Code" onClick={() => setOpen((v) => !v)}>
        ⊞
      </button>
      {open && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            zIndex: 20,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <QRCodeSVG value={url} size={128} />
          <button type="button" className="btn btn-sm" onClick={() => setOpen(false)}>
            ปิด
          </button>
        </div>
      )}
    </div>
  )
}
