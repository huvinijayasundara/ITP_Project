// pages/Deliveries.js - FIXED VERSION
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { downloadWithAuth } from '../lib/download'

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(String(s || ''))

const allowedNextStatuses = (current) => {
  switch (current) {
    case 'assigned':
      return ['out-for-delivery', 'cancelled']
    case 'out-for-delivery':
      return ['delivered', 'cancelled']
    default:
      return []
  }
}

function StatusBadge({ status }) {
  const badges = {
    'assigned': { 
      bg: 'bg-gradient-to-r from-blue-100 to-blue-200', 
      text: 'text-blue-800', 
      border: 'border-blue-300',
      icon: '📦'
    },
    'out-for-delivery': { 
      bg: 'bg-gradient-to-r from-yellow-100 to-amber-200', 
      text: 'text-amber-800', 
      border: 'border-amber-300',
      icon: '🚚'
    },
    'delivered': { 
      bg: 'bg-gradient-to-r from-green-100 to-emerald-200', 
      text: 'text-emerald-800', 
      border: 'border-emerald-300',
      icon: '✅'
    },
    'cancelled': { 
      bg: 'bg-gradient-to-r from-red-100 to-rose-200', 
      text: 'text-rose-800', 
      border: 'border-rose-300',
      icon: '❌'
    }
  }
  
  const badge = badges[status] || badges['assigned']
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border shadow-sm transition-all hover:shadow-md ${badge.bg} ${badge.text} ${badge.border}`}>
      <span className="text-base">{badge.icon}</span>
      <span className="capitalize">{status?.replace('-', ' ')}</span>
    </span>
  )
}

function DeliveryCard({ delivery, onEdit, onStatusUpdate, onDelete, editId, editForm, setEditForm, statusUpdate, setStatusUpdate, statusNote, setStatusNote, deliveryPersons, busy }) {
  const isEditing = editId === delivery._id
  const nextStatuses = allowedNextStatuses(delivery.status)
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
            #{delivery.order?.orderNumber || '??'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Order #{delivery.order?._id?.slice(-8)}</h3>
            <p className="text-sm text-gray-600">Rs. {delivery.order?.totalAmount?.toLocaleString()}</p>
          </div>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      {/* Delivery Person Info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
            {delivery.deliveryPerson?.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{delivery.deliveryPerson?.name || 'Unassigned'}</h4>
            <p className="text-sm text-gray-600">{delivery.deliveryPerson?.email}</p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</span>
          <p className="font-semibold text-gray-900">{delivery.order?.contactPhone}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">ETA</span>
          <p className="font-semibold text-gray-900">
            {delivery.eta ? new Date(delivery.eta).toLocaleDateString() : 'Not set'}
          </p>
        </div>
      </div>

      {delivery.notes && (
        <div className="bg-blue-50 rounded-lg p-3 mb-6">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Notes</span>
          <p className="text-sm text-blue-800 mt-1">{delivery.notes}</p>
        </div>
      )}

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 mb-6 border border-yellow-200">
          <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <span>✏️</span>
            <span>Edit Delivery</span>
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Person</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editForm.deliveryPersonId}
                onChange={e => setEditForm({...editForm, deliveryPersonId: e.target.value})}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">ETA</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={editForm.eta}
                onChange={e => setEditForm({...editForm, eta: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={editForm.notes}
                onChange={e => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Special instructions..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Status Update */}
      {nextStatuses.length > 0 && !isEditing && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>🔄</span>
            <span>Update Status</span>
          </h4>
          <div className="space-y-3">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={statusUpdate[delivery._id] || ''}
              onChange={e => setStatusUpdate({...statusUpdate, [delivery._id]: e.target.value})}
            >
              <option value="">Select new status...</option>
              {nextStatuses.map(status => (
                <option key={status} value={status}>
                  {status.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            {statusUpdate[delivery._id] && (
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Add a note (optional)"
                value={statusNote[delivery._id] || ''}
                onChange={e => setStatusNote({...statusNote, [delivery._id]: e.target.value})}
              />
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={() => onEdit(delivery._id, 'save')}
              disabled={busy}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => onEdit(delivery._id, 'cancel')}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onEdit(delivery._id, 'start')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Edit
            </button>
            <Link
              to={`/track/${delivery.order?._id}`}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
            >
              Track
            </Link>
            {statusUpdate[delivery._id] && (
              <button
                onClick={() => onStatusUpdate(delivery._id)}
                disabled={busy}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none"
              >
                {busy ? 'Updating...' : 'Apply'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Delete Button */}
      {!isEditing && (
        <button
          onClick={() => onDelete(delivery._id)}
          className="w-full mt-3 text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-xl font-medium transition-colors"
        >
          Delete Delivery
        </button>
      )}
    </div>
  )
}

export default function Deliveries() {
  const [list, setList] = useState([])
  const [filters, setFilters] = useState({ status: '', deliveryPersonId: '', from: '', to: '', q: '', page: 1 })
  const [search, setSearch] = useState('')
  const [meta, setMeta] = useState({ page: 1, pages: null, total: null })
  const [createForm, setCreateForm] = useState({ orderId: '', deliveryPersonId: '', eta: '', notes: '' })
  const [resolver, setResolver] = useState({ email: '', resolved: '' })
  const [deliveryPersons, setDeliveryPersons] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ deliveryPersonId: '', eta: '', notes: '' })
  const [statusUpdate, setStatusUpdate] = useState({})
  const [statusNote, setStatusNote] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const downloadReport = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.deliveryPersonId) params.set('deliveryPersonId', filters.deliveryPersonId)
      if (filters.from) params.set('from', filters.from)
      if (filters.to) params.set('to', filters.to)
      const ts = new Date()
      const pad = (n) => String(n).padStart(2, '0')
      const fname = `deliveries-report-${filters.status || 'all'}-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}.pdf`
      const url = `/deliveries/report.pdf${params.toString() ? `?${params.toString()}` : ''}`
      await downloadWithAuth(url, fname)
    } catch (e) {
      setError('Failed to download deliveries report')
    }
  }

  const load = async () => {
    try {
      const { data } = await api.get('/deliveries', { params: {
        status: filters.status || undefined,
        deliveryPersonId: filters.deliveryPersonId || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        q: filters.q || undefined,
        page: filters.page
      } })
      setList(data.items)
      setMeta({
        page: data.page ?? filters.page,
        pages: data.pages ?? null,
        total: data.total ?? null,
      })
    } catch (err) {
      console.error('❌ Error loading deliveries:', err)
      setError(err.response?.data?.message || 'Failed to load deliveries')
    }
  }
  
  useEffect(() => { 
    load() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    // ✅ FIX: Remove /api prefix - it's already in the baseURL
    api.get('/deliveries/persons/all')
      .then(r => {
        console.log('✅ Delivery persons loaded:', r.data)
        setDeliveryPersons(r.data)
      })
      .catch(err => {
        console.error('❌ Delivery persons error:', err.response?.data || err.message)
        if (err.response?.status === 403) {
          setError('Access denied: Admin role required')
        } else {
          setError(err.response?.data?.message || 'Failed to load delivery persons')
        }
      })
    
    // ✅ FIX: Remove /api prefix
    api.get('/deliveries/orders/recent')
      .then(r => {
        console.log('✅ Recent orders loaded:', r.data)
        setRecentOrders(r.data)
      })
      .catch(err => {
        console.error('❌ Recent orders error:', err.response?.data || err.message)
        if (err.response?.status === 403) {
          setError('Access denied: Admin role required')
        } else {
          setError(err.response?.data?.message || 'Failed to load recent orders')
        }
      })
  }, [])

  const clearErrors = () => setError('')

  const applySearch = () => {
    setFilters({ ...filters, q: search, page: 1 })
  }
  
  const clearSearch = () => {
    setSearch('')
    setFilters({ status: '', deliveryPersonId: '', from: '', to: '', q: '', page: 1 })
  }

  const doCreate = async () => {
    clearErrors()
    try {
      setBusy(true)
      const { orderId, deliveryPersonId, eta, notes } = createForm
      if (!orderId || !deliveryPersonId) throw new Error('Order and Delivery Person are required')
      if (!isObjectId(orderId)) throw new Error('Order ID must be a valid 24-char ObjectId')
      if (!isObjectId(deliveryPersonId)) throw new Error('Delivery Person ID must be a valid 24-char ObjectId')
      
      const { data: created } = await api.post('/deliveries', { orderId, deliveryPersonId })
      
      if (eta || notes) {
        await api.patch(`/deliveries/${created._id}`, {
          eta: eta ? new Date(eta).toISOString() : undefined,
          notes: notes || undefined,
        })
      }
      
      setCreateForm({ orderId: '', deliveryPersonId: '', eta: '', notes: '' })
      setResolver({ email: '', resolved: '' })
      await load()
    } catch (e) {
      const valErrors = e.response?.data?.errors?.map(er => er.msg).join(', ')
      setError(valErrors || e.response?.data?.message || e.message || 'Create failed')
    } finally { 
      setBusy(false) 
    }
  }

  const resolveEmail = async () => {
    clearErrors()
    try {
      const { data } = await api.get('/delivery-person/resolve', { params: { email: resolver.email }})
      setResolver({ ...resolver, resolved: data.id })
      setCreateForm({ ...createForm, deliveryPersonId: data.id })
    } catch (e) {
      setResolver({ ...resolver, resolved: 'Not found' })
    }
  }

  const onEdit = (d) => {
    setEditId(d._id)
    setEditForm({
      deliveryPersonId: d.deliveryPerson?._id || '',
      eta: d.eta ? new Date(d.eta).toISOString().slice(0,16) : '',
      notes: d.notes || '',
    })
  }

  const saveEdit = async (id) => {
    clearErrors()
    try {
      setBusy(true)
      const original = list.find(x => x._id === id)
      
      if (editForm.deliveryPersonId && editForm.deliveryPersonId !== (original.deliveryPerson?._id || '')) {
        if (!isObjectId(editForm.deliveryPersonId)) throw new Error('Delivery Person ID must be a valid 24-char ObjectId')
        await api.patch(`/deliveries/${id}/reassign`, { deliveryPersonId: editForm.deliveryPersonId })
      }
      
      await api.patch(`/deliveries/${id}`, {
        eta: editForm.eta ? new Date(editForm.eta).toISOString() : undefined,
        notes: editForm.notes || undefined,
      })
      
      setEditId(null)
      await load()
    } catch (e) {
      const valErrors = e.response?.data?.errors?.map(er => er.msg).join(', ')
      setError(valErrors || e.response?.data?.message || e.message || 'Update failed')
    } finally { 
      setBusy(false) 
    }
  }

  const cancelEdit = () => { setEditId(null) }

  const handleEdit = (deliveryId, action) => {
    if (action === 'start') {
      const delivery = list.find(d => d._id === deliveryId)
      onEdit(delivery)
    } else if (action === 'save') {
      saveEdit(deliveryId)
    } else if (action === 'cancel') {
      cancelEdit()
    }
  }

  const handleStatusUpdate = (deliveryId) => {
    applyStatus(deliveryId)
  }

  const handleDelete = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) return
    clearErrors()
    try {
      setBusy(true)
      await api.delete(`/deliveries/${deliveryId}`)
      await load()
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Delete failed')
    } finally {
      setBusy(false)
    }
  }

  const applyStatus = async (id) => {
    clearErrors()
    const next = statusUpdate[id]
    if (!next) return
    try {
      await api.patch(`/deliveries/${id}/status`, { status: next, note: statusNote[id] || undefined })
      setStatusUpdate({ ...statusUpdate, [id]: '' })
      setStatusNote({ ...statusNote, [id]: '' })
      await load()
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Status update failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                🚚
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>
                <p className="text-sm text-gray-600">
                  {meta.total != null && `${meta.total} total deliveries`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={downloadReport}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span>📊</span>
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              🔍
            </div>
            <h2 className="text-xl font-bold text-gray-900">Filter & Search</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status Filter</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filters.status} 
                onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
              >
                <option value="">All Statuses</option>
                <option value="assigned">📦 Assigned</option>
                <option value="out-for-delivery">🚚 Out for Delivery</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Person</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filters.deliveryPersonId}
                onChange={e => setFilters({ ...filters, deliveryPersonId: e.target.value, page: 1 })}
              >
                <option value="">All Persons</option>
                {deliveryPersons.map(dp => (
                  <option key={dp._id} value={dp._id}>
                    {dp.name} ({dp.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filters.from}
                onChange={e => setFilters({ ...filters, from: e.target.value, page: 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={filters.to}
                onChange={e => setFilters({ ...filters, to: e.target.value, page: 1 })}
              />
            </div>
            
            <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Deliveries</label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Search by order ID, person name, or notes..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter') applySearch() }} 
                />
                <button 
                  onClick={applySearch}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={clearSearch}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Create New Delivery */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl">
              ➕
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Delivery</h2>
              <p className="text-sm text-gray-600">Assign a delivery person to a paid order</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Paid Order</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={createForm.orderId} 
                  onChange={e => setCreateForm({...createForm, orderId: e.target.value})}
                >
                  <option value="">Select order</option>
                  {recentOrders.map(o => (
                    <option key={o._id} value={o._id}>
                      #{o._id.slice(-8)} • Rs. {o.totalAmount?.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Person</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={createForm.deliveryPersonId} 
                  onChange={e => setCreateForm({...createForm, deliveryPersonId: e.target.value})}
                >
                  <option value="">Select person</option>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={createForm.eta} 
                  onChange={e => setCreateForm({...createForm, eta: e.target.value})} 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <input 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Special instructions..." 
                  value={createForm.notes} 
                  onChange={e => setCreateForm({...createForm, notes: e.target.value})} 
                />
              </div>
              
              <div className="flex items-end">
                <button 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
                  disabled={busy || !createForm.orderId || !createForm.deliveryPersonId} 
                  onClick={doCreate}
                >
                  {busy ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
            
            {/* Email Resolver */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Person Lookup</h3>
              <div className="flex gap-3">
                <input 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter delivery person email to auto-select..." 
                  value={resolver.email} 
                  onChange={e => setResolver({...resolver, email: e.target.value})} 
                />
                <button 
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  onClick={resolveEmail}
                >
                  Lookup
                </button>
                {resolver.resolved && (
                  <div className="flex items-center px-4 py-3 bg-green-100 text-green-800 rounded-xl">
                    <span className="text-sm font-medium">
                      {resolver.resolved === 'Not found' ? '❌ Not found' : '✅ Found'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Cards Grid */}
        {list.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-6">🔭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Deliveries Found</h3>
            <p className="text-gray-600 mb-8">
              {filters.status || filters.q 
                ? 'No deliveries match your current filters. Try adjusting your search criteria.'
                : 'No deliveries have been created yet. Create your first delivery assignment!'
              }
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={load}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Refresh List
              </button>
              {(filters.status || filters.q) && (
                <button 
                  onClick={clearSearch}
                  className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {list.map(delivery => (
                <DeliveryCard
                  key={delivery._id}
                  delivery={delivery}
                  onEdit={handleEdit}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                  editId={editId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  statusUpdate={statusUpdate}
                  setStatusUpdate={setStatusUpdate}
                  statusNote={statusNote}
                  setStatusNote={setStatusNote}
                  deliveryPersons={deliveryPersons}
                  busy={busy}
                />
              ))}
            </div>
            
            {/* Pagination */}
            {meta.pages && meta.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    filters.page <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                >
                  ← Previous
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold shadow-lg">
                    Page {meta.page} of {meta.pages}
                  </span>
                </div>
                
                <button
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    filters.page >= meta.pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                  }`}
                  disabled={filters.page >= meta.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}