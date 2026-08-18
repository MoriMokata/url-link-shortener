import { NavLink } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="container">
        <NavLink to="/" className="brand">
          <span className="brand-icon" aria-hidden="true">
            🔗
          </span>
          gul.fy
        </NavLink>
        <nav className="app-nav">
          <NavLink to="/" end>
            สร้างลิงก์
          </NavLink>
          <NavLink to="/dashboard">แดชบอร์ด</NavLink>
        </nav>
      </div>
    </header>
  )
}
