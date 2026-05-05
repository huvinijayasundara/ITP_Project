import { useEffect, useMemo, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { AuthContext } from '../components/context/AuthContext'

const steps = [
  { id: 'assigned', label: 'Order Assigned', icon: '📦', description: 'Delivery person assigned' },
  { id: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚', description: 'Package is on the way' },
  { id: 'delivered', label: 'Delivered', icon: '✅', description: 'Successfully delivered' }
]

function ProgressStepper({ current, deliveredAt }) {
  const currentIdx = steps.findIndex(step => step.id === current)
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIdx
          const isCurrent = idx === currentIdx
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110' 
                    : 'bg-gray-200 text-gray-500'
                } ${isCurrent ? 'ring-4 ring-blue-200 animate-pulse' : ''}`}>
                  {step.icon}
                </div>
                
                {idx < steps.length - 1 && (
                  <div className={`absolute top-6 left-6 w-full h-1 -z-10 transition-all duration-500 ${
                    idx < currentIdx ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-200'
                  }`} style={{ width: 'calc(100vw / 3 - 48px)' }} />
                )}
              </div>
              
              <div className="mt-3 text-center">
                <div className={`font-medium text-sm ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                  {step.label}
                </div>
                <div className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {step.description}
                </div>
                {step.id === 'delivered' && deliveredAt && (
                  <div className="text-xs text-green-600 mt-1">
                    {new Date(deliveredAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const badges = {
    'assigned': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: '📦' },
    'out-for-delivery': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: '🚚' },
    'delivered': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: '✅' },
    'cancelled': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: '❌' }
  }
  
  const badge = badges[status] || badges['assigned']
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
      <span>{badge.icon}</span>
      <span className="capitalize">{status?.replace('-', ' ')}</span>
    </span>
  )
}

