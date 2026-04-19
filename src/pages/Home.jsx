import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--card)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div className="skeleton" style={{ width: '60%', height: '20px' }} />
        <div className="skeleton" style={{ width: '60px', height: '20px' }} />
      </div>
      <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '8px' }} />
      <div className="skeleton" style={{ width: '50%', height: '14px', marginBottom: '16px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: '35%', height: '14px' }} />
        <div className="skeleton" style={{ width: '25%', height: '14px' }} />
      </div>
    </div>
  )
}

export default function Home() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchGames()
  }, [])

  async function fetchGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'open')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    if (!error) setGames(data)
    setLoading(false)
  }

  return (
    <div style={{ padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        background: 'linear-gradient(180deg, #0d1f0d 0%, var(--bg) 100%)',
        borderBottom: '1px solid #1a2a1a',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '28px' }}>⚽</span>
          <h1 style={{
            fontSize: '36px',
            color: 'var(--green)',
            textShadow: '0 0 20px var(--green-glow)',
            lineHeight: 1,
          }}>
            FUTBOL<span style={{ color: '#fff' }}>GO</span>
          </h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginLeft: '38px' }}>
          Ближайшие игры в Нукусе
        </p>
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : games.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'var(--muted)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🕐</div>
            <p style={{ fontSize: '16px', marginBottom: '8px', color: '#444' }}>
              Пока нет игр
            </p>
            <p style={{ fontSize: '13px' }}>Скоро появятся новые!</p>
          </div>
        ) : (
          games.map((game, i) => (
            <div
              key={game.id}
              className="fade-up"
              onClick={() => navigate(`/game/${game.id}`)}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '12px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${i * 0.08}s`,
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* Accent line */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '4px',
                height: '100%',
                background: 'var(--green)',
                boxShadow: '0 0 12px var(--green-glow)',
              }} />

              <div style={{ paddingLeft: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <h2 style={{
                    fontSize: '20px',
                    color: '#fff',
                    lineHeight: 1.1,
                    flex: 1,
                  }}>
                    {game.title.toUpperCase()}
                  </h2>
                  <span style={{
                    background: 'rgba(0,230,118,0.1)',
                    color: 'var(--green)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: '700',
                    border: '1px solid rgba(0,230,118,0.2)',
                    marginLeft: '8px',
                    whiteSpace: 'nowrap',
                  }}>
                    OPEN
                  </span>
                </div>

                <p style={{ color: '#888', fontSize: '13px', marginBottom: '6px' }}>
                  📍 {game.field_name}
                </p>
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '14px' }}>
                  🕐 {new Date(game.scheduled_at).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>👥</span>
                    <span style={{ fontSize: '13px', color: '#aaa' }}>
                      {game.min_players}–{game.max_players} игроков
                    </span>
                  </div>
                  <span style={{
                    fontSize: '16px',
                    color: 'var(--green)',
                    fontWeight: '700',
                  }}>
                    {game.price.toLocaleString()} сум
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
