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
    if (!userId) { alert('Откройте через Telegram'); return }
    if (!form.description.trim()) { alert('Напишите описание'); return }

    const tgUser = window.Telegram.WebApp.initDataUnsafe.user
    await supabase.from('users').upsert({
      id: userId,
      username: tgUser.username || '',
      full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
    })

    const { error } = await supabase.from('player_ads').insert({
      user_id: userId, ...form,
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

  const inputStyle = {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRadius: '10px',
    color: '#fff',
    padding: '12px',
    fontSize: '14px',
    marginBottom: '10px',
    outline: 'none',
  }

  return (
    <div style={{ padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{
        padding: '24px 20px 20px',
        background: 'linear-gradient(180deg, #0d0d1f 0%, var(--bg) 100%)',
        borderBottom: '1px solid #1a1a2a',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: '#fff', lineHeight: 1 }}>
              ПОИСК <span style={{ color: 'var(--green)' }}>ИГРОКОВ</span>
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
              Найди партнёров для игры
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? 'none' : 'var(--green)',
              border: showForm ? '1px solid #333' : 'none',
              borderRadius: '12px',
              color: showForm ? '#666' : '#000',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '800',
              cursor: 'pointer',
              letterSpacing: '0.3px',
            }}
          >
            {showForm ? 'ОТМЕНА' : '+ ОБЪЯВЛЕНИЕ'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Form */}
        {showForm && (
          <div
            className="fade-up"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '16px',
            }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>НОВОЕ ОБЪЯВЛЕНИЕ</h3>

            <textarea
              placeholder="Описание (например: ищу 3 игрока на завтра, уровень средний)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
            <input
              placeholder="Район / место (например: Достлык)"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              style={inputStyle}
            />
            <input
              placeholder="Когда играем (например: суббота 17:00)"
              value={form.play_time}
              onChange={e => setForm({ ...form, play_time: e.target.value })}
              style={inputStyle}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ color: '#888', fontSize: '14px' }}>Нужно игроков:</span>
              <input
                type="number"
                min="1"
                max="20"
                value={form.players_needed}
                onChange={e => setForm({ ...form, players_needed: parseInt(e.target.value) })}
                style={{ ...inputStyle, width: '70px', textAlign: 'center', marginBottom: 0 }}
              />
            </div>

            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, var(--green-dim), var(--green))',
                border: 'none',
                borderRadius: '12px',
                color: '#000',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 20px var(--green-glow)',
              }}
            >
              ОПУБЛИКОВАТЬ
            </button>
          </div>
        )}

        {/* Ads list */}
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{
              background: 'var(--card)',
              borderRadius: '16px',
              padding: '18px',
              marginBottom: '12px',
            }}>
              <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '10px' }} />
              <div className="skeleton" style={{ width: '50%', height: '13px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '40%', height: '13px' }} />
            </div>
          ))
        ) : ads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
            <p style={{ fontSize: '15px', color: '#444' }}>Пока нет объявлений</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Будь первым!</p>
          </div>
        ) : (
          ads.map((ad, i) => (
            <div
              key={ad.id}
              className="fade-up"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '12px',
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
                opacity: 0.6,
              }} />

              <div style={{ paddingLeft: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.5', flex: 1, color: '#ddd' }}>
                    {ad.description}
                  </p>
                  {ad.user_id === userId && (
                    <button
                      onClick={() => handleDelete(ad.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#444',
                        fontSize: '18px',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {ad.location && (
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '8px' }}>
                    📍 {ad.location}
                  </p>
                )}
                {ad.play_time && (
                  <p style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>
                    🕐 {ad.play_time}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border)',
                }}>
                  <span style={{
                    background: 'rgba(0,230,118,0.08)',
                    color: 'var(--green)',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid rgba(0,230,118,0.15)',
                  }}>
                    👥 {ad.players_needed} чел.
                  </span>
                  <span style={{ color: '#333', fontSize: '12px' }}>
                    {ad.users?.full_name || ad.users?.username || 'Аноним'}
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
