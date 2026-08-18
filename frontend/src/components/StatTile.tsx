interface StatTileProps {
  icon: string
  label: string
  value: string
}

export function StatTile({ icon, label, value }: StatTileProps) {
  return (
    <div className="card stat-tile">
      <div className="stat-tile-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="stat-tile-value">{value}</div>
        <div className="stat-tile-label">{label}</div>
      </div>
    </div>
  )
}
