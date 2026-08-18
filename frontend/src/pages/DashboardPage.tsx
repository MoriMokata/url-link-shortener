import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
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
    <Container maxWidth="lg" sx={{ pt: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h1">ลิงก์ทั้งหมดของฉัน</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ดูสถิติการเข้าถึง เปิด/ปิดใช้งาน หรือลบลิงก์ที่สร้างไว้
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/"
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          สร้างลิงก์ใหม่
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <StatTile icon="🔗" label="ลิงก์ทั้งหมด" value={String(links.length)} />
        <StatTile icon="🖱️" label="คลิกทั้งหมด" value={totalClicks.toLocaleString()} />
        <StatTile icon="✅" label="ลิงก์ที่ใช้งานอยู่" value={`${activeCount} / ${links.length}`} />
      </Box>

      <Card>
        <Box sx={{ display: 'flex', gap: 1.5, p: 2, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
          <TextField
            placeholder="ค้นหา short code หรือ URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl sx={{ minWidth: 180 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
              <MenuItem value="all">สถานะ: ทั้งหมด</MenuItem>
              <MenuItem value="active">ใช้งานอยู่</MenuItem>
              <MenuItem value="disabled">ปิดใช้งาน</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {linksQuery.isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {linksQuery.isError && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">โหลดข้อมูลลิงก์ไม่สำเร็จ กรุณาลองใหม่</Alert>
          </Box>
        )}

        {linksQuery.isSuccess && filteredLinks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6, px: 3, color: 'text.secondary' }}>
            <Typography variant="h3" color="text.primary" sx={{ mb: 0.5 }}>
              {links.length === 0 ? 'ยังไม่มีลิงก์' : 'ไม่พบลิงก์ที่ตรงกับการค้นหา'}
            </Typography>
            <Typography variant="body2">
              {links.length === 0 ? 'เริ่มสร้างลิงก์สั้นแรกของคุณได้ที่หน้า "สร้างลิงก์"' : 'ลองคำค้นหรือตัวกรองอื่น'}
            </Typography>
          </Box>
        )}

        {linksQuery.isSuccess && filteredLinks.length > 0 && (
          <LinkTable
            links={filteredLinks}
            onToggleDisabled={handleToggleDisabled}
            onDelete={handleDelete}
            pendingCode={pendingCode}
          />
        )}
      </Card>

      <Fab
        component={Link}
        to="/"
        color="primary"
        aria-label="สร้างลิงก์ใหม่"
        sx={{ display: { xs: 'flex', sm: 'none' }, position: 'fixed', right: 20, bottom: 24 }}
      >
        <AddRoundedIcon />
      </Fab>
    </Container>
  )
}
