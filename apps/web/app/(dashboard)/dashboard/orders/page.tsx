'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingBag,
  Search,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  Printer,
  Eye,
  CreditCard,
  Wallet,
  UtensilsCrossed,
  CheckSquare,
  Play,
  Truck,
  MapPin,
  Phone,
  User,
  Star,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  getOrders,
  updateOrderStatusAction,
  dispatchDeliveryAction,
  getDeliveryStatusAction,
  cancelDeliveryAction,
} from '@/app/auth/actions'

interface DeliveryInfo {
  deliveryId: string
  status: string
  trackingUrl?: string
  driver?: {
    name?: string
    rating?: string
    picture_url?: string
    vehicle_make_model?: string
    license_plate?: string
  }
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  menu_items: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  created_at: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total: number
  table_number: string
  payment_status: 'pending' | 'paid'
  payment_method: 'cash' | 'card'
  order_items: OrderItem[]
}

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)

  // Delivery dispatch state
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)
  const [showDispatchForm, setShowDispatchForm] = useState(false)
  const [dispatchAddress, setDispatchAddress] = useState('')
  const [dispatchPhone, setDispatchPhone] = useState('')
  const [dispatchName, setDispatchName] = useState('')
  const [isDispatching, setIsDispatching] = useState(false)
  const [isCancellingDelivery, setIsCancellingDelivery] = useState(false)
  const [deliveryError, setDeliveryError] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchOrders()

    // Real-time subscription
    const channel = supabase
      .channel('dashboard_orders_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data as Order[])
    } catch (error: any) {
      console.error('Error fetching orders:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Poll delivery status every 30 seconds when there's an active delivery
  useEffect(() => {
    if (!deliveryInfo || ['delivered', 'cancelled', 'returned'].includes(deliveryInfo.status)) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    const poll = async () => {
      const res = await getDeliveryStatusAction(deliveryInfo.deliveryId)
      if (res.success) {
        setDeliveryInfo(prev => prev
          ? { ...prev, status: res.status!, trackingUrl: res.trackingUrl, driver: res.driver }
          : prev
        )
      }
    }
    pollRef.current = setInterval(poll, 30_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [deliveryInfo?.deliveryId, deliveryInfo?.status])

  // Reset delivery state when sheet closes or a different order is selected
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setDeliveryInfo(null)
    setShowDispatchForm(false)
    setDispatchAddress('')
    setDispatchPhone('')
    setDispatchName('')
    setDeliveryError(null)
    setIsDetailSheetOpen(true)
  }

  const handleDispatch = async () => {
    if (!selectedOrder || !dispatchAddress || !dispatchPhone || !dispatchName) return
    setIsDispatching(true)
    setDeliveryError(null)
    const res = await dispatchDeliveryAction(
      selectedOrder.id,
      dispatchAddress,
      dispatchName,
      dispatchPhone
    )
    setIsDispatching(false)
    if (res.success && res.delivery) {
      setDeliveryInfo({
        deliveryId: res.delivery.id,
        status: res.delivery.status,
        trackingUrl: res.delivery.tracking_url,
        driver: res.delivery.courier || res.delivery.driver || undefined,
      })
      setShowDispatchForm(false)
    } else {
      setDeliveryError(res.error || 'Dispatch failed')
    }
  }

  const handleCancelDelivery = async () => {
    if (!deliveryInfo) return
    setIsCancellingDelivery(true)
    const res = await cancelDeliveryAction(deliveryInfo.deliveryId)
    setIsCancellingDelivery(false)
    if (res.success) {
      setDeliveryInfo(prev => prev ? { ...prev, status: 'cancelled' } : prev)
    } else {
      setDeliveryError(res.error || 'Cancel failed')
    }
  }

  const deliveryStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600'
      case 'pickup': return 'bg-blue-50 text-blue-600'
      case 'pickup_complete': return 'bg-indigo-50 text-indigo-600'
      case 'dropoff': return 'bg-purple-50 text-purple-600'
      case 'delivered': return 'bg-emerald-50 text-emerald-600'
      case 'cancelled': return 'bg-rose-50 text-rose-500'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const deliveryStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Finding Driver',
      pickup: 'Driver En Route to Pickup',
      pickup_complete: 'Order Picked Up',
      dropoff: 'En Route to Customer',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
    }
    return labels[status] || status
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusAction(orderId, newStatus)

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any })
      }

      fetchOrders()
    } catch (error: any) {
      alert('Error updating order status: ' + error.message)
    }
  }

  const printReceipt = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = order.order_items.map(item => `
      <tr>
        <td style="padding: 8px 0;">${item.menu_items.name} x ${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; color: #000; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .footer { text-align: center; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-weight: bold; font-size: 18px; margin-top: 10px; display: flex; justify-content: space-between; }
            .meta { font-size: 12px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin: 0;">HEADLESS RESTO</h2>
            <div class="meta">Order #${order.id.slice(0, 8).toUpperCase()}</div>
            <div class="meta">${new Date(order.created_at).toLocaleString()}</div>
            <div class="meta">${order.table_number ? `Table ${order.table_number}` : 'Takeaway'}</div>
          </div>
          <table>
            ${itemsHtml}
          </table>
          <div class="total">
            <span>TOTAL</span>
            <span>$${order.total?.toFixed(2)}</span>
          </div>
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>www.headlessresto.com</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600'
      case 'preparing': return 'bg-orange-50 text-brand-orange'
      case 'ready': return 'bg-emerald-50 text-emerald-600'
      case 'completed': return 'bg-gray-100 text-gray-400'
      case 'cancelled': return 'bg-rose-50 text-rose-500'
      default: return 'bg-gray-100 text-gray-500'
    }
  }

  const statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.table_number && order.table_number.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = selectedStatus ? order.status === selectedStatus : true
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['preparing', 'ready'].includes(o.status)).length,
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track, process, and manage live orders from all channels in real-time.</p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          className="h-10 px-6 rounded-xl font-semibold text-sm"
        >
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-100 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <Badge className="bg-amber-50 text-amber-600 font-semibold border-none uppercase tracking-wide text-[10px]">TOTAL</Badge>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Orders today</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                <Clock className="w-5 h-5" />
              </div>
              <Badge className="bg-brand-orange/10 text-brand-orange font-semibold border-none uppercase tracking-wide text-[10px]">ACTIVE</Badge>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats.active + stats.pending}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Live processing</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 font-semibold border-none uppercase tracking-wide text-[10px]">REVENUE</Badge>
            </div>
            <div className="text-3xl font-black text-gray-900">${stats.revenue.toFixed(2)}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Completed sales</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-100 rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                <Calendar className="w-5 h-5" />
              </div>
              <Badge className="bg-purple-50 text-purple-600 font-semibold border-none uppercase tracking-wide text-[10px]">DATE</Badge>
            </div>
            <div className="text-2xl font-black text-gray-900 uppercase">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Management session</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Orders Table */}
      <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ID or Table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-gray-50 border-gray-200 rounded-xl text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus(null)}
                className={cn(
                  "px-4 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all border",
                  selectedStatus === null
                    ? "bg-brand-orange border-brand-orange text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                )}
              >
                All
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all border",
                    selectedStatus === status
                      ? "bg-brand-orange border-brand-orange text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Details</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Table</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <div className="text-gray-400 font-medium text-sm">No orders found matching your criteria</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-orange transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge className={cn("px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[9px] border-none", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="font-semibold text-gray-700 text-sm">
                        {order.table_number ? `Table ${order.table_number}` : 'Takeaway'}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="font-bold text-brand-orange text-sm">${order.total?.toFixed(2)}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        {order.payment_method === 'card' ? <CreditCard className="w-3 h-3 text-gray-400" /> : <Wallet className="w-3 h-3 text-gray-400" />}
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider">{order.payment_status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => openOrderDetail(order)}
                          variant="outline"
                          className="h-9 w-9 rounded-xl border-gray-200 bg-white hover:bg-gray-50 p-0"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          onClick={() => printReceipt(order)}
                          variant="outline"
                          className="h-9 w-9 rounded-xl border-gray-200 bg-white hover:bg-gray-50 p-0"
                        >
                          <Printer className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="bg-white border-l border-gray-100 w-full sm:max-w-2xl p-0 overflow-y-auto">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              <div className="p-8 space-y-8">
                <SheetHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={cn("px-4 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] border-none", getStatusColor(selectedOrder.status))}>
                      {selectedOrder.status}
                    </Badge>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </div>
                  </div>
                  <SheetTitle className="text-2xl font-black tracking-tight text-gray-900">
                    Order <span className="text-brand-orange">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                  </SheetTitle>
                  <SheetDescription className="text-gray-500 text-sm">
                    Review and process order details for {selectedOrder.table_number ? `Table ${selectedOrder.table_number}` : 'Takeaway'}.
                  </SheetDescription>
                </SheetHeader>

                {/* Status Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-base font-bold text-gray-900">Process Workflow</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">Live</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { status: 'pending', icon: Clock, label: 'HOLD' },
                      { status: 'preparing', icon: UtensilsCrossed, label: 'KITCHEN' },
                      { status: 'ready', icon: CheckSquare, label: 'DISPATCH' },
                      { status: 'completed', icon: CheckCircle2, label: 'SETTLE' }
                    ].map((stage) => {
                      const Icon = stage.icon
                      const isActive = selectedOrder.status === stage.status
                      const isNext = (
                        (selectedOrder.status === 'pending' && stage.status === 'preparing') ||
                        (selectedOrder.status === 'preparing' && stage.status === 'ready') ||
                        (selectedOrder.status === 'ready' && stage.status === 'completed')
                      )

                      return (
                        <button
                          key={stage.status}
                          disabled={isActive}
                          onClick={() => updateOrderStatus(selectedOrder.id, stage.status)}
                          className={cn(
                            "relative h-24 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-300",
                            isActive
                              ? "bg-brand-orange border-brand-orange text-white shadow-[0_4px_12px_rgba(245,124,0,0.25)]"
                              : isNext
                                ? "bg-white border-brand-orange/30 text-gray-700 hover:border-brand-orange/50 hover:bg-orange-50/30"
                                : "bg-gray-50 border-gray-100 text-gray-300 hover:bg-gray-100"
                          )}
                        >
                          <Icon className={cn(
                            "w-5 h-5",
                            isActive ? "text-white" : isNext ? "text-brand-orange" : "text-gray-300"
                          )} />
                          <div className="font-bold uppercase tracking-wider text-[9px]">{stage.label}</div>

                          {isNext && (
                            <div className="absolute top-2 right-2">
                              <Play className="w-2.5 h-2.5 text-brand-orange fill-brand-orange animate-pulse" />
                            </div>
                          )}

                          {isActive && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white flex items-center justify-center rounded-tl-xl border border-orange-100">
                              <CheckCircle2 className="w-3 h-3 text-brand-orange" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Quick Action Bar */}
                  {(selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled') && (
                    <Button
                      onClick={() => {
                        const flow = ['pending', 'preparing', 'ready', 'completed']
                        const nextIdx = flow.indexOf(selectedOrder.status) + 1
                        if (nextIdx < flow.length) {
                          updateOrderStatus(selectedOrder.id, flow[nextIdx])
                        }
                      }}
                      className="w-full h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center justify-center gap-2 border-none shadow-[0_4px_12px_rgba(245,124,0,0.2)]"
                    >
                      Advance to {
                        selectedOrder.status === 'pending' ? 'Kitchen' :
                        selectedOrder.status === 'preparing' ? 'Dispatch' :
                        'Settlement'
                      }
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-base font-bold text-gray-900">Order Items</h3>
                    <Badge className="bg-gray-100 text-gray-500 font-semibold border-none uppercase tracking-wider text-[10px]">
                      {selectedOrder.order_items?.length || 0} ITEMS
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.order_items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center font-black text-brand-orange text-sm border border-brand-orange/10">
                            {item.quantity}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">
                              {item.menu_items?.name}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                              {item.menu_items?.category} · ${item.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-gray-900 text-sm">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Subtotal</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500 text-xs">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="h-px bg-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-black text-brand-orange">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Delivery Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-brand-orange" />
                      Uber Direct Delivery
                    </h3>
                  </div>

                  {deliveryError && (
                    <div className="text-xs text-rose-500 bg-rose-50 rounded-xl px-4 py-3">
                      {deliveryError}
                    </div>
                  )}

                  {!deliveryInfo && !showDispatchForm && (
                    <Button
                      onClick={() => setShowDispatchForm(true)}
                      variant="outline"
                      className="w-full h-11 rounded-xl border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5 font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Dispatch via Uber
                    </Button>
                  )}

                  {showDispatchForm && !deliveryInfo && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                          Customer Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={dispatchName}
                            onChange={e => setDispatchName(e.target.value)}
                            placeholder="Jane Smith"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                          Delivery Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={dispatchAddress}
                            onChange={e => setDispatchAddress(e.target.value)}
                            placeholder="123 Customer St, City, State 00000"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                          Customer Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            value={dispatchPhone}
                            onChange={e => setDispatchPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            type="tel"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDispatch}
                          disabled={isDispatching || !dispatchAddress || !dispatchPhone || !dispatchName}
                          className="flex-1 h-11 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm border-none shadow-[0_4px_12px_rgba(245,124,0,0.2)] flex items-center justify-center gap-2"
                        >
                          {isDispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                          {isDispatching ? 'Dispatching...' : 'Dispatch Now'}
                        </Button>
                        <Button
                          onClick={() => setShowDispatchForm(false)}
                          variant="outline"
                          className="h-11 px-4 rounded-xl border-gray-200 text-gray-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {deliveryInfo && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={cn('px-3 py-1 rounded-lg font-semibold uppercase tracking-wider text-[9px] border-none', deliveryStatusColor(deliveryInfo.status))}>
                          {deliveryStatusLabel(deliveryInfo.status)}
                        </Badge>
                        {deliveryInfo.trackingUrl && (
                          <a
                            href={deliveryInfo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-semibold text-brand-orange hover:underline"
                          >
                            Track Live <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {deliveryInfo.driver?.name && (
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
                          <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-sm">
                            {deliveryInfo.driver.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{deliveryInfo.driver.name}</div>
                            {deliveryInfo.driver.vehicle_make_model && (
                              <div className="text-[10px] text-gray-400 mt-0.5">
                                {deliveryInfo.driver.vehicle_make_model}
                                {deliveryInfo.driver.license_plate && ` · ${deliveryInfo.driver.license_plate}`}
                              </div>
                            )}
                          </div>
                          {deliveryInfo.driver.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-xs font-bold text-gray-700">{deliveryInfo.driver.rating}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {!['delivered', 'cancelled', 'returned'].includes(deliveryInfo.status) && (
                        <Button
                          onClick={handleCancelDelivery}
                          disabled={isCancellingDelivery}
                          variant="outline"
                          className="w-full h-10 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          {isCancellingDelivery ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                          Cancel Delivery
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => printReceipt(selectedOrder)}
                    className="flex-1 h-12 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center justify-center gap-2 border-none shadow-[0_4px_12px_rgba(245,124,0,0.2)]"
                  >
                    <Printer className="w-4 h-4" />
                    Print Receipt
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    variant="outline"
                    className="h-12 px-4 rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
