'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/dashboards/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  ShoppingCart, 
  ChevronRight, 
  User,
  LayoutGrid,
  CreditCard,
  Banknote,
  CheckCircle2,
  X
} from 'lucide-react'
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  description?: string
}

interface Category {
  id: string
  name: string
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function POSPage() {
  const [profile, setProfile] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeOrder, setActiveOrder] = useState<any | null>(null)
  const [activeOrderItems, setActiveOrderItems] = useState<any[]>([])
  const [isTableSheetOpen, setIsTableSheetOpen] = useState(false)
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
    fetchInitialData()
    fetchTables()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: membershipData } = await supabase
      .from('org_memberships')
      .select('*, organization:organizations(name)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    setProfile({
      ...profileData,
      role: membershipData?.role || 'user',
      organization: (membershipData as any)?.organization
    })
  }

  useEffect(() => {
    if (selectedTable) {
      fetchActiveOrder(selectedTable)
    } else {
      setActiveOrder(null)
      setActiveOrderItems([])
    }
  }, [selectedTable])

  const fetchActiveOrder = async (tableId: string) => {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (*)
          )
        `)
        .eq('table_id', tableId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (orderError) {
        if (orderError.code === 'PGRST116') {
          // No active order
          setActiveOrder(null)
          setActiveOrderItems([])
          return
        }
        throw orderError
      }

      setActiveOrder(order)
      setActiveOrderItems(order.order_items || [])
    } catch (error: any) {
      console.error('Error fetching active order:', error.message)
    }
  }

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number')
      
      if (error) throw error
      setTables(data || [])
      if (data && data.length > 0) setSelectedTable(data[0].id)
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const { data: itemData } = await supabase.from('menu_items').select('*')
      
      if (itemData) {
        setItems(itemData as MenuItem[])
        const uniqueCategories = Array.from(new Set(itemData.map(item => item.category)))
          .map(cat => ({ id: cat, name: cat }))
        setCategories(uniqueCategories)
        if (uniqueCategories.length > 0) setSelectedCategory(uniqueCategories[0].id)
      }
    } catch (error) {
      console.error('Error fetching POS data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }))
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
  const activeSubtotal = activeOrderItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
  const combinedSubtotal = subtotal + activeSubtotal
  const tax = combinedSubtotal * 0.1
  const total = combinedSubtotal + tax

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const placeOrder = async () => {
    if (!cart.length) return
    if (!selectedTable) {
      alert('Please select a table first.')
      setIsTableSheetOpen(true)
      return
    }
    
    try {
      setIsProcessing(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let orderId = activeOrder?.id
      
      if (!orderId) {
        // Create new order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            status: 'pending',
            total: total,
            table_id: selectedTable,
            type: 'dine_in'
          })
          .select()
          .single()

        if (orderError) throw orderError
        orderId = order.id
      } else {
        // Update existing order total
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total: total })
          .eq('id', orderId)
        
        if (updateError) throw updateError
      }

      const orderItems = cart.map(item => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      setCart([])
      fetchActiveOrder(selectedTable)
      alert('Order sent to kitchen!')
    } catch (error: any) {
      alert('Error placing order: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCheckout = async () => {
    if (!paymentMethod) return
    if (!selectedTable && cart.length > 0) {
      alert('Please select a table first.')
      setIsTableSheetOpen(true)
      return
    }
    
    try {
      setIsProcessing(true)
      
      let orderId = activeOrder?.id
      
      // 1. Create the order if it doesn't exist yet (cart is not empty, no active order)
      if (cart.length > 0 && !orderId) {
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            status: 'completed',
            total: total,
            table_id: selectedTable,
            payment_status: 'paid',
            payment_method: paymentMethod,
            type: 'dine_in'
          })
          .select()
          .single()

        if (orderError) throw orderError
        orderId = order.id

        const orderItems = cart.map(item => ({
          order_id: orderId,
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
        if (itemsError) throw itemsError
      } else if (orderId) {
        // 2. If there is an active order, complete it
        // First add any items in the cart to it
        if (cart.length > 0) {
          const orderItems = cart.map(item => ({
            order_id: orderId,
            menu_item_id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
          const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
          if (itemsError) throw itemsError
        }

        // Then update the order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            total: total,
            payment_status: 'paid',
            payment_method: paymentMethod
          })
          .eq('id', orderId)

        if (updateError) throw updateError
      }
      
      setCart([])
      setActiveOrder(null)
      setActiveOrderItems([])
      setPaymentMethod(null)
      setIsPaymentSheetOpen(false)
      setSelectedTable(null)
      alert('Payment successful! Ticket closed.')
    } catch (error: any) {
      alert('Error during checkout: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!profile) return null

  return (
    <DashboardLayout 
      role={profile.role} 
      userName={profile.full_name || 'User'} 
      restaurantName={profile.organization?.name}
      fullScreen={true}
    >
      <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Cart */}
      <aside className="w-[400px] bg-card border-r border-border/50 flex flex-col shadow-2xl z-20">
        <div className="p-8 border-b border-border/50 bg-card sticky top-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Ticket</h2>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 font-black px-3 py-1 rounded-full border-none">Dine In</Badge>
          </div>
          <button 
            onClick={() => setIsTableSheetOpen(true)}
            className="w-full flex items-center justify-between p-5 bg-muted/50 hover:bg-muted rounded-[24px] transition-all group border border-border/50"
          >
            <div className="flex items-center text-muted-foreground text-sm font-bold">
              <LayoutGrid className="w-5 h-5 mr-3 text-amber-500" />
              <span className="text-foreground">{selectedTable ? `Table ${tables.find(t => t.id === selectedTable)?.table_number}` : 'Select Table'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {activeOrderItems.length > 0 && (
            <div className="space-y-5 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ordered</h3>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-500 border-emerald-500/20 bg-emerald-500/5 px-2 py-0">Kitchen Live</Badge>
              </div>
              {activeOrderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start opacity-50 group">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="w-8 font-black text-muted-foreground text-sm">{item.quantity}×</span>
                      <h3 className="font-bold text-foreground leading-tight group-hover:text-amber-500 transition-colors">{item.menu_items?.name}</h3>
                    </div>
                  </div>
                  <div className="text-right font-bold text-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="h-px bg-border/50 my-6" />
            </div>
          )}

          {cart.length === 0 && activeOrderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-6 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-muted/50 rounded-[32px] flex items-center justify-center border border-border/50">
                <ShoppingCart className="w-10 h-10 opacity-20" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">Ticket is empty</p>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.length > 0 && (
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">New Selection</h3>
              )}
              {cart.map((item) => (
                <div key={item.id} className="group animate-in slide-in-from-right-4 duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-black text-foreground leading-tight text-lg group-hover:text-amber-500 transition-colors">{item.name}</h3>
                      <p className="text-xs text-amber-500 font-bold tracking-tighter">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right font-black text-foreground text-lg tracking-tighter">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center bg-muted/50 rounded-2xl p-1.5 border border-border/50">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-amber-500 shadow-sm border border-border/50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-black text-foreground text-lg">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, 1)}
                         className="w-10 h-10 flex items-center justify-center bg-card hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-amber-500 shadow-sm border border-border/50"
                       >
                         <Plus className="w-4 h-4" />
                       </button>
                     </div>
                     <button 
                       onClick={() => removeFromCart(item.id)}
                       className="w-12 h-12 flex items-center justify-center text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all border border-transparent hover:border-red-500/10"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border/50 bg-muted/20 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground font-bold text-xs uppercase tracking-widest">
              <span>Tax (10%)</span>
              <span className="text-foreground">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-3xl font-black text-foreground pt-4 border-t border-border/50 tracking-tighter">
              <span>Total</span>
              <span className="text-amber-500">${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={placeOrder}
              disabled={cart.length === 0 || isProcessing}
              variant="outline"
              className="h-16 rounded-[24px] font-black uppercase tracking-widest text-xs border-border/50 hover:bg-muted"
            >
              Send
            </Button>
            <Button 
              onClick={() => setIsPaymentSheetOpen(true)}
              disabled={(cart.length === 0 && activeOrderItems.length === 0) || isProcessing}
              className="h-16 rounded-[24px] font-black uppercase tracking-widest text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 border-none"
            >
              Checkout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Menu Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-28 bg-card border-b border-border/50 flex items-center justify-between px-10 z-10 shadow-sm">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search dishes, drinks, appetizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-muted/50 border-border/50 focus:bg-card focus:border-amber-500/50 focus:ring-8 focus:ring-amber-500/5 rounded-[24px] transition-all text-lg font-bold placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center ml-10 space-x-10">
            <div className="text-right hidden xl:block">
              <div className="font-black text-foreground uppercase tracking-widest text-[10px] mb-1">Kitchen Status</div>
              <div className="text-sm text-emerald-500 font-black flex items-center justify-end">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2.5 animate-pulse shadow-lg shadow-emerald-500/20" />
                LIVE
              </div>
            </div>
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/10">
              <User className="w-8 h-8" />
            </div>
          </div>
        </header>

        {/* Categories Bar */}
        <div className="px-10 py-8 bg-card border-b border-border/50 flex items-center space-x-4 overflow-x-auto no-scrollbar shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap transition-all duration-300 border",
                selectedCategory === cat.id 
                  ? "bg-amber-500 border-amber-400 text-white shadow-xl shadow-amber-500/20 scale-105" 
                  : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-10 bg-muted/20 no-scrollbar">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                <div key={n} className="h-[320px] bg-card rounded-[40px] animate-pulse shadow-sm border border-border/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="group relative bg-card rounded-[40px] p-5 shadow-sm hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-500 flex flex-col items-center text-center overflow-hidden active:scale-95 border border-border/50 hover:border-amber-500/20"
                >
                  <div className="w-full aspect-square relative mb-5 rounded-[32px] overflow-hidden bg-muted/50 border border-border/50 shadow-inner">
                    {item.image_url ? (
                      <Image 
                        src={item.image_url} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <ShoppingCart className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="w-full space-y-1">
                    <h3 className="font-black text-foreground text-lg leading-tight tracking-tight truncate group-hover:text-amber-500 transition-colors">{item.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 truncate">{item.category}</p>
                    <div className="flex items-center justify-center mt-4 pt-4 border-t border-border/50">
                      <span className="text-2xl font-black tracking-tighter text-amber-500">${Number(item.price).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Quick Add Overlay Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl shadow-amber-500/30">
                    <Plus className="w-6 h-6" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Table Selection Sheet */}
      <Sheet open={isTableSheetOpen} onOpenChange={setIsTableSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md bg-card border-l border-border/50 p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-8 border-b border-border/50 bg-muted/20">
            <SheetTitle className="text-3xl font-black text-foreground tracking-tight">Select Table</SheetTitle>
            <SheetDescription className="text-muted-foreground font-medium">Assign this ticket to a specific table for service.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="grid grid-cols-2 gap-5 py-2">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table.id)
                    setIsTableSheetOpen(false)
                  }}
                  className={cn(
                    "aspect-square rounded-[32px] border-2 flex flex-col items-center justify-center transition-all duration-300 group relative overflow-hidden",
                    selectedTable === table.id 
                      ? "bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20 scale-105 z-10" 
                      : "bg-muted/30 border-border/50 text-foreground hover:border-amber-500/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] mb-2 transition-colors",
                    selectedTable === table.id ? "text-white/70" : "text-muted-foreground"
                  )}>Table</div>
                  <div className="text-4xl font-black tracking-tighter">{table.table_number}</div>
                  <div className={cn(
                    "text-[10px] font-bold mt-3 transition-colors px-3 py-1 rounded-full",
                    selectedTable === table.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>{table.capacity} seats</div>
                  
                  {selectedTable === table.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <SheetFooter className="p-8 border-t border-border/50 bg-muted/20 sm:flex-col gap-3">
            <Button 
              variant="outline" 
              className="w-full rounded-[24px] h-14 font-black uppercase tracking-widest text-xs border-border/50 hover:bg-card transition-all" 
              onClick={() => setIsTableSheetOpen(false)}
            >
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Payment Sheet */}
      <Sheet open={isPaymentSheetOpen} onOpenChange={setIsPaymentSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md bg-card border-l border-border/50 p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-8 border-b border-border/50 bg-muted/20">
            <SheetTitle className="text-3xl font-black text-foreground tracking-tight">Checkout</SheetTitle>
            <SheetDescription className="text-muted-foreground font-medium">Select payment method to complete the order.</SheetDescription>
          </SheetHeader>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
            <div className="bg-muted/30 p-10 rounded-[40px] border border-border/50 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Amount Due</div>
                <div className="text-6xl font-black text-foreground tracking-tighter">
                  <span className="text-amber-500 mr-1">$</span>
                  {total.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Payment Method</h3>
              <div className="grid grid-cols-2 gap-5">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    "p-8 rounded-[32px] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 group relative overflow-hidden",
                    paymentMethod === 'cash'
                      ? "bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20 scale-105 z-10"
                      : "bg-muted/30 border-border/50 text-foreground hover:border-amber-500/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                    paymentMethod === 'cash' ? "bg-white/20 shadow-amber-600/20" : "bg-card border border-border/50 shadow-sm"
                  )}>
                    <Banknote className={cn("w-7 h-7", paymentMethod === 'cash' ? "text-white" : "text-amber-500")} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px]">Cash</span>
                  {paymentMethod === 'cash' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "p-8 rounded-[32px] border-2 flex flex-col items-center justify-center gap-4 transition-all duration-300 group relative overflow-hidden",
                    paymentMethod === 'card'
                      ? "bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-500/20 scale-105 z-10"
                      : "bg-muted/30 border-border/50 text-foreground hover:border-amber-500/30 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg",
                    paymentMethod === 'card' ? "bg-white/20 shadow-amber-600/20" : "bg-card border border-border/50 shadow-sm"
                  )}>
                    <CreditCard className={cn("w-7 h-7", paymentMethod === 'card' ? "text-white" : "text-amber-500")} />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[10px]">Card</span>
                  {paymentMethod === 'card' && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          <SheetFooter className="p-8 border-t border-border/50 bg-muted/20 sm:flex-col gap-3">
            <Button 
              className="w-full rounded-[24px] h-16 font-black uppercase tracking-widest text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 border-none transition-all disabled:opacity-50"
              disabled={!paymentMethod || isProcessing}
              onClick={handleCheckout}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Processing...
                </div>
              ) : 'Complete Payment'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full rounded-[24px] h-14 font-black uppercase tracking-widest text-xs border-border/50 hover:bg-card transition-all" 
              onClick={() => setIsPaymentSheetOpen(false)}
            >
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      </div>
    </DashboardLayout>
  )
}
