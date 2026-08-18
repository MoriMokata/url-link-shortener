import { useMutation } from '@tanstack/react-query'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import { linksApi } from '../api/links'
import { ApiError } from '../api/apiClient'
import { LinkForm } from '../components/LinkForm'
import { CopyButton } from '../components/CopyButton'
import { QrCodeButton } from '../components/QrCodeButton'

export function CreateLinkPage() {
  const createLink = useMutation({
    mutationFn: linksApi.create,
  })

  return (
    <Container maxWidth="lg" sx={{ pt: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1">สร้างลิงก์สั้นใหม่</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          แปลง URL ยาวให้เป็นลิงก์สั้น พร้อมตั้งค่า alias และปลายทางตามแพลตฟอร์มได้ตามต้องการ
        </Typography>
      </Box>

      <Card sx={{ p: 4, maxWidth: 640, mx: 'auto' }}>
        <LinkForm submitting={createLink.isPending} onSubmit={(request) => createLink.mutate(request)} />
      </Card>

      {createLink.isError && (
        <Alert severity="error" sx={{ maxWidth: 640, mx: 'auto', mt: 2 }}>
          {createLink.error instanceof ApiError ? createLink.error.message : 'สร้างลิงก์ไม่สำเร็จ กรุณาลองใหม่'}
        </Alert>
      )}

      {createLink.isSuccess && (
        <Alert severity="success" sx={{ maxWidth: 640, mx: 'auto', mt: 3 }}>
          <AlertTitle>สร้างลิงก์สำเร็จ</AlertTitle>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 1.5,
              mt: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              component="a"
              href={createLink.data.shortUrl}
              target="_blank"
              rel="noreferrer"
              sx={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, wordBreak: 'break-all' }}
            >
              {createLink.data.shortUrl}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CopyButton text={createLink.data.shortUrl} iconOnly size="small" />
              <QrCodeButton url={createLink.data.shortUrl} size="small" />
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 1.5 }}>
            ต้นทาง: {createLink.data.originalUrl}
            {Object.keys(createLink.data.platformDestinations).length > 0 && ' · iOS/Android ตั้งค่าแยกแล้ว'}
          </Typography>
        </Alert>
      )}
    </Container>
  )
}
