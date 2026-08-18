import { useState } from 'react'
import type { FormEvent } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import type { CreateShortLinkRequest } from '../types/ShortLink'

interface LinkFormProps {
  onSubmit: (request: CreateShortLinkRequest) => void
  submitting: boolean
}

interface FormErrors {
  originalUrl?: string
  customAlias?: string
  ios?: string
  android?: string
}

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]{3,32}$/

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function LinkForm({ onSubmit, submitting }: LinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [showPlatforms, setShowPlatforms] = useState(false)
  const [ios, setIos] = useState('')
  const [android, setAndroid] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): FormErrors {
    const next: FormErrors = {}

    if (!originalUrl.trim()) {
      next.originalUrl = 'กรุณากรอก URL ปลายทาง'
    } else if (!isValidHttpUrl(originalUrl.trim())) {
      next.originalUrl = 'ต้องเป็น URL ที่ถูกต้อง (มี http:// หรือ https://)'
    }

    if (customAlias.trim() && !ALIAS_PATTERN.test(customAlias.trim())) {
      next.customAlias = 'ใช้ได้เฉพาะตัวอักษร a-z, A-Z, 0-9 และ - _ ความยาว 3-32 ตัวอักษร'
    }

    if (ios.trim() && !isValidHttpUrl(ios.trim())) {
      next.ios = 'ต้องเป็น URL ที่ถูกต้อง'
    }

    if (android.trim() && !isValidHttpUrl(android.trim())) {
      next.android = 'ต้องเป็น URL ที่ถูกต้อง'
    }

    return next
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    onSubmit({
      originalUrl: originalUrl.trim(),
      customAlias: customAlias.trim() || undefined,
      platformDestinations:
        ios.trim() || android.trim()
          ? { ios: ios.trim() || undefined, android: android.trim() || undefined }
          : undefined,
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <TextField
        id="originalUrl"
        label="URL ปลายทาง (ค่าเริ่มต้น)"
        placeholder="https://www.example.com"
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
        error={Boolean(errors.originalUrl)}
        helperText={errors.originalUrl ?? 'ต้องเป็น URL ที่ถูกต้อง (มี http:// หรือ https://)'}
        fullWidth
      />

      <TextField
        id="customAlias"
        label="Custom alias (ไม่บังคับ)"
        placeholder="my-alias"
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
        error={Boolean(errors.customAlias)}
        helperText={errors.customAlias ?? 'ใช้ได้เฉพาะตัวอักษร a-z, A-Z, 0-9 และ - _ ความยาว 3-32 ตัวอักษร'}
        fullWidth
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start">gul.fy/</InputAdornment>,
          },
        }}
      />

      <Accordion
        expanded={showPlatforms}
        onChange={(_, expanded) => setShowPlatforms(expanded)}
        disableGutters
        sx={{ '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: '10px !important' }}
      >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>ปลายทางตามแพลตฟอร์ม (ไม่บังคับ)</Typography>
            <Typography variant="body2" color="text.secondary">
              กำหนดปลายทางแยกสำหรับ iOS / Android — ถ้าไม่ตั้งค่า จะ redirect ไปที่ URL ปลายทางด้านบนเสมอ
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
          <TextField
            placeholder="https://apps.apple.com/..."
            value={ios}
            onChange={(e) => setIos(e.target.value)}
            error={Boolean(errors.ios)}
            helperText={errors.ios}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Chip label="iOS" size="small" sx={{ bgcolor: '#0b0b0b', color: '#fff', fontWeight: 800 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            placeholder="https://play.google.com/..."
            value={android}
            onChange={(e) => setAndroid(e.target.value)}
            error={Boolean(errors.android)}
            helperText={errors.android}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Chip label="AND" size="small" color="success" sx={{ fontWeight: 800 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </AccordionDetails>
      </Accordion>

      <Button type="submit" variant="contained" size="large" startIcon={<AddRoundedIcon />} disabled={submitting} fullWidth>
        {submitting ? 'กำลังสร้าง...' : 'สร้างลิงก์สั้น'}
      </Button>
    </Box>
  )
}
