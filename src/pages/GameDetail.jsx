import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NOTIFY_URL = 'https://yajerdfaccnnxhvhqhes.supabase.co/functions/v1/notify'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhamVyZGZhY2NubnhodmhxaGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzU4MTUsImV4cCI6MjA5MjE1MTgxNX0.bi9biNsmVrX3vjizzmt2wzWu8xDN0JaBXganEPdf4dQ'

async function notify(type, game, extra = {}) {
  await fetch(NOTIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ type, game, ...extra }),
  })
}

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id

  useEffect(() => {
    fetchGame()
    fetchRegistrations()
  }, [])

  async function fetchGame() {
    const { data } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single()
    setGame(data)
    setLoading(false)
  }

  async function fetchRegistrations() {
    const { data } = await supabase
      .from('registrations')
      .select('*')
      .eq('game_id', id)
    setRegistrations(data || [])
    if (userId) {
      setRegistered(data?.some(r => r.user_id === userId))
    }
  }

  async function handleRegister() {
    if (!userId) {
      alert('Откройте через Telegram')
      return
    }
    setRegistering(true)

    const tgUser = window.Telegram.WebApp.initDataUnsafe.user
    await supabase.from('users').upsert({
      id: userId,
      username: tgUser.username || '',
      full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
    })

    const { error } = await supabase.from('registrations').insert({
      game_id: id,
      user_id: userId,
    })

    if (!error) {
      setRegistered(true)
      await notify('player_registered', game, { userId })

      const { data: regs } = await supabase
        .from('registrations')
        .select('*')
        .eq('game_id', id)

      const count = regs?.length || 0
      if (count === game.max_players) {
        await notify('game_full', game)
      } else if (count === game.min_players) {
        await notify('min_reached', game)
      }

      fetchRegistrations()
    }
    setRegistering(false)
  }

  async function handleCancel() {
    await supabase
      .from('registrations')
      .delete()
      .eq('game_id', id)
      .eq('user_id', userId)
    setRegistered(false)
    fetchRegistrations()
  }

  if (loading) return (
    <div style={{ padding: '20px 16px' }}>
      <div className="skeleton" style={{ width: '80px', height: '16px', marginBottom: '24px' }} />
      <div className="skeleton" style={{ width: '70%', height: '32px', marginBottom: '20px' }} />
      <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
        <div className="skeleton" style={{ width: '50%', height: '14px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '60%', height: '14px', marginBottom: '10px' }} />
        <div className="skeleton" style={{ width: '40%', height: '14px' }} />
      </div>
    </div>
  )

  if (!game) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
      Игра не найдена
    </div>
  )

  const spotsLeft = game.max_players - registrations.length
  const fillPercent = Math.round((registrations.length / game.max_players) * 100)

  return (
    <div style={{ padding: '20px 16px 100px', animation: 'fadeUp 0.3s ease' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--green)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        ← Назад
      </button>

      <h1 style={{
        fontFamily: 'Bebas Neue',
        fontSize: '32px',
        marginBottom: '20px',
        lineHeight: 1.1,
      }}>
        {game.title.toUpperCase()}
      </h1>

      {/* Info card */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
      }}>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
          📍 {game.field_name}
        </p>
        {game.address && (
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
            🗺 {game.address}
          </p>
        )}
        <p style={{ color: '#aaa', fontSize: '14px' }}>
          🕐 {new Date(game.scheduled_at).toLocaleString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Players progress */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '14px', color: '#aaa' }}>Игроки</span>
          <span style={{ fontSize: '15px', fontWeight: '700' }}>
            <span style={{ color: 'var(--green)' }}>{registrations.length}</span>
            <span style={{ color: 'var(--muted)' }}> / {game.max_players}</span>
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: '6px',
          background: '#1e1e1e',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '10px',
        }}>
          <div style={{
            height: '100%',
            width: `${fillPercent}%`,
            background: fillPercent === 100
              ? 'var(--danger)'
              : 'linear-gradient(90deg, var(--green-dim), var(--green))',
            borderRadius: '10px',
            boxShadow: '0 0 8px var(--green-glow)',
            transition: 'width 0.5s ease',
          }} />
        </div>

        <p style={{
          fontSize: '13px',
          color: spotsLeft <= 2 ? 'var(--danger)' : 'var(--green)',
          fontWeight: '600',
        }}>
          {spotsLeft > 0 ? `✅ Свободно мест: ${spotsLeft}` : '❌ Все места заняты'}
        </p>
      </div>

      {/* Price */}
      <div style={{
        background: 'linear-gradient(135deg, #0d1f0d, #111)',
        border: '1px solid rgba(0,230,118,0.2)',
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#888', fontSize: '14px' }}>Стоимость участия</span>
        <span style={{
          fontSize: '22px',
          fontFamily: 'Bebas Neue',
          color: 'var(--green)',
          letterSpacing: '1px',
          textShadow: '0 0 12px var(--green-glow)',
        }}>
          {game.price.toLocaleString()} СУМ
        </span>
      </div>

      {/* Button */}
      {registered ? (
        <button
          onClick={handleCancel}
          style={{
            width: '100%',
            padding: '18px',
            background: 'none',
            border: '2px solid var(--danger)',
            borderRadius: '14px',
            color: 'var(--danger)',
            fontSize: '15px',
            fontWeight: '700',
            cursor: 'pointer',
            letterSpacing: '0.5px',
          }}
        >
          ОТМЕНИТЬ ЗАПИСЬ
        </button>
      ) : (
        <button
          onClick={handleRegister}
          disabled={spotsLeft === 0 || registering}
          style={{
            width: '100%',
            padding: '18px',
            background: spotsLeft === 0
              ? '#1a1a1a'
              : 'linear-gradient(135deg, var(--green-dim), var(--green))',
            border: 'none',
            borderRadius: '14px',
            color: spotsLeft === 0 ? 'var(--muted)' : '#000',
            fontSize: '15px',
            fontWeight: '800',
            cursor: spotsLeft === 0 ? 'not-allowed' : 'pointer',
            letterSpacing: '0.5px',
            boxShadow: spotsLeft > 0 ? '0 4px 24px var(--green-glow)' : 'none',
            transition: 'opacity 0.2s',
            opacity: registering ? 0.7 : 1,
          }}
        >
          {registering ? 'ЗАПИСЬ...' : spotsLeft === 0 ? 'НЕТ МЕСТ' : 'ЗАПИСАТЬСЯ НА ИГРУ ⚽'}
        </button>
      )}
    </div>
  )
}
