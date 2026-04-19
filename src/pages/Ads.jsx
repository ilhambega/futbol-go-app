import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Ads() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    description: '',
    location: '',
    play_time: '',
    players_needed: 1,
  })
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id

  useEffect(() => {
    fetchAds()
  }, [])

  async function fetchAds() {
    const { data } = await supabase
      .from('player_ads')
      .select('*, users(full_name, username)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    setAds(data || [])
    setLoading(false)
  }

  async function handleSubmit() {
    if (!userId) {
      alert('Откройте через Telegram')
      return
    }
    if (!form.description.trim()) {
      alert('Напишите описание')
      return
    }

    const tgUser = window.Telegram.WebApp.initDataUnsafe.user
    await supabase.from('users').upsert({
      id: userId,
      username: tgUser.username || '',
      full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
    })

    const { error } = await supabase.from('player_ads').insert({
      user_id: userId,
      ...form,
    })

    if (!error) {
      setShowForm(false)
      setForm({ description: '', location: '', play_time: '', players_needed: 1 })
      fetchAds()
    }
  }

  async function handleDelete(adId) {
    await supabase
      .from('player_ads')
      .update({ is_active: false })
      .eq('id', adId)
      .eq('user_id', userId)
    fetchAds()
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      Загрузка...
    </div>
  )

  return (
    <div style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px' }}>🔍 Поиск игроков</h1>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
            Найди партнёров для игры
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#4CAF50',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            padding: '10px 14px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          + Объявление
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <h3 style={{ marginBottom: '14px', fontSize: '16px' }}>Новое объявление</h3>

          <textarea
            placeholder="Описание (например: ищу 3 игрока на завтра, уровень средний)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              padding: '10px',
              fontSize: '14px',
              marginBottom: '10px',
              resize: 'none',
            }}
          />

          <input
            placeholder="Район / место (например: Достлык)"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              padding: '10px',
              fontSize: '14px',
              marginBottom: '10px',
            }}
          />

          <input
            placeholder="Когда играем (например: суббота 17:00)"
            value={form.play_time}
            onChange={e => setForm({ ...form, play_time: e.target.value })}
            style={{
              width: '100%',
              background: '#0f0f0f',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#fff',
              padding: '10px',
              fontSize: '14px',
              marginBottom: '10px',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ color: '#888', fontSize: '14px' }}>Нужно игроков:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={form.players_needed}
              onChange={e => setForm({ ...form, players_needed: parseInt(e.target.value) })}
              style={{
                width: '60px',
                background: '#0f0f0f',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmit}
              style={{
                flex: 1,
                padding: '12px',
                background: '#4CAF50',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Опубликовать
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '12px 16px',
                background: 'none',
                border: '1px solid #333',
                borderRadius: '10px',
                color: '#888',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {ads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555', fontSize: '14px' }}>
          Пока нет объявлений. Будь первым! 👋
        </div>
      ) : (
        ads.map(ad => (
          <div
            key={ad.id}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ fontSize: '14px', lineHeight: '1.5', flex: 1 }}>{ad.description}</p>
              {ad.user_id === userId && (
                <button
                  onClick={() => handleDelete(ad.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF5722',
                    fontSize: '18px',
                    cursor: 'pointer',
                    marginLeft: '10px',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {ad.location && (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '8px' }}>
                📍 {ad.location}
              </p>
            )}
            {ad.play_time && (
              <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>
                🕐 {ad.play_time}
              </p>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #2a2a2a',
            }}>
              <span style={{ color: '#4CAF50', fontSize: '13px' }}>
                👥 Нужно: {ad.players_needed} чел.
              </span>
              <span style={{ color: '#555', fontSize: '12px' }}>
                {ad.users?.full_name || ad.users?.username || 'Аноним'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
              }
