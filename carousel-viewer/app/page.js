'use client'

import { useState } from 'react'

// Generate SQL Days 1-30
const sqlDays = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1
  const padded = day.toString().padStart(2, '0')
  const topics = [
    'What is SQL?', 'SELECT Basics', 'WHERE Clauses', 'ORDER BY', 'LIMIT & OFFSET',
    'INSERT INTO', 'UPDATE Statements', 'DELETE Statements', 'Data Types', 'NULL Values',
    'AND / OR / NOT', 'IN & BETWEEN', 'LIKE Pattern', 'Aggregate Functions', 'GROUP BY',
    'JOIN Basics', 'LEFT JOIN', 'Multiple JOINs', 'Subqueries', 'UNION & UNION ALL',
    'Aliases', 'CASE Statements', 'Date Functions', 'String Functions', 'Window Functions',
    'CTEs', 'Views', 'Indexes', 'Transactions', 'Real Project'
  ]
  const levels = ['Beginner', 'Beginner', 'Beginner', 'Beginner', 'Beginner',
    'Beginner', 'Beginner', 'Beginner', 'Beginner', 'Beginner',
    'Beginner', 'Beginner', 'Beginner', 'Intermediate', 'Intermediate',
    'Intermediate', 'Intermediate', 'Intermediate', 'Intermediate', 'Intermediate',
    'Intermediate', 'Intermediate', 'Intermediate', 'Intermediate', 'Advanced',
    'Advanced', 'Advanced', 'Advanced', 'Advanced', 'Advanced']
  return {
    id: `S${padded}`,
    title: `SQL Day ${day}`,
    desc: topics[i],
    file: `sql-day${padded}-grid.html`,
    type: 'sql',
    style: 'grid',
    level: levels[i],
    colors: ['#d4cfc7', '#1a1a1a', '#2563eb', '#ffffff']
  }
})

const generalCarousels = [
  {
    id: '01',
    title: 'Zigzag Bold',
    desc: 'Purple/blue zigzag arrows',
    file: '01-zigzag-bold.html',
    type: 'morning',
    style: 'zigzag',
    colors: ['#7c3aed', '#2563eb', '#0f172a', '#f8fafc']
  },
  {
    id: '02',
    title: 'Circular Soft',
    desc: 'Pink/cream circles',
    file: '02-circular-soft.html',
    type: 'morning',
    style: 'circular',
    colors: ['#f8b4b4', '#fef3e2', '#1a1a1a', '#dc2626']
  },
  {
    id: '05',
    title: 'Arrow Gradient',
    desc: 'Indigo curved arrows',
    file: '05-arrow-gradient.html',
    type: 'morning',
    style: 'arrow',
    colors: ['#6366f1', '#8b5cf6', '#1e1b4b', '#faf5ff']
  },
  {
    id: '06',
    title: 'Wave Soft',
    desc: 'Pink wavy lines',
    file: '06-wave-soft.html',
    type: 'morning',
    style: 'wave',
    colors: ['#f8b4b4', '#fecdd3', '#1a1a1a', '#e11d48']
  },
  {
    id: '13',
    title: 'News Bold Purple',
    desc: 'Black/purple bold',
    file: '13-news-bold-purple.html',
    type: 'morning',
    style: 'bold',
    colors: ['#7c3aed', '#a855f7', '#0a0a0a', '#ffffff']
  },
  {
    id: '15',
    title: 'News Pink Wavy',
    desc: 'Pink/cream wavy',
    file: '15-news-pink-wavy.html',
    type: 'morning',
    style: 'wavy',
    colors: ['#f8b4b4', '#fef3e2', '#1a1a1a', '#dc2626']
  },
  {
    id: '19',
    title: 'Editorial Highlight',
    desc: 'Magazine text effects',
    file: '19-editorial-highlight.html',
    type: 'morning',
    style: 'editorial',
    colors: ['#e8e4df', '#1a1a1a', '#93c5fd', '#dc2626']
  },
  {
    id: '20',
    title: 'Grid System',
    desc: 'Swiss grid design',
    file: '20-grid-system.html',
    type: 'morning',
    style: 'grid',
    colors: ['#d4cfc7', '#1a1a1a', '#2563eb', '#ffffff']
  }
]

