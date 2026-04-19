import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_ID = 938184349
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

export default function Admin() {
  const navigate = useNavigate()
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
  const [games, setGames] = useState([])
  const [form, setForm] = useState({
    title: '',
    field_name: '',
    address: '',
    scheduled_at: '',
    max_players: 10,
    min_players: 6,
    price: 0,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tab, setTab] = useState('create')

  useEffect(() => {
    if (tab === 'games') fetchGames()
  }, [tab])

  async function fetchGames() {
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('scheduled_at', { ascending: false })
    setGames(data || [])
  }

  async function handleCreate() {
    if (!form.title || !form.field_name || !form.scheduled_at) {
      alert('Заполни обязательные поля')
      return
    }
    setLoading(true)
    const gameData = {
      ...form,
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      max_players: parseInt(form.max_players),
      min_players: parseInt(form.min_players),
      price: parseInt(form.price),
    }

    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single()

    setLoading(false)
    if (!error) {
      await notify('game_created', data)
      setSuccess(true)
      setForm({
        title: '',
        field_name: '',
        address: '',
        scheduled_at: '',
        max_players: 10,
        min_players: 6,
        price: 0,
      })
      setTimeout(() => {
        setSuccess(false)
        navigate('/')
      }, 1500)
    }
  }

  async function handleCancel(game) {
    if (!confirm(`Отменить игру "${game.title}"?`)) return

    const { data: regs } = await supabase
      .from('registrations')
      .select('user_id')
      .eq('game_id', game.id)

    const players = regs?.map(r => r.user_id) || []

    await supabase
      .from('games')
      .update({ status: 'cancelled' })
      .eq('id', game.id)

    await notify('game_cancelled', game, { players })
    fetchGames()
  }

  async function handleReminder(game) {
    const { data: regs } = await supabase
      .from('registrations')
      .select('user_id')
      .eq('game_id', game.id)

    const players = regs?.map(r => r.user_id) || []

    if (players.length === 0) {
      alert('Нет записавшихся игроков')
      return
    }

    await notify('reminder', game, { players })
    alert(`Напоминание отправлено ${players.length} игрокам`)
  }

  if (userId !== ADMIN_ID) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</p>
        <p>Нет доступа</p>
      </div>
    )
  }

  const inputStyle = {
    width: '100%',
    background: '#0f0f0f',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '10px',
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: 'none',
          color: '#4CAF50',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '16px',
          padding: 0,
        }}
      >
        ← Назад
      </button>

      <h1 style={{ fontSize: '22px', marginBottom: '16px' }}>🛠 Админ панель</h1>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['create', 'games'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px',
              background: tab === t ? '#4CAF50' : '#1a1a1a',
              border: '1px solid',
              borderColor: tab === t ? '#4CAF50' : '#333',
              borderRadius: '10px',
              color: tab === t ? '#fff' : '#888',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {t === 'create' ? '➕ Создать' : '📋 Игры'}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <>
          {success && (
            <div style={{
              background: '#1a3a1a',
              border: '1px solid #4CAF50',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '16px',
              color: '#4CAF50',
              textAlign: 'center',
            }}>
              ✅ Игра успешно создана!
            </div>
          )}

          <input
            placeholder="Название игры *"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Название поля *"
            value={form.field_name}
            onChange={e => setForm({ ...form, field_name: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Адрес поля"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            style={inputStyle}
          />
          <input
            type="datetime-local"
            value={form.scheduled_at}
            onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>Мин. игроков</p>
              <input
                type="number"
                value={form.min_players}
                onChange={e => setForm({ ...form, min_players: e.target.value })}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>Макс. игроков</p>
              <input
                type="number"
                value={form.max_players}
                onChange={e => setForm({ ...form, max_players: e.target.value })}
                style={{ ...inputStyle, marginBottom: 0 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>Цена (сум)</p>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              style={{ ...inputStyle, marginBottom: 0 }}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#333' : '#4CAF50',
              border: 'none',
              borderRadius: '12px',
              color: loading ? '#666' : '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Создаём...' : 'Создать игру'}
          </button>
        </>
      )}

      {tab === 'games' && (
        <>
          {games.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
              Нет игр
            </div>
          ) : (
            games.map(game => (
              <div
                key={game.id}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{game.title}</p>
                  <span style={{
                    background: game.status === 'cancelled' ? '#3a1a1a' : '#1a3a1a',
                    color: game.status === 'cancelled' ? '#FF5722' : '#4CAF50',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '12px',
                  }}>
                    {game.status === 'cancelled' ? 'Отменена' : 'Открыта'}
                  </span>
                </div>
                <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
                  📍 {game.field_name}
                </p>
                <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                  🕐 {new Date(game.scheduled_at).toLocaleString('ru-RU', {
                    day: 'numeric', month: 'long',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>

                {game.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => handleReminder(game)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'none',
                        border: '1px solid #4CAF50',
                        borderRadius: '8px',
                        color: '#4CAF50',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      ⏰ Напомнить
                    </button>
                    <button
                      onClick={() => handleCancel(game)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'none',
                        border: '1px solid #FF5722',
                        borderRadius: '8px',
                        color: '#FF5722',
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      ❌ Отменить
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
