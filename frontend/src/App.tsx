function App() {
  // Scaffold placeholder (task FE-01). Pages, routing, and the API client
  // are added in FE-02 onward — see /TASKS.md.
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 8,
        textAlign: 'center',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 28 }}>gul.fy</h1>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
        URL Link Shortener — frontend scaffold is running.
      </p>
    </main>
  )
}

export default App
