import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const navigate = useNavigate()
const [loading, setLoading] = useState(true)
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const userId = tgUser?.id

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchMyGames()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchProfile() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    setUser(data)
    setLoading(false)
  }

  async function fetchMyGames() {
    const { data } = await supabase
      .from('registrations')
      .select('*, games(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setRegistrations(data || [])
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      Загрузка...
    </div>
  )

  if (!tgUser) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</p>
      <p>Откройте приложение через Telegram</p>
    </div>
  )

  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>👤 Профиль</h1>

      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          flexShrink: 0,
        }}>
          {tgUser.first_name?.[0] || '?'}
        </div>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {tgUser.first_name} {tgUser.last_name || ''}
          </p>
          {tgUser.username && (
            <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
              @{tgUser.username}
            </p>
          )}
        </div>
      </div>

      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '40px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4CAF50' }}>
            {registrations.length}
          </p>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>Игр сыграно</p>
        </div>
      </div>

      {userId === 938184349 && (
  <button
    onClick={() => navigate('/admin')}
    style={{
      width: '100%',
      padding: '14px',
      background: '#1a1a1a',
      border: '1px solid #4CAF50',
      borderRadius: '12px',
      color: '#4CAF50',
      fontSize: '15px',
      cursor: 'pointer',
      marginBottom: '20px',
    }}
  >
    🛠 Панель администратора
  </button>
)}

<h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#aaa' }}>
  Мои игры
</h2>

      {registrations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#555',
          fontSize: '14px',
        }}>
          Ты ещё не записывался на игры
        </div>
      ) : (
        registrations.map(reg => (
          reg.games && (
            <div
              key={reg.id}
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '10px',
              }}
            >
              <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{reg.games.title}</p>
              <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
                📍 {reg.games.field_name}
              </p>
              <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                🕐 {new Date(reg.games.scheduled_at).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div style={{ marginTop: '10px' }}>
                <span style={{
                  background: new Date(reg.games.scheduled_at) > new Date() ? '#1a3a1a' : '#2a2a2a',
                  color: new Date(reg.games.scheduled_at) > new Date() ? '#4CAF50' : '#666',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '12px',
                }}>
                  {new Date(reg.games.scheduled_at) > new Date() ? 'Предстоит' : 'Сыграна'}
                </span>
              </div>
            </div>
          )
        ))
      )}
    </div>
  )
}
