import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_ID = 938184349

export default function Profile() {
  const navigate = useNavigate()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const userId = tgUser?.id

  useEffect(() => {
    if (userId) fetchMyGames()
    else setLoading(false)
  }, [])

  async function fetchMyGames() {
    const { data } = await supabase
      .from('registrations')
      .select('*, games(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setRegistrations(data || [])
    setLoading(false)
  }

  if (!tgUser) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
      <p>Откройте через Telegram</p>
    </div>
  )

  const upcoming = registrations.filter(r => r.games && new Date(r.games.scheduled_at) > new Date())
  const past = registrations.filter(r => r.games && new Date(r.games.scheduled_at) <= new Date())

  return (
    <div style={{ padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        background: 'linear-gradient(180deg, #1a0d0d 0%, var(--bg) 100%)',
        borderBottom: '1px solid #2a1a1a',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-dim), var(--green))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: '800',
            color: '#000',
            boxShadow: '0 0 20px var(--green-glow)',
            flexShrink: 0,
            fontFamily: 'Bebas Neue',
          }}>
            {tgUser.first_name?.[0] || '?'}
          </div>
          <div>
            <h1 style={{ fontSize: '26px', lineHeight: 1 }}>
              {tgUser.first_name} {tgUser.last_name || ''}
            </h1>
            {tgUser.username && (
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
                @{tgUser.username}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
        }}>
          {[
            { label: 'Игр всего', value: registrations.length },
            { label: 'Предстоит', value: upcoming.length },
            { label: 'Сыграно', value: past.length },
          ].map(stat => (
            <div key={stat.label} style={{
              flex: 1,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 10px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '26px',
                fontFamily: 'Bebas Neue',
                color: 'var(--green)',
                textShadow: '0 0 10px var(--green-glow)',
                lineHeight: 1,
              }}>
                {stat.value}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Admin button */}
        {userId === ADMIN_ID && (
          <button
            onClick={() => navigate('/admin')}
            style={{
              width: '100%',
              padding: '14px',
              background: 'none',
              border: '1px solid rgba(0,230,118,0.3)',
              borderRadius: '14px',
              color: 'var(--green)',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              marginBottom: '20px',
              letterSpacing: '0.5px',
            }}
          >
            🛠 ПАНЕЛЬ АДМИНИСТРАТОРА
          </button>
        )}

        {/* Games list */}
        {loading ? (
          [1, 2].map(i => (
            <div key={i} style={{
              background: 'var(--card)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '10px',
            }}>
              <div className="skeleton" style={{ width: '60%', height: '16px', marginBottom: '10px' }} />
              <div className="skeleton" style={{ width: '40%', height: '13px' }} />
            </div>
          ))
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚽</div>
            <p style={{ color: '#444' }}>Ты ещё не записывался на игры</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <p style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: '700', marginBottom: '10px', letterSpacing: '1px' }}>
                  ПРЕДСТОЯЩИЕ
                </p>
                {upcoming.map((reg, i) => (
                  <div
                    key={reg.id}
                    className="fade-up"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid rgba(0,230,118,0.15)',
                      borderRadius: '14px',
                      padding: '14px',
                      marginBottom: '10px',
                      animationDelay: `${i * 0.06}s`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '3px',
                      height: '100%',
                      background: 'var(--green)',
                    }} />
                    <div style={{ paddingLeft: '10px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Bebas Neue', letterSpacing: '0.5px' }}>
                        {reg.games.title.toUpperCase()}
                      </p>
                      <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '6px' }}>
                        📍 {reg.games.field_name}
                      </p>
                      <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                        🕐 {new Date(reg.games.scheduled_at).toLocaleString('ru-RU', {
                          day: 'numeric', month: 'long',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <p style={{ color: 'var(--muted)', fontSize: '12px', fontWeight: '700', marginBottom: '10px', marginTop: '16px', letterSpacing: '1px' }}>
                  ИСТОРИЯ
                </p>
                {past.map((reg, i) => (
                  <div
                    key={reg.id}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '14px',
                      marginBottom: '10px',
                      opacity: 0.6,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ paddingLeft: '10px' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'Bebas Neue' }}>
                        {reg.games.title.toUpperCase()}
                      </p>
                      <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '6px' }}>
                        📍 {reg.games.field_name}
                      </p>
                      <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                        🕐 {new Date(reg.games.scheduled_at).toLocaleString('ru-RU', {
                          day: 'numeric', month: 'long',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
