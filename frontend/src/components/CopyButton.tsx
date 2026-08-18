import { useEffect, useState } from 'react'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
  iconOnly?: boolean
}

export function CopyButton({ text, label = 'คัดลอกลิงก์', className = 'btn', iconOnly = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  async function handleClick() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  return (
    <>
      <button type="button" className={className} title={label} onClick={handleClick}>
        📋 {!iconOnly && label}
      </button>
      {copied && (
        <div className="toast" role="status">
          คัดลอกแล้ว!
        </div>
      )}
    </>
  )
}