export default function Track() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deliveryPersons, setDeliveryPersons] = useState([])
  const [form, setForm] = useState({ deliveryPersonId: '', eta: '', notes: '' })

  const canAdmin = useMemo(() => user && ['admin'].includes((user.role || '').toLowerCase()), [user])

  // ✅ Load tracking data
  useEffect(() => {
    if (!orderId) return
    
    let isMounted = true
    
    const loadTrackingData = async () => {
      setLoading(true)
      setError('')
      
      try {
        console.log('🔍 Loading tracking data for order:', orderId)
        const response = await api.get(`/deliveries/track/${orderId}`)
        
        if (isMounted) {
          console.log('✅ Tracking data received:', response.data)
          // ✅ Your backend returns custom structure with order, deliveryPerson, status, etc.
          setData(response.data)
          setError('')
        }
      } catch (e) {
        console.error('❌ Tracking error:', e.response?.data || e.message)
        if (isMounted) {
          setData(null)
          if (e.response?.status === 404) {
            setError('No delivery assignment found for this order')
          } else if (e.response?.status === 403) {
            setError('Access denied: You do not have permission to view this delivery')
          } else {
            setError(e.response?.data?.message || 'Error loading tracking information')
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    loadTrackingData()
    
    return () => {
      isMounted = false
    }
  }, [orderId])

  // ✅ Load delivery persons (admin only)
  useEffect(() => {
    if (!canAdmin) return
    
    let isMounted = true
    
    const loadDeliveryPersons = async () => {
      try {
        console.log('👥 Loading delivery persons...')
        const response = await api.get('/deliveries/persons/all')
        
        if (isMounted) {
          console.log('✅ Delivery persons loaded:', response.data)
          setDeliveryPersons(response.data)
        }
      } catch (err) {
        console.error('❌ Failed to load delivery persons:', err.response?.data || err.message)
        if (isMounted && err.response?.status === 403) {
          console.log('⚠️ Not admin, skipping delivery persons load')
        }
      }
    }
    
    loadDeliveryPersons()
    
    return () => {
      isMounted = false
    }
  }, [canAdmin])

  // ✅ Reload tracking data
  const reloadTracking = async () => {
    try {
      console.log('🔄 Reloading tracking data...')
      const response = await api.get(`/deliveries/track/${orderId}`)
      console.log('✅ Tracking data reloaded:', response.data)
      setData(response.data)
      setError('')
    } catch (e) {
      console.error('❌ Reload error:', e.response?.data || e.message)
      setError(e.response?.data?.message || 'Error reloading tracking information')
    }
  }

  const handleCreateDelivery = async () => {
    if (!form.deliveryPersonId) {
      setError('Please select a delivery person')
      return
    }
    
    setUpdating(true)
    setError('')
    
    try {
      console.log('🚀 Creating delivery assignment...')
      const payload = {
        orderId,
        deliveryPersonId: form.deliveryPersonId
      }
      
      // Add optional fields if provided
      if (form.eta) payload.eta = new Date(form.eta).toISOString()
      if (form.notes) payload.notes = form.notes
      
      console.log('📤 Sending payload:', payload)
      
      const response = await api.post('/deliveries', payload)
      
      console.log('✅ Delivery created:', response.data)
      
      await reloadTracking()
      setError('')
      setForm({ deliveryPersonId: '', eta: '', notes: '' })
    } catch (e) { 
      console.error('❌ Create delivery error:', e.response?.data || e.message)
      setError(e.response?.data?.message || e.message || 'Failed to create tracking')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading Tracking Information</h3>
          <p className="text-gray-500 animate-pulse">Please wait while we fetch your order details...</p>
        </div>
      </div>
    )
  }

  if (error && !canAdmin && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl shadow-2xl border border-red-100">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Tracking Not Available</h2>
          <p className="text-red-500 mb-8">{error}</p>
          <button 
            onClick={() => navigate('/orders')}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="text-xl">←</span>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
                <p className="text-sm text-gray-600">Order ID: #{orderId?.slice(-8)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-amber-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* No Tracking - Admin Creation Form */}
        {!data && canAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl shadow-xl border border-amber-200 p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚚</div>
              <h2 className="text-2xl font-bold text-amber-800 mb-2">No Delivery Assignment Yet</h2>
              <p className="text-amber-700">Create a delivery assignment to start tracking this order.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Person *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={form.deliveryPersonId} 
                    onChange={e => setForm({...form, deliveryPersonId: e.target.value})}
                  >
                    <option value="">Select delivery person</option>
                    {deliveryPersons.map(dp => (
                      <option key={dp._id} value={dp._id}>
                        {dp.name} ({dp.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Delivery</label>
                  <input 
                    type="datetime-local" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={form.eta} 
                    onChange={e => setForm({...form, eta: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <input 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Special instructions..." 
                    value={form.notes} 
                    onChange={e => setForm({...form, notes: e.target.value})} 
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={handleCreateDelivery}
                    disabled={updating || !form.deliveryPersonId}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create Tracking'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Tracking Content */}
        {data && (
          <div className="space-y-8">
            {/* Progress Stepper */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Delivery Progress</h2>
                <StatusBadge status={data.status} />
              </div>
              <ProgressStepper current={data.status} deliveredAt={data.deliveredAt} />
            </div>

            {/* Order & Delivery Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
                    📋
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                    <p className="text-sm text-gray-600">#{data.order?._id?.slice(-8)}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Total Amount</span>
                        <p className="text-lg font-bold text-green-600">Rs. {data.order?.totalAmount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Contact Phone</span>
                        <p className="font-semibold text-gray-900">{data.order?.contactPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {data.order?.deliveryAddress && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <span className="text-sm font-medium text-gray-500">Delivery Address</span>
                      <p className="font-semibold text-gray-900 mt-1">
                        {typeof data.order.deliveryAddress === 'string' 
                          ? data.order.deliveryAddress 
                          : `${data.order.deliveryAddress.line1 || ''}, ${data.order.deliveryAddress.city || ''}`
                        }
                      </p>
                    </div>
                  )}
                  
                  {data.eta && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <span className="text-sm font-medium text-gray-500">Estimated Delivery</span>
                      <p className="font-semibold text-blue-600 mt-1">
                        {new Date(data.eta).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {data.notes && (
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <span className="text-sm font-medium text-gray-500">Delivery Notes</span>
                      <p className="font-semibold text-gray-900 mt-1">{data.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Delivery Person Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl">
                    🧑‍✈️
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Assigned To</h3>
                    <p className="text-sm text-gray-600">{data.deliveryPerson?.name || 'Unassigned'}</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name</span>
                      <p className="font-semibold text-gray-900">{data.deliveryPerson?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email</span>
                      <p className="font-semibold text-gray-900 text-sm">{data.deliveryPerson?.email || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Status Timeline</h3>
              <div className="space-y-4">
                {(data.history || []).map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 capitalize">{h.status.replace('-', ' ')}</div>
                      {h.note && <div className="text-sm text-gray-600">{h.note}</div>}
                      <div className="text-xs text-gray-500 mt-1">{new Date(h.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {(!data.history || data.history.length === 0) && (
                  <div className="text-gray-500 text-center py-4">No history yet</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}