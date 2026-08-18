import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LinkTable } from './LinkTable'
import type { ShortLink } from '../types/ShortLink'

function makeLink(overrides: Partial<ShortLink> = {}): ShortLink {
  return {
    shortCode: 'abc123',
    shortUrl: 'http://localhost:5001/abc123',
    originalUrl: 'https://example.com',
    customAlias: null,
    source: 'Auto',
    isDisabled: false,
    clickCount: 5,
    createdAt: '2026-08-01T00:00:00Z',
    lastAccessedAt: null,
    platformDestinations: {},
    ...overrides,
  }
}

function renderTable(links: ShortLink[]) {
  return render(
    <MemoryRouter>
      <LinkTable links={links} onToggleDisabled={vi.fn()} onDelete={vi.fn()} pendingCode={null} />
    </MemoryRouter>,
  )
}

describe('LinkTable', () => {
  it('renders one row per link with its code, destination, and click count', () => {
    renderTable([makeLink({ shortCode: 'one' }), makeLink({ shortCode: 'two', clickCount: 12 })])

    expect(screen.getAllByText('gul.fy/one')).not.toHaveLength(0)
    expect(screen.getAllByText('gul.fy/two')).not.toHaveLength(0)
    expect(screen.getAllByText('12')).not.toHaveLength(0)
  })

  it('shows an active badge for an enabled link', () => {
    renderTable([makeLink({ isDisabled: false })])

    expect(screen.getAllByText('ใช้งานอยู่').length).toBeGreaterThan(0)
    expect(screen.queryByText('ปิดใช้งาน')).not.toBeInTheDocument()
  })

  it('shows a disabled badge for a disabled link', () => {
    renderTable([makeLink({ isDisabled: true })])

    expect(screen.getAllByText('ปิดใช้งาน').length).toBeGreaterThan(0)
  })

  it('shows an em dash when the link has never been accessed', () => {
    renderTable([makeLink({ lastAccessedAt: null })])

    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
