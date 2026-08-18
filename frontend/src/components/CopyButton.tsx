import { useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'

interface CopyButtonProps {
  text: string
  label?: string
  iconOnly?: boolean
  size?: 'small' | 'medium'
}

export function CopyButton({ text, label = 'คัดลอกลิงก์', iconOnly = false, size = 'medium' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  return (
    <>
      {iconOnly ? (
        <Tooltip title={label}>
          <IconButton size={size} onClick={handleClick}>
            <ContentCopyRoundedIcon fontSize={size === 'small' ? 'small' : 'medium'} />
          </IconButton>
        </Tooltip>
      ) : (
        <Button variant="outlined" size={size} startIcon={<ContentCopyRoundedIcon />} onClick={handleClick}>
          {label}
        </Button>
      )}
      <Snackbar
        open={copied}
        autoHideDuration={1500}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="คัดลอกแล้ว!"
      />
    </>
  )
}
