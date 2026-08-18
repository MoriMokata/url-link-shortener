import { useState } from 'react'
import type { FormEvent } from 'react'
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
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="originalUrl">URL ปลายทาง (ค่าเริ่มต้น)</label>
        <input
          id="originalUrl"
          type="text"
          placeholder="https://www.example.com"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className={errors.originalUrl ? 'has-error' : ''}
          aria-invalid={Boolean(errors.originalUrl)}
        />
        {errors.originalUrl ? (
          <p className="error-text">{errors.originalUrl}</p>
        ) : (
          <p className="hint">ต้องเป็น URL ที่ถูกต้อง (มี http:// หรือ https://)</p>
        )}
      </div>

      <div className="field">
        <label htmlFor="customAlias">
          Custom alias <span className="optional">(ไม่บังคับ)</span>
        </label>
        <div className="alias-input-group">
          <span className="alias-prefix">gul.fy/</span>
          <input
            id="customAlias"
            type="text"
            placeholder="my-alias"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            className={errors.customAlias ? 'has-error' : ''}
            aria-invalid={Boolean(errors.customAlias)}
          />
        </div>
        {errors.customAlias ? (
          <p className="error-text">{errors.customAlias}</p>
        ) : (
          <p className="hint">ใช้ได้เฉพาะตัวอักษร a-z, A-Z, 0-9 และ - _ ความยาว 3-32 ตัวอักษร</p>
        )}
      </div>

      <div className="field">
        <button
          type="button"
          onClick={() => setShowPlatforms((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 14,
          }}
          aria-expanded={showPlatforms}
        >
          <span>
            ปลายทางตามแพลตฟอร์ม <span className="optional">(ไม่บังคับ)</span>
          </span>
          <span aria-hidden="true">{showPlatforms ? '▲' : '▼'}</span>
        </button>
        <p className="hint">กำหนดปลายทางแยกสำหรับ iOS / Android — ถ้าไม่ตั้งค่า จะ redirect ไปที่ URL ปลายทางด้านบนเสมอ</p>

        {showPlatforms && (
          <div style={{ marginTop: 12 }}>
            <div className="platform-row">
              <span className="platform-tag ios">iOS</span>
              <input
                type="text"
                placeholder="https://apps.apple.com/..."
                value={ios}
                onChange={(e) => setIos(e.target.value)}
                className={errors.ios ? 'has-error' : ''}
              />
            </div>
            {errors.ios && <p className="error-text">{errors.ios}</p>}
            <div className="platform-row">
              <span className="platform-tag android">AND</span>
              <input
                type="text"
                placeholder="https://play.google.com/..."
                value={android}
                onChange={(e) => setAndroid(e.target.value)}
                className={errors.android ? 'has-error' : ''}
              />
            </div>
            {errors.android && <p className="error-text">{errors.android}</p>}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? 'กำลังสร้าง...' : '+ สร้างลิงก์สั้น'}
      </button>
    </form>
  )
}
