import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LinkForm } from './LinkForm'

describe('LinkForm', () => {
  it('rejects submission when originalUrl is empty', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<LinkForm submitting={false} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /สร้างลิงก์สั้น/ }))

    expect(await screen.findByText('กรุณากรอก URL ปลายทาง')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a malformed URL', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<LinkForm submitting={false} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/URL ปลายทาง/), 'not-a-url')
    await user.click(screen.getByRole('button', { name: /สร้างลิงก์สั้น/ }))

    expect(await screen.findByText(/ต้องเป็น URL ที่ถูกต้อง/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('rejects a malformed custom alias', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<LinkForm submitting={false} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/URL ปลายทาง/), 'https://example.com')
    await user.type(screen.getByLabelText(/Custom alias/), 'ab')
    await user.click(screen.getByRole('button', { name: /สร้างลิงก์สั้น/ }))

    expect(await screen.findByText(/ใช้ได้เฉพาะตัวอักษร/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits a valid request with the trimmed fields', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<LinkForm submitting={false} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/URL ปลายทาง/), '  https://example.com  ')
    await user.type(screen.getByLabelText(/Custom alias/), 'my-alias')
    await user.click(screen.getByRole('button', { name: /สร้างลิงก์สั้น/ }))

    expect(onSubmit).toHaveBeenCalledWith({
      originalUrl: 'https://example.com',
      customAlias: 'my-alias',
      platformDestinations: undefined,
    })
  })

  it('disables the submit button while submitting', () => {
    render(<LinkForm submitting onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: /กำลังสร้าง/ })).toBeDisabled()
  })
})
