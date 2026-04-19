import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GameDetail from './pages/GameDetail'
import Ads from './pages/Ads'
import Profile from './pages/Profile'
import BottomNav from './components/BottomNav'
import Admin from './pages/Admin'

export default function App() {
  return (
    <div style={{ paddingBottom: '70px' }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:id" element={<GameDetail />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/profile" element={<Profile />} />
<Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
