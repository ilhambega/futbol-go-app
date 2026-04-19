import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: '/', icon: '⚽', label: 'Игры' },
    { path: '/ads', icon: '🔍', label: 'Поиск' },
    { path: '/profile', icon: '👤', label: 'Профиль' },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      background: '#1a1a1a',
      borderTop: '1px solid #2a2a2a',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0',
      zIndex: 100,
    }}>
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          style={{
            background: 'none',
            border: 'none',
            color: location.pathname === tab.path ? '#4CAF50' : '#888',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            padding: '4px 20px',
          }}
        >
          <span style={{ fontSize: '22px' }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}
