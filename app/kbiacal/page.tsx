'use client'

export default function KBIACalPage() {
  return (
    <iframe
      src="/scheduler.html"
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
      title="KBIACal Scheduler"
    />
  )
}
