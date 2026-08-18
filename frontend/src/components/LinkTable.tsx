import { Link } from 'react-router-dom'
import type { ShortLink } from '../types/ShortLink'
import { formatDate, formatRelativeTime } from '../utils/format'

interface LinkTableProps {
  links: ShortLink[]
  onToggleDisabled: (link: ShortLink) => void
  onDelete: (link: ShortLink) => void
  pendingCode: string | null
}

function StatusBadge({ link }: { link: ShortLink }) {
  return (
    <span className={link.isDisabled ? 'badge badge-disabled' : 'badge badge-active'}>
      {link.isDisabled ? 'ปิดใช้งาน' : 'ใช้งานอยู่'}
    </span>
  )
}

function RowActions({
  link,
  onToggleDisabled,
  onDelete,
  pending,
}: {
  link: ShortLink
  onToggleDisabled: (link: ShortLink) => void
  onDelete: (link: ShortLink) => void
  pending: boolean
}) {
  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-icon"
        title="คัดลอกลิงก์"
        onClick={() => navigator.clipboard.writeText(link.shortUrl)}
      >
        📋
      </button>
      <a
        className="btn btn-sm btn-icon"
        title="เปิดต้นทาง"
        href={link.originalUrl}
        target="_blank"
        rel="noreferrer"
      >
        ↗
      </a>
      <button
        type="button"
        className="btn btn-sm btn-icon"
        title={link.isDisabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
        disabled={pending}
        onClick={() => onToggleDisabled(link)}
      >
        ⏻
      </button>
      <button
        type="button"
        className="btn btn-sm btn-icon btn-danger"
        title="ลบลิงก์"
        disabled={pending}
        onClick={() => onDelete(link)}
      >
        🗑
      </button>
    </>
  )
}

export function LinkTable({ links, onToggleDisabled, onDelete, pendingCode }: LinkTableProps) {
  return (
    <>
      <div className="table-wrap">
        <table className="link-table">
          <thead>
            <tr>
              <th>ลิงก์สั้น</th>
              <th>ปลายทาง</th>
              <th>คลิก</th>
              <th>สร้างเมื่อ</th>
              <th>เข้าถึงล่าสุด</th>
              <th>สถานะ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.shortCode}>
                <td className="code-cell">
                  <Link to={`/links/${encodeURIComponent(link.shortCode)}`}>gul.fy/{link.shortCode}</Link>
                </td>
                <td className="original-url-cell" title={link.originalUrl}>
                  {link.originalUrl}
                </td>
                <td>{link.clickCount}</td>
                <td>{formatDate(link.createdAt)}</td>
                <td>{link.lastAccessedAt ? formatRelativeTime(link.lastAccessedAt) : '—'}</td>
                <td>
                  <StatusBadge link={link} />
                </td>
                <td>
                  <div className="actions-cell">
                    <RowActions
                      link={link}
                      onToggleDisabled={onToggleDisabled}
                      onDelete={onDelete}
                      pending={pendingCode === link.shortCode}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="link-cards">
        {links.map((link) => (
          <div key={link.shortCode} className="card link-card">
            <div className="link-card-top">
              <Link to={`/links/${encodeURIComponent(link.shortCode)}`} className="code-cell">
                gul.fy/{link.shortCode}
              </Link>
              <StatusBadge link={link} />
            </div>
            <p className="link-card-url">{link.originalUrl}</p>
            <div className="link-card-meta">
              <span>{link.clickCount} คลิก</span>
              <span>{link.lastAccessedAt ? formatRelativeTime(link.lastAccessedAt) : 'ยังไม่มีการเข้าถึง'}</span>
            </div>
            <div className="link-card-actions">
              <RowActions
                link={link}
                onToggleDisabled={onToggleDisabled}
                onDelete={onDelete}
                pending={pendingCode === link.shortCode}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
