'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MoreVertical,
  Calendar,
  DollarSign,
  Printer,
  Eye,
  CreditCard,
  Wallet,
  UtensilsCrossed,
  CheckSquare,
  Play
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('users')
        .select('restaurant_id')
        .eq('id', user.id)
        .single()

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            menu_items (
              name,
              category
            )
          )
        `)
        .eq('restaurant_id', profile?.restaurant_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      
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
      case 'pending': return 'bg-amber-500/10 text-amber-500'
      case 'preparing': return 'bg-brand-orange/10 text-brand-orange'
      case 'ready': return 'bg-emerald-500/10 text-emerald-500'
      case 'completed': return 'bg-white/10 text-white/40'
      case 'cancelled': return 'bg-rose-500/10 text-rose-500'
      default: return 'bg-white/10 text-white'
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
    <div className="space-y-10 pb-16 min-h-screen bg-[#020202] text-white p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Order Management</h1>
          <p className="text-white/40 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] max-w-md">Track, process, and manage live orders from all channels in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={fetchOrders}
            className="h-20 px-12 rounded-[32px] bg-white/5 hover:bg-white/10 text-white font-black text-xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 border border-white/10 uppercase italic tracking-tighter"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">TOTAL</Badge>
            </div>
            <div className="text-6xl font-black text-white italic tracking-tighter">{stats.total}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Orders today</div>
          </CardContent>
        </Card>

        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-7 h-7" />
              </div>
              <Badge className="bg-brand-orange/10 text-brand-orange font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">ACTIVE</Badge>
            </div>
            <div className="text-6xl font-black text-white italic tracking-tighter">{stats.active + stats.pending}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Live processing</div>
          </CardContent>
        </Card>

        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                <DollarSign className="w-7 h-7" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">REVENUE</Badge>
            </div>
            <div className="text-6xl font-black text-white italic tracking-tighter">${stats.revenue.toFixed(2)}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Completed sales</div>
          </CardContent>
        </Card>

        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-7 h-7" />
              </div>
              <Badge className="bg-purple-500/10 text-purple-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">DATE</Badge>
            </div>
            <div className="text-4xl font-black text-white italic tracking-tighter uppercase">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Management Session</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Orders Table */}
      <Card className="glass-morphism-dark border-white/[0.05] rounded-[48px] overflow-hidden">
        <CardHeader className="p-10 border-b border-white/[0.05]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-amber-500 transition-colors" />
              <Input 
                placeholder="Search by ID or Table..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 h-18 bg-white/[0.03] border-white/[0.08] rounded-[24px] font-bold text-white placeholder:text-white/20 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all text-xl"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStatus(null)}
                className={cn(
                  "px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 border italic",
                  selectedStatus === null 
                    ? "bg-amber-500 border-amber-400 text-black" 
                    : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white"
                )}
              >
                All
              </button>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 border italic",
                    selectedStatus === status 
                      ? "bg-amber-500 border-amber-400 text-black" 
                      : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white"
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
              <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                <TableHead className="py-8 px-10 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Order Details</TableHead>
                <TableHead className="py-8 px-10 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Status</TableHead>
                <TableHead className="py-8 px-10 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Table</TableHead>
                <TableHead className="py-8 px-10 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Total</TableHead>
                <TableHead className="py-8 px-10 text-[10px] font-black text-white/30 uppercase tracking-[0.25em] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center text-white/10">
                        <ShoppingBag className="w-10 h-10" />
                      </div>
                      <div className="text-white/20 font-black uppercase tracking-widest text-xs italic">No orders found matching your criteria</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="group border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-500">
                    <TableCell className="py-10 px-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:text-amber-500 transition-all duration-500">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="font-black text-white text-xl italic tracking-tighter leading-none mb-2">#{order.id.slice(0, 8).toUpperCase()}</div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-10 px-10">
                      <Badge className={cn("px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] border-none italic", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-10 px-10">
                      <div className="font-black text-white text-xl italic tracking-tighter">
                        {order.table_number ? `TABLE ${order.table_number}` : 'TAKEAWAY'}
                      </div>
                    </TableCell>
                    <TableCell className="py-10 px-10">
                      <div className="font-black text-amber-500 text-2xl italic tracking-tighter leading-none">${order.total?.toFixed(2)}</div>
                      <div className="mt-2 flex items-center gap-2">
                        {order.payment_method === 'card' ? <CreditCard className="w-3 h-3 text-white/30" /> : <Wallet className="w-3 h-3 text-white/30" />}
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">{order.payment_status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-10 px-10 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailSheetOpen(true)
                          }}
                          variant="outline" 
                          className="h-14 w-14 rounded-2xl border-white/[0.08] bg-white/[0.03] hover:bg-white/10 transition-all group/btn"
                        >
                          <Eye className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
                        </Button>
                        <Button 
                          onClick={() => printReceipt(order)}
                          variant="outline" 
                          className="h-14 w-14 rounded-2xl border-white/[0.08] bg-white/[0.03] hover:bg-white/10 transition-all group/btn"
                        >
                          <Printer className="w-6 h-6 text-white group-hover/btn:scale-110 transition-transform" />
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
        <SheetContent className="bg-[#020202] border-l border-white/10 text-white w-full sm:max-w-2xl p-0 overflow-y-auto">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              <div className="p-12 space-y-12">
                <SheetHeader className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Badge className={cn("px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] border-none italic", getStatusColor(selectedOrder.status))}>
                      {selectedOrder.status}
                    </Badge>
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.25em] italic">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </div>
                  </div>
                  <SheetTitle className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                    Order <span className="text-amber-500">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                  </SheetTitle>
                  <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                    Review and process order details for {selectedOrder.table_number ? `Table ${selectedOrder.table_number}` : 'Takeaway'}.
                  </SheetDescription>
                </SheetHeader>

                {/* Status Actions */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Process Workflow</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Live Processing</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                            "relative h-32 rounded-3xl flex flex-col items-center justify-center gap-3 border transition-all duration-500 group overflow-hidden",
                            isActive 
                              ? "bg-amber-500 border-amber-400 text-black shadow-[0_15px_40px_rgba(245,158,11,0.2)] scale-105 z-10" 
                              : isNext
                                ? "bg-white/[0.05] border-amber-500/30 text-white hover:bg-white/[0.1] hover:border-amber-500/50"
                                : "bg-white/[0.02] border-white/[0.05] text-white/20 hover:bg-white/[0.05] hover:text-white/40"
                          )}
                        >
                          <Icon className={cn(
                            "w-8 h-8 transition-transform duration-500 group-hover:scale-110",
                            isActive ? "text-black" : isNext ? "text-amber-500" : "text-white/10"
                          )} />
                          <div className="font-black uppercase tracking-[0.2em] text-[10px] italic">{stage.label}</div>
                          
                          {isNext && (
                            <div className="absolute top-3 right-3">
                              <Play className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
                            </div>
                          )}

                          {isActive && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black flex items-center justify-center rounded-tl-xl">
                              <CheckCircle2 className="w-3 h-3 text-amber-500" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Quick Action Bar */}
                  {(selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled') && (
                    <div className="p-1.5 bg-white/[0.03] border border-white/5 rounded-[32px] mt-4">
                      <Button 
                        onClick={() => {
                          const flow = ['pending', 'preparing', 'ready', 'completed']
                          const nextIdx = flow.indexOf(selectedOrder.status) + 1
                          if (nextIdx < flow.length) {
                            updateOrderStatus(selectedOrder.id, flow[nextIdx])
                          }
                        }}
                        className="w-full h-20 rounded-[28px] bg-white text-black hover:bg-amber-500 hover:text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.98] border-none uppercase italic tracking-tighter"
                      >
                        Advance to {
                          selectedOrder.status === 'pending' ? 'Kitchen' :
                          selectedOrder.status === 'preparing' ? 'Dispatch' :
                          'Settlement'
                        }
                        <ChevronRight className="w-6 h-6 stroke-[3]" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Order Items</h3>
                    <Badge className="bg-white/5 text-white/40 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">
                      {selectedOrder.order_items?.length || 0} ITEMS
                    </Badge>
                  </div>
                  <div className="space-y-6">
                    {selectedOrder.order_items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center font-black text-amber-500 text-2xl italic border border-white/[0.05] group-hover:scale-110 transition-all duration-500">
                            {item.quantity}
                          </div>
                          <div>
                            <div className="font-black text-white text-xl italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors">
                              {item.menu_items?.name}
                            </div>
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2 italic">
                              {item.menu_items?.category} • ${item.price.toFixed(2)} EACH
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl font-black text-white italic tracking-tighter">
                          ${(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-[40px] p-10 space-y-6 mt-12">
                  <div className="flex justify-between items-center text-white/40 font-black uppercase tracking-widest text-[10px] italic">
                    <span>Subtotal</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-white/40 font-black uppercase tracking-widest text-[10px] italic">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="h-[1px] bg-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black italic tracking-tighter uppercase">Total Amount</span>
                    <span className="text-5xl font-black italic tracking-tighter text-amber-500">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <Button 
                    onClick={() => printReceipt(selectedOrder)}
                    className="flex-1 h-20 rounded-[24px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] border-none uppercase italic tracking-tighter shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                  >
                    <Printer className="w-7 h-7 stroke-[3]" />
                    Print Receipt
                  </Button>
                  <Button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="h-20 px-8 rounded-[24px] bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-black text-xl flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98] border border-rose-500/20"
                  >
                    <XCircle className="w-7 h-7" />
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
