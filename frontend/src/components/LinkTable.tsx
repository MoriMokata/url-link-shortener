import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import type { ShortLink } from '../types/ShortLink'
import { formatDate, formatRelativeTime } from '../utils/format'
import { CopyButton } from './CopyButton'

interface LinkTableProps {
  links: ShortLink[]
  onToggleDisabled: (link: ShortLink) => void
  onDelete: (link: ShortLink) => void
  pendingCode: string | null
}

function StatusChip({ link }: { link: ShortLink }) {
  return (
    <Chip
      size="small"
      label={link.isDisabled ? 'ปิดใช้งาน' : 'ใช้งานอยู่'}
      color={link.isDisabled ? 'default' : 'success'}
      variant={link.isDisabled ? 'outlined' : 'filled'}
      sx={link.isDisabled ? {} : { bgcolor: 'success.light', color: 'success.main' }}
    />
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
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <CopyButton text={link.shortUrl} iconOnly size="small" />
      <Tooltip title="เปิดต้นทาง">
        <IconButton size="small" component="a" href={link.originalUrl} target="_blank" rel="noreferrer">
          <OpenInNewRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={link.isDisabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}>
        <span>
          <IconButton size="small" disabled={pending} onClick={() => onToggleDisabled(link)}>
            <PowerSettingsNewRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="ลบลิงก์">
        <span>
          <IconButton size="small" color="error" disabled={pending} onClick={() => onDelete(link)}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export function LinkTable({ links, onToggleDisabled, onDelete, pendingCode }: LinkTableProps) {
  return (
    <>
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>ลิงก์สั้น</TableCell>
              <TableCell>ปลายทาง</TableCell>
              <TableCell>คลิก</TableCell>
              <TableCell>สร้างเมื่อ</TableCell>
              <TableCell>เข้าถึงล่าสุด</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell align="right">การจัดการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.shortCode} hover>
                <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  <Link to={`/links/${encodeURIComponent(link.shortCode)}`} style={{ color: 'inherit' }}>
                    gul.fy/{link.shortCode}
                  </Link>
                </TableCell>
                <TableCell
                  title={link.originalUrl}
                  sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }}
                >
                  {link.originalUrl}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{link.clickCount}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(link.createdAt)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {link.lastAccessedAt ? formatRelativeTime(link.lastAccessedAt) : '—'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <StatusChip link={link} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <RowActions
                      link={link}
                      onToggleDisabled={onToggleDisabled}
                      onDelete={onDelete}
                      pending={pendingCode === link.shortCode}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5, p: 2 }}>
        {links.map((link) => (
          <Card key={link.shortCode} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
              <Typography component={Link} to={`/links/${encodeURIComponent(link.shortCode)}`} sx={{ fontWeight: 700, color: 'inherit', textDecoration: 'none' }}>
                gul.fy/{link.shortCode}
              </Typography>
              <StatusChip link={link} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, wordBreak: 'break-all' }}>
              {link.originalUrl}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, color: 'text.disabled', fontSize: 13, mb: 1.5 }}>
              <span>{link.clickCount} คลิก</span>
              <span>{link.lastAccessedAt ? formatRelativeTime(link.lastAccessedAt) : 'ยังไม่มีการเข้าถึง'}</span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
              <RowActions
                link={link}
                onToggleDisabled={onToggleDisabled}
                onDelete={onDelete}
                pending={pendingCode === link.shortCode}
              />
            </Box>
          </Card>
        ))}
      </Box>
    </>
  )
}
