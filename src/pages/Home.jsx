import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      Загрузка...
    </div>
  )

  return (
    <div style={{ padding: '20px 16px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '6px' }}>⚽ FutbolGO</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Ближайшие игры в Нукусе
      </p>

      {games.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#555',
          fontSize: '14px'
        }}>
          Пока нет игр. Скоро появятся! 🕐
        </div>
      ) : (
        games.map(game => (
          <div
            key={game.id}
            onClick={() => navigate(`/game/${game.id}`)}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px' }}>{game.title}</h2>
              <span style={{
                background: '#4CAF50',
                color: '#fff',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '12px',
              }}>
                Открыта
              </span>
            </div>

            <p style={{ color: '#aaa', fontSize: '13px', marginTop: '8px' }}>
              📍 {game.field_name}
            </p>
            <p style={{ color: '#aaa', fontSize: '13px', marginTop: '4px' }}>
              🕐 {new Date(game.scheduled_at).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #2a2a2a',
            }}>
              <span style={{ fontSize: '13px', color: '#888' }}>
                👥 {game.min_players}–{game.max_players} игроков
              </span>
              <span style={{ fontSize: '14px', color: '#4CAF50', fontWeight: 'bold' }}>
                {game.price.toLocaleString()} сум
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
