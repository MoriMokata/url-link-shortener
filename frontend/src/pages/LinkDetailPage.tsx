import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { linksApi } from '../api/links'
import { ApiError } from '../api/apiClient'
import { useLinkMutations } from '../hooks/useLinkMutations'
import { StatTile } from '../components/StatTile'
import { CopyButton } from '../components/CopyButton'
import { QrCodePanel } from '../components/QrCodePanel'
import { formatDateTime, formatRelativeTime } from '../utils/format'

const PLATFORM_LABELS: Record<string, string> = { Ios: 'iOS', Android: 'Android' }

export function LinkDetailPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { disable, enable, remove } = useLinkMutations()

  const linkQuery = useQuery({
    queryKey: ['link', code],
    queryFn: () => linksApi.getByCode(code!),
    enabled: Boolean(code),
  })

  if (linkQuery.isLoading) {
    return (
      <div className="container">
        <p className="state-panel">กำลังโหลด...</p>
      </div>
    )
  }

  if (linkQuery.isError || !linkQuery.data) {
    const message =
      linkQuery.error instanceof ApiError ? linkQuery.error.message : 'ไม่พบลิงก์นี้ อาจถูกลบหรือไม่เคยมีอยู่จริง';
    return (
      <div className="container">
        <div className="state-panel error">
          <h3>โหลดลิงก์ไม่สำเร็จ</h3>
          <p>{message}</p>
          <Link to="/dashboard">‹ กลับไปแดชบอร์ด</Link>
        </div>
      </div>
    )
  }

  const link = linkQuery.data

  function handleToggleDisabled() {
    if (link.isDisabled) {
      enable.mutate(link.shortCode)
    } else {
      disable.mutate(link.shortCode)
    }
  }

  function handleDelete() {
    if (window.confirm(`ลบลิงก์ gul.fy/${link.shortCode} ถาวร? การกระทำนี้ย้อนกลับไม่ได้`)) {
      remove.mutate(link.shortCode, { onSuccess: () => navigate('/dashboard') })
    }
  }

  const platformEntries = Object.entries(link.platformDestinations)

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/dashboard">‹ กลับไปแดชบอร์ด</Link>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0 }}>gul.fy/{link.shortCode}</h1>
            <span className={link.isDisabled ? 'badge badge-disabled' : 'badge badge-active'}>
              {link.isDisabled ? 'ปิดใช้งาน' : 'ใช้งานอยู่'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CopyButton text={link.shortUrl} />
            <a className="btn" href={link.originalUrl} target="_blank" rel="noreferrer">
              ↗ เปิดต้นทาง
            </a>
          </div>
        </div>
        <p>ต้นทาง: {link.originalUrl}</p>
      </div>

      <div className="stat-grid">
        <StatTile icon="🖱️" label="คลิกทั้งหมด" value={String(link.clickCount)} />
        <StatTile icon="📅" label="สร้างเมื่อ" value={formatDateTime(link.createdAt)} />
        <StatTile
          icon="🕒"
          label="เข้าถึงล่าสุด"
          value={link.lastAccessedAt ? formatRelativeTime(link.lastAccessedAt) : 'ยังไม่มีการเข้าถึง'}
        />
      </div>

      <div className="detail-grid">
        <div className="card card-pad">
          <h3 style={{ marginBottom: 16 }}>รายละเอียดลิงก์</h3>
          <dl style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 12, margin: 0, fontSize: 14 }}>
            <dt style={{ color: 'var(--text-muted)' }}>Short code</dt>
            <dd style={{ margin: 0, fontWeight: 700 }}>{link.shortCode}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>วิธีสร้างโค้ด</dt>
            <dd style={{ margin: 0 }}>{link.source === 'Auto' ? 'Auto-generated' : 'Custom alias'}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>Original URL</dt>
            <dd style={{ margin: 0, wordBreak: 'break-all' }}>{link.originalUrl}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>สร้างเมื่อ</dt>
            <dd style={{ margin: 0 }}>{formatDateTime(link.createdAt)}</dd>
            <dt style={{ color: 'var(--text-muted)' }}>เข้าถึงล่าสุด</dt>
            <dd style={{ margin: 0 }}>{link.lastAccessedAt ? formatDateTime(link.lastAccessedAt) : '—'}</dd>
          </dl>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--gridline)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <strong>สถานะลิงก์</strong>
              <p className="hint" style={{ margin: '2px 0 0' }}>ปิดใช้งานเพื่อหยุด redirect โดยไม่ลบข้อมูล</p>
            </div>
            <button
              type="button"
              className="btn"
              disabled={disable.isPending || enable.isPending}
              onClick={handleToggleDisabled}
            >
              {link.isDisabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
            </button>
          </div>

          <button type="button" className="btn btn-danger btn-block" disabled={remove.isPending} onClick={handleDelete}>
            🗑 ลบลิงก์นี้ถาวร
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card card-pad">
            <h3 style={{ marginBottom: 12 }}>ปลายทางตามแพลตฟอร์ม</h3>
            <div className="platform-row">
              <span className="platform-tag" style={{ background: '#0b0b0b', color: '#fff' }}>
                DEF
              </span>
              <span style={{ wordBreak: 'break-all', fontSize: 14 }}>{link.originalUrl}</span>
            </div>
            {platformEntries.length === 0 && (
              <p className="hint" style={{ marginTop: 8 }}>ไม่มีปลายทางแยกตามแพลตฟอร์ม — ใช้ URL ปลายทางเสมอ</p>
            )}
            {platformEntries.map(([platform, url]) => (
              <div key={platform} className="platform-row">
                <span className={`platform-tag ${platform.toLowerCase()}`}>
                  {PLATFORM_LABELS[platform] ?? platform}
                </span>
                <span style={{ wordBreak: 'break-all', fontSize: 14 }}>{url}</span>
              </div>
            ))}
          </div>

          <QrCodePanel url={link.shortUrl} fileName={link.shortCode} />
        </div>
      </div>
    </div>
  )
}
