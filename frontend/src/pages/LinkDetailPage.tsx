import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import { linksApi } from '../api/links'
import { ApiError } from '../api/apiClient'
import { useLinkMutations } from '../hooks/useLinkMutations'
import { StatTile } from '../components/StatTile'
import { CopyButton } from '../components/CopyButton'
import { QrCodePanel } from '../components/QrCodePanel'
import { formatDateTime, formatRelativeTime } from '../utils/format'

const PLATFORM_LABELS: Record<string, string> = { Ios: 'iOS', Android: 'Android' }

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </>
  )
}

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
      <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (linkQuery.isError || !linkQuery.data) {
    const message =
      linkQuery.error instanceof ApiError ? linkQuery.error.message : 'ไม่พบลิงก์นี้ อาจถูกลบหรือไม่เคยมีอยู่จริง'
    return (
      <Container maxWidth="lg" sx={{ pt: 5 }}>
        <Alert severity="error">
          <Typography sx={{ fontWeight: 700 }}>โหลดลิงก์ไม่สำเร็จ</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {message}
          </Typography>
          <Link to="/dashboard">‹ กลับไปแดชบอร์ด</Link>
        </Alert>
      </Container>
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
    <Container maxWidth="lg" sx={{ pt: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          component={Link}
          to="/dashboard"
          sx={{ display: 'inline-flex', alignItems: 'center', color: 'primary.main', textDecoration: 'none', fontSize: 14 }}
        >
          <ChevronLeftRoundedIcon fontSize="small" /> กลับไปแดชบอร์ด
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h1">gul.fy/{link.shortCode}</Typography>
            <Chip
              size="small"
              label={link.isDisabled ? 'ปิดใช้งาน' : 'ใช้งานอยู่'}
              color={link.isDisabled ? 'default' : 'success'}
              variant={link.isDisabled ? 'outlined' : 'filled'}
              sx={link.isDisabled ? {} : { bgcolor: 'success.light', color: 'success.main' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CopyButton text={link.shortUrl} />
            <Button variant="outlined" startIcon={<OpenInNewRoundedIcon />} component="a" href={link.originalUrl} target="_blank" rel="noreferrer">
              เปิดต้นทาง
            </Button>
          </Box>
        </Box>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          ต้นทาง: {link.originalUrl}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <StatTile icon="🖱️" label="คลิกทั้งหมด" value={String(link.clickCount)} />
        <StatTile icon="📅" label="สร้างเมื่อ" value={formatDateTime(link.createdAt)} />
        <StatTile
          icon="🕒"
          label="เข้าถึงล่าสุด"
          value={link.lastAccessedAt ? formatRelativeTime(link.lastAccessedAt) : 'ยังไม่มีการเข้าถึง'}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2 }}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            รายละเอียดลิงก์
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 1.5 }}>
            <DetailRow label="Short code" value={link.shortCode} />
            <DetailRow label="วิธีสร้างโค้ด" value={link.source === 'Auto' ? 'Auto-generated' : 'Custom alias'} />
            <DetailRow label="Original URL" value={link.originalUrl} />
            <DetailRow label="สร้างเมื่อ" value={formatDateTime(link.createdAt)} />
            <DetailRow label="เข้าถึงล่าสุด" value={link.lastAccessedAt ? formatDateTime(link.lastAccessedAt) : '—'} />
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>สถานะลิงก์</Typography>
              <Typography variant="body2" color="text.secondary">
                ปิดใช้งานเพื่อหยุด redirect โดยไม่ลบข้อมูล
              </Typography>
            </Box>
            <Switch
              checked={!link.isDisabled}
              disabled={disable.isPending || enable.isPending}
              onChange={handleToggleDisabled}
            />
          </Box>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<DeleteOutlineRoundedIcon />}
            disabled={remove.isPending}
            onClick={handleDelete}
          >
            ลบลิงก์นี้ถาวร
          </Button>
        </Card>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              ปลายทางตามแพลตฟอร์ม
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Chip label="DEF" size="small" sx={{ bgcolor: '#0b0b0b', color: '#fff', fontWeight: 800 }} />
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {link.originalUrl}
              </Typography>
            </Box>
            {platformEntries.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                ไม่มีปลายทางแยกตามแพลตฟอร์ม — ใช้ URL ปลายทางเสมอ
              </Typography>
            )}
            {platformEntries.map(([platform, url]) => (
              <Box
                key={platform}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' } }}
              >
                <Chip
                  label={PLATFORM_LABELS[platform] ?? platform}
                  size="small"
                  color={platform === 'Android' ? 'success' : undefined}
                  sx={platform === 'Ios' ? { bgcolor: '#0b0b0b', color: '#fff', fontWeight: 800 } : { fontWeight: 800 }}
                />
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {url}
                </Typography>
              </Box>
            ))}
          </Card>

          <QrCodePanel url={link.shortUrl} fileName={link.shortCode} />
        </Box>
      </Box>
    </Container>
  )
}
