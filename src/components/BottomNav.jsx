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
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid #1e1e1e',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px 0 14px',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: 'none',
              border: 'none',
              color: active ? 'var(--green)' : '#444',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: active ? '700' : '500',
              padding: '4px 24px',
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '32px',
                height: '2px',
                background: 'var(--green)',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 0 8px var(--green-glow)',
              }} />
            )}
            <span style={{
              fontSize: '22px',
              filter: active ? 'drop-shadow(0 0 6px var(--green-glow))' : 'none',
              transition: 'filter 0.2s',
            }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
