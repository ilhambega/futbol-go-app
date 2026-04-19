import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [registered, setRegistered] = useState(false)
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

    // Сначала убедимся что пользователь есть в таблице users
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
      fetchRegistrations()
    }
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
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      Загрузка...
    </div>
  )

  if (!game) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
      Игра не найдена
    </div>
  )

  const spotsLeft = game.max_players - registrations.length

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

      <h1 style={{ fontSize: '22px', marginBottom: '16px' }}>{game.title}</h1>

      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
          📍 {game.field_name}
        </p>
        {game.address && (
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
            🗺 {game.address}
          </p>
        )}
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
          🕐 {new Date(game.scheduled_at).toLocaleString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '10px' }}>
          👥 Записалось: {registrations.length} / {game.max_players}
        </p>
        <p style={{ color: spotsLeft <= 2 ? '#FF5722' : '#4CAF50', fontSize: '14px' }}>
          {spotsLeft > 0 ? `✅ Свободно мест: ${spotsLeft}` : '❌ Мест нет'}
        </p>
      </div>

      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#888', fontSize: '14px' }}>Стоимость участия</span>
        <span style={{ color: '#4CAF50', fontSize: '20px', fontWeight: 'bold' }}>
          {game.price.toLocaleString()} сум
        </span>
      </div>

      {registered ? (
        <button
          onClick={handleCancel}
          style={{
            width: '100%',
            padding: '16px',
            background: 'none',
            border: '2px solid #FF5722',
            borderRadius: '12px',
            color: '#FF5722',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Отменить запись
        </button>
      ) : (
        <button
          onClick={handleRegister}
          disabled={spotsLeft === 0}
          style={{
            width: '100%',
            padding: '16px',
            background: spotsLeft === 0 ? '#333' : '#4CAF50',
            border: 'none',
            borderRadius: '12px',
            color: spotsLeft === 0 ? '#666' : '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: spotsLeft === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {spotsLeft === 0 ? 'Мест нет' : 'Записаться на игру'}
        </button>
      )}
    </div>
  )
}
