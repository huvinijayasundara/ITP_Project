import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

function DeliveryCard({ delivery, onAdvance }) {
  const nextStatus = {
    'assigned': 'out-for-delivery',
    'out-for-delivery': 'delivered'
  }[delivery.status]

  const statusColors = {
    'assigned': { bg: '#E3F2FD', text: '#1976D2', border: '#90CAF9' },
    'out-for-delivery': { bg: '#FFF8E1', text: '#F57C00', border: '#FFD54F' },
    'delivered': { bg: '#E8F5E9', text: '#388E3C', border: '#A5D6A7' },
    'cancelled': { bg: '#FFEBEE', text: '#D32F2F', border: '#EF9A9A' }
  }

  const statusColor = statusColors[delivery.status] || { bg: '#F5F5F5', text: '#666', border: '#E0E0E0' }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #E8D4C0',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'box-shadow 0.3s'
    }}
    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}
    onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
            Order #{delivery.order?._id?.slice(-8)}
          </h3>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            borderRadius: '20px',
            backgroundColor: statusColor.bg,
            color: statusColor.text,
            border: `1px solid ${statusColor.border}`
          }}>
            {delivery.status}
          </span>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#666' }}>
          {delivery.eta && (
            <div>ETA: {new Date(delivery.eta).toLocaleDateString()}</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Order ID:</span> {delivery.order?._id}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: '600', color: '#333' }}>Amount:</span> 
          <span style={{ color: '#8B4513', fontWeight: '600' }}> Rs. {delivery.order?.totalAmount}</span>
        </div>
        {delivery.order?.deliveryAddress && (
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Delivery:</span> {delivery.order.deliveryAddress.line1}, {delivery.order.deliveryAddress.city}
          </div>
        )}
        {delivery.order?.contactPhone && (
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Phone:</span> {delivery.order.contactPhone}
          </div>
        )}
        {delivery.notes && (
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Notes:</span> {delivery.notes}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {nextStatus ? (
          <button
            onClick={() => onAdvance(delivery)}
            style={{
              backgroundColor: '#B8764F',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#8B4513'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#B8764F'}
          >
            Mark as {nextStatus.replace('-', ' ')}
          </button>
        ) : (
          <span style={{ color: '#666', fontSize: '0.875rem' }}>Complete</span>
        )}
        <Link
          to={`/track/${delivery.order?._id}`}
          style={{
            color: '#8B4513',
            fontSize: '0.875rem',
            fontWeight: '600',
            textDecoration: 'underline'
          }}
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default function MyDeliveries() {
  const [list, setList] = useState([])
  const [stats, setStats] = useState({ assigned: 0, outForDelivery: 0, delivered: 0 })
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/deliveries')
      setList(data.items || [])
      
      const newStats = {
        assigned: data.items?.filter(d => d.status === 'assigned').length || 0,
        outForDelivery: data.items?.filter(d => d.status === 'out-for-delivery').length || 0,
        delivered: data.items?.filter(d => d.status === 'delivered').length || 0
      }
      setStats(newStats)
    } catch (error) {
      console.error('Failed to load deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const advance = async (delivery) => {
    const nextMap = { 'assigned': 'out-for-delivery', 'out-for-delivery': 'delivered' }
    const next = nextMap[delivery.status]
    if (!next) return

    try {
      await api.patch(`/deliveries/${delivery._id}/status`, { 
        status: next, 
        note: `Status updated to ${next}` 
      })
      await load()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const filteredList = filter === 'all' 
    ? list 
    : list.filter(d => d.status === filter)

  if (loading) {
    return (
      <div style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '2rem 1rem',
        backgroundColor: '#F5F5F5',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #B8764F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      backgroundColor: '#F5F5F5',
      minHeight: '100vh',
      paddingBottom: '2rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#8B4513', 
            marginBottom: '0.5rem' 
          }}>
            🚚 My Deliveries
          </h1>
          <p style={{ color: '#666', fontSize: '1.125rem' }}>
            Manage your assigned deliveries
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '1px solid #E8D4C0', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976D2', marginBottom: '0.25rem' }}>
              {stats.assigned}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Assigned</div>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '1px solid #E8D4C0', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F57C00', marginBottom: '0.25rem' }}>
              {stats.outForDelivery}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Out for Delivery</div>
          </div>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '1px solid #E8D4C0', 
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388E3C', marginBottom: '0.25rem' }}>
              {stats.delivered}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>Delivered</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['all', 'assigned', 'out-for-delivery', 'delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: filter === status ? '#B8764F' : '#E8D4C0',
                color: filter === status ? 'white' : '#8B4513',
                transition: 'all 0.3s'
              }}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Deliveries Grid */}
        {filteredList.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            border: '1px solid #E8D4C0' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📦</div>
            <div style={{ color: '#666', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {list.length === 0 ? 'No deliveries assigned yet' : 'No deliveries match the selected filter'}
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {filteredList.map(delivery => (
              <DeliveryCard 
                key={delivery._id} 
                delivery={delivery} 
                onAdvance={advance}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}