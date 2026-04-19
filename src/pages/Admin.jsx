import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_ID = 938184349

export default function Admin() {
  const navigate = useNavigate()
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id
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

  if (userId !== ADMIN_ID) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <p style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</p>
        <p>Нет доступа</p>
      </div>
    )
  }

  async function handleCreate() {
    if (!form.title || !form.field_name || !form.scheduled_at) {
      alert('Заполни обязательные поля')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('games').insert({
  ...form,
  scheduled_at: new Date(form.scheduled_at).toISOString(),
  max_players: parseInt(form.max_players),
  min_players: parseInt(form.min_players),
  price: parseInt(form.price),
})
    setLoading(false)
    if (!error) {
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
      setTimeout(() => navigate('/'), 1500)
    }
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

      <h1 style={{ fontSize: '22px', marginBottom: '20px' }}>🛠 Создать игру</h1>

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
    </div>
  )
}
