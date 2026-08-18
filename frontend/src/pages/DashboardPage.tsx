import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { linksApi } from '../api/links'
import { useLinkMutations } from '../hooks/useLinkMutations'
import type { ShortLink } from '../types/ShortLink'
import { StatTile } from '../components/StatTile'
import { LinkTable } from '../components/LinkTable'

type StatusFilter = 'all' | 'active' | 'disabled'

const EMPTY_LINKS: never[] = []

export function DashboardPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const linksQuery = useQuery({
    queryKey: ['links'],
    queryFn: linksApi.getAll,
  })

  const links = linksQuery.data ?? EMPTY_LINKS
  const { disable, enable, remove } = useLinkMutations()
  const pendingCode = disable.isPending
    ? disable.variables
    : enable.isPending
      ? enable.variables
      : remove.isPending
        ? remove.variables
        : null

  function handleToggleDisabled(link: ShortLink) {
    if (link.isDisabled) {
      enable.mutate(link.shortCode)
    } else {
      disable.mutate(link.shortCode)
    }
  }

  function handleDelete(link: ShortLink) {
    if (window.confirm(`ลบลิงก์ gul.fy/${link.shortCode} ถาวร? การกระทำนี้ย้อนกลับไม่ได้`)) {
      remove.mutate(link.shortCode)
    }
  }

  const filteredLinks = useMemo(() => {
    const term = search.trim().toLowerCase()
    return links.filter((link) => {
      const matchesSearch =
        !term || link.shortCode.toLowerCase().includes(term) || link.originalUrl.toLowerCase().includes(term)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !link.isDisabled) ||
        (statusFilter === 'disabled' && link.isDisabled)
      return matchesSearch && matchesStatus
    })
  }, [links, search, statusFilter])

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)
  const activeCount = links.filter((link) => !link.isDisabled).length

  return (
    <div className="container">
      <div className="page-header">
        <h1>ลิงก์ทั้งหมดของฉัน</h1>
        <p>ดูสถิติการเข้าถึง เปิด/ปิดใช้งาน หรือลบลิงก์ที่สร้างไว้</p>
      </div>

      <div className="stat-grid">
        <StatTile icon="🔗" label="ลิงก์ทั้งหมด" value={String(links.length)} />
        <StatTile icon="🖱️" label="คลิกทั้งหมด" value={totalClicks.toLocaleString()} />
        <StatTile icon="✅" label="ลิงก์ที่ใช้งานอยู่" value={`${activeCount} / ${links.length}`} />
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, padding: 16, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="ค้นหา short code หรือ URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 14px',
              fontSize: 14,
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 14px',
              fontSize: 14,
            }}
          >
            <option value="all">สถานะ: ทั้งหมด</option>
            <option value="active">ใช้งานอยู่</option>
            <option value="disabled">ปิดใช้งาน</option>
          </select>
        </div>

        {linksQuery.isLoading && <p className="state-panel">กำลังโหลด...</p>}

        {linksQuery.isError && <p className="state-panel error">โหลดข้อมูลลิงก์ไม่สำเร็จ กรุณาลองใหม่</p>}

        {linksQuery.isSuccess && filteredLinks.length === 0 && (
          <div className="state-panel">
            <h3>{links.length === 0 ? 'ยังไม่มีลิงก์' : 'ไม่พบลิงก์ที่ตรงกับการค้นหา'}</h3>
            <p>{links.length === 0 ? 'เริ่มสร้างลิงก์สั้นแรกของคุณได้ที่หน้า "สร้างลิงก์"' : 'ลองคำค้นหรือตัวกรองอื่น'}</p>
          </div>
        )}

        {linksQuery.isSuccess && filteredLinks.length > 0 && (
          <LinkTable
            links={filteredLinks}
            onToggleDisabled={handleToggleDisabled}
            onDelete={handleDelete}
            pendingCode={pendingCode}
          />
        )}
      </div>
    </div>
  )
}