const allCarousels = [...sqlDays, ...generalCarousels]

function CarouselPreview({ file, title }) {
  return (
    <div style={{
      width: '100%',
      height: '280px',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#1a1a1a',
      position: 'relative'
    }}>
      <iframe
        src={`/carousels/${file}`}
        style={{
          width: '1080px',
          height: '1080px',
          border: 'none',
          transform: 'scale(0.259)',
          transformOrigin: 'top left',
          pointerEvents: 'none'
        }}
        title={title}
        loading="lazy"
      />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.9) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  )
}

function ColorPalette({ colors }) {
  return (
    <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '3px',
            background: color,
            border: '1px solid rgba(255,255,255,0.2)'
          }}
          title={color}
        />
      ))}
    </div>
  )
}

export default function Home() {
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('carousels')

  const filtered = filter === 'all' 
    ? allCarousels 
    : filter === 'sql' 
      ? sqlDays 
      : generalCarousels

  const openCarousel = (file) => {
    window.open(`/carousels/${file}`, '_blank')
  }

  return (
    <div className="container">
      <h1>SQL 30-Day Series</h1>
      <p className="subtitle">30 SQL carousels (Grid style) + 8 general carousels</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
        <button
          onClick={() => setView('carousels')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: view === 'carousels' ? '#2563eb' : '#1a1a1a',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Carousels ({allCarousels.length})
        </button>
        <button
          onClick={() => setView('schedule')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: view === 'schedule' ? '#2563eb' : '#1a1a1a',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Schedule
        </button>
      </div>

      {view === 'carousels' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', label: `All (${allCarousels.length})` },
              { key: 'sql', label: `SQL Series (${sqlDays.length})` },
              { key: 'morning', label: `General (${generalCarousels.length})` }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: filter === f.key ? '#2563eb' : '#1a1a1a',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filter === 'sql' && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                const count = sqlDays.filter(d => d.level === level).length
                return (
                  <span
                    key={level}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: level === 'Beginner' ? 'rgba(16,185,129,0.2)' : level === 'Intermediate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                      color: level === 'Beginner' ? '#10b981' : level === 'Intermediate' ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    {level}: {count} days
                  </span>
                )
              })}
            </div>
          )}

          <div className="section">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {filtered.map(carousel => (
                <div
                  key={carousel.id}
                  onClick={() => openCarousel(carousel.file)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.borderColor = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.borderColor = '#333'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <CarouselPreview file={carousel.file} title={carousel.title} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{carousel.title}</div>
                      <span style={{ 
                        background: carousel.type === 'sql' ? '#2563eb' : '#7c3aed', 
                        color: '#fff', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        #{carousel.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{carousel.desc}</div>
                    {carousel.level && (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: carousel.level === 'Beginner' ? 'rgba(16,185,129,0.2)' : carousel.level === 'Intermediate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: carousel.level === 'Beginner' ? '#10b981' : carousel.level === 'Intermediate' ? '#f59e0b' : '#ef4444'
                      }}>
                        {carousel.level}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'schedule' && (
        <div style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #333'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#fff' }}>30-Day Posting Schedule</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Day</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Time</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Topic</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#888' }}>Level</th>
                </tr>
              </thead>
              <tbody>
                {sqlDays.map((day, i) => {
                  const startDate = new Date('2026-08-18')
                  const postDate = new Date(startDate)
                  postDate.setDate(startDate.getDate() + i)
                  const dateStr = postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  return (
                    <tr key={day.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '10px', color: '#fff', fontWeight: '600' }}>Day {i + 1}</td>
                      <td style={{ padding: '10px', color: '#888' }}>{dateStr}</td>
                      <td style={{ padding: '10px', color: '#2563eb' }}>7:00 PM</td>
                      <td style={{ padding: '10px', color: '#fff' }}>{day.desc}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: day.level === 'Beginner' ? 'rgba(16,185,129,0.2)' : day.level === 'Intermediate' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                          color: day.level === 'Beginner' ? '#10b981' : day.level === 'Intermediate' ? '#f59e0b' : '#ef4444'
                        }}>
                          {day.level}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
