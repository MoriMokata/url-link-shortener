import { useMutation } from '@tanstack/react-query'
import { linksApi } from '../api/links'
import { ApiError } from '../api/apiClient'
import { LinkForm } from '../components/LinkForm'

export function CreateLinkPage() {
  const createLink = useMutation({
    mutationFn: linksApi.create,
  })

  return (
    <div className="container">
      <div className="page-header">
        <h1>สร้างลิงก์สั้นใหม่</h1>
        <p>แปลง URL ยาวให้เป็นลิงก์สั้น พร้อมตั้งค่า alias และปลายทางตามแพลตฟอร์มได้ตามต้องการ</p>
      </div>

      <div className="card card-pad" style={{ maxWidth: 640 }}>
        <LinkForm submitting={createLink.isPending} onSubmit={(request) => createLink.mutate(request)} />
      </div>

      {createLink.isError && (
        <p className="error-text" style={{ marginTop: 16 }}>
          {createLink.error instanceof ApiError ? createLink.error.message : 'สร้างลิงก์ไม่สำเร็จ กรุณาลองใหม่'}
        </p>
      )}

      {createLink.isSuccess && (
        <div className="result-panel" style={{ maxWidth: 640 }}>
          <div className="result-title">
            <span aria-hidden="true">✓</span> สร้างลิงก์สำเร็จ
          </div>
          <div className="result-link-row">
            <a href={createLink.data.shortUrl} target="_blank" rel="noreferrer" className="short-url">
              {createLink.data.shortUrl}
            </a>
          </div>
          <p className="result-meta">
            ต้นทาง: {createLink.data.originalUrl}
            {Object.keys(createLink.data.platformDestinations).length > 0 && ' · iOS/Android ตั้งค่าแยกแล้ว'}
          </p>
        </div>
      )}
    </div>
  )
}
