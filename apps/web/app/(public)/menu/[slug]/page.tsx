'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  ChevronRight, 
  Search,
  ArrowLeft,
  Info,
  CreditCard,
  Banknote,
  CheckCircle2,
  Loader2,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
import { createPaymentIntent } from '@/app/actions/stripe'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  description?: string
}

interface CartItem extends MenuItem {
  quantity: number
}

const stripePromise = getStripe()

function CheckoutForm({ total, onPaymentSuccess, onCancel }: { total: number, onPaymentSuccess: (intentId: string) => void, onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'An error occurred during payment.')
      setIsProcessing(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent.id)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white/5 backdrop-blur-md rounded-[24px] p-6 border border-white/10 shadow-inner">
        <PaymentElement options={{ 
          layout: 'accordion',
        }} />
      </div>
      
      {errorMessage && (
        <div className="p-4 bg-red-500/10 text-red-400 rounded-2xl text-sm font-bold border border-red-500/20 animate-in shake duration-500">
          {errorMessage}
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <Button 
          type="submit" 
          className="w-full h-16 rounded-[24px] font-black text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-2xl shadow-amber-500/30 border-none transition-all hover:scale-[1.02] active:scale-95"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>SECURELY PROCESSING...</span>
            </div>
          ) : (
            `PAY $${total.toFixed(2)}`
          )}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          className="w-full h-14 rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          onClick={onCancel}
          disabled={isProcessing}
        >
          GO BACK
        </Button>
      </div>
    </form>
  )
}

export default function PublicMenuPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const tableNumber = searchParams.get('table')
  
  const [restaurant, setRestaurant] = useState<any>(null)
  const [locations, setLocations] = useState<any[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'cash' | null>(null)
  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(tableNumber)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [stripeIntentId, setStripeIntentId] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<string>('pending')
  const [isCallingWaiter, setIsCallingWaiter] = useState(false)
  const [waiterCalled, setWaiterCalled] = useState(false)
  
  const supabase = createClient()

  const handleCallWaiter = async () => {
    if (!tableNumber || !restaurant) return
    
    try {
      setIsCallingWaiter(true)
      const { error } = await supabase
        .from('service_calls')
        .insert({
          restaurant_id: restaurant.id,
          table_number: tableNumber,
          status: 'pending',
          type: 'waiter'
        })
      
      if (error) throw error
      setWaiterCalled(true)
      setTimeout(() => setWaiterCalled(false), 5000)
    } catch (error: any) {
      console.error('Error calling waiter:', error.message)
      // Fallback: try to update table status if service_calls doesn't exist
      try {
        await supabase
          .from('tables')
          .update({ status: 'occupied' })
          .eq('table_number', tableNumber)
          .eq('restaurant_id', restaurant.id)
      } catch (e) {}
    } finally {
      setIsCallingWaiter(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      const channel = supabase
        .channel(`order_status_${orderId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            setOrderStatus(payload.new.status)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [orderId])

  useEffect(() => {
    fetchMenu()
  }, [slug])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      // 1. Fetch restaurant by slug
      const { data: restData, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (restError) throw restError
      setRestaurant(restData)

      // 1.5 Fetch locations for this restaurant
      const { data: locData, error: locError } = await supabase
        .from('locations')
        .select('*')
        .eq('restaurant_id', restData.id)
      
      if (locError) throw locError
      setLocations(locData || [])

      // 2. Fetch menu items for this restaurant
      // Note: Assuming menu_items are linked to restaurant_id or location_id
      // For now, let's try to fetch all items and filter if needed, 
      // or check if there's a restaurant_id column.
      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restData.id)
      
      if (itemError) throw itemError
      
      if (itemData) {
        setItems(itemData as MenuItem[])
        const uniqueCategories = Array.from(new Set(itemData.map(item => item.category)))
        setCategories(uniqueCategories)
        if (uniqueCategories.length > 0) setSelectedCategory(uniqueCategories[0])
      }
    } catch (error) {
      console.error('Error fetching menu:', error)
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

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(0, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }).filter(i => i.quantity > 0))
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
  const tax = subtotal * 0.1
  const serviceCharge = subtotal * 0.05
  const total = subtotal + tax + serviceCharge

  const handlePlaceOrder = async (confirmedIntentId?: string) => {
    if (cart.length === 0) return
    
    // If card selected but no payment intent yet, create it
    if (paymentMethod === 'card' && !confirmedIntentId && !clientSecret) {
      try {
        setIsOrdering(true)
        const { clientSecret: secret, id: intentId } = await createPaymentIntent(total, {
          restaurant_slug: slug,
          table: tableNumber
        })
        setClientSecret(secret || null)
        setStripeIntentId(intentId)
        setIsPaymentSheetOpen(true)
        return
      } catch (error: any) {
        console.error('Stripe error:', error.message)
        return
      } finally {
        setIsOrdering(false)
      }
    }

    if (!paymentMethod) {
      setIsPaymentSheetOpen(true)
      return
    }
    
    try {
      setIsOrdering(true)
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurant.id,
          location_id: locations[0]?.id,
          status: 'pending',
          total: total,
          payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
          payment_method: paymentMethod,
          type: 'dine_in',
          table_number: tableNumber,
          stripe_payment_intent_id: confirmedIntentId || stripeIntentId,
          metadata: {
            table: tableNumber,
            tax: tax,
            service_charge: serviceCharge
          }
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))

      await supabase.from('order_items').insert(orderItems)

      setCart([])
      setIsCartOpen(false)
      setIsPaymentSheetOpen(false)
      setOrderId(order.id)
      setIsSuccess(true)
    } catch (error: any) {
      console.error('Order error:', error.message)
    } finally {
      setIsOrdering(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[32px] flex items-center justify-center mb-8 animate-in zoom-in duration-500 shadow-xl shadow-amber-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black mb-4 text-gradient tracking-tight">Order Placed!</h1>
        <p className="text-muted-foreground font-medium max-w-xs mb-10">
          Your order has been sent to the kitchen. {paymentMethod === 'cash' ? 'Please have your cash ready for when the staff arrives.' : 'Your payment was successful.'}
        </p>
        <div className="w-full max-w-xs space-y-4">
          <Button 
            className="w-full h-14 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            onClick={() => setIsSuccess(false)}
          >
            ORDER MORE
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-14 rounded-2xl font-bold text-muted-foreground hover:bg-muted"
            onClick={() => window.location.reload()}
          >
            VIEW ORDER STATUS
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-amber-500/10" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Menu...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <h1 className="text-2xl font-black mb-2 text-gradient">Restaurant Not Found</h1>
        <p className="text-muted-foreground font-medium">We couldn't find the menu you're looking for.</p>
        <Button className="mt-8 h-12 rounded-xl px-8" onClick={() => window.location.href = '/'}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col pb-24 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 p-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-gradient leading-none">{restaurant.name}</h1>
            <div className="flex items-center gap-2">
              {tableNumber && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 font-bold border-none px-2 py-0">
                  TABLE {tableNumber}
                </Badge>
              )}
              {waiterCalled && (
                <Badge className="bg-emerald-500 text-white animate-pulse font-bold border-none px-2 py-0">
                  Waiter Called!
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-2xl border-border/50 transition-all shadow-sm active:scale-95",
                waiterCalled ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "hover:border-amber-200 hover:bg-amber-50/50"
              )}
              onClick={handleCallWaiter}
              disabled={isCallingWaiter || waiterCalled}
            >
              {isCallingWaiter ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Categories Scroller */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 -mx-2 px-2">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 animate-in fade-in slide-in-from-right-4",
                selectedCategory === cat 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105" 
                  : "bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Items */}
      <main className="flex-1 p-6 space-y-6">
        {items
          .filter(item => !selectedCategory || item.category === selectedCategory)
          .map((item, idx) => (
            <div 
              key={item.id} 
              className="premium-card p-4 flex gap-5 group animate-in fade-in-up duration-500"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-28 h-28 bg-muted rounded-[24px] overflow-hidden flex-shrink-0 relative shadow-inner">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground leading-tight tracking-tight group-hover:text-amber-600 transition-colors">{item.name}</h3>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {item.description || "Freshly prepared with premium ingredients."}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-black tracking-tighter text-amber-600">${Number(item.price).toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-11 h-11 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center active:scale-90 hover:scale-110 transition-all shadow-lg shadow-primary/10"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-40 animate-in slide-in-from-bottom-8 duration-500">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <button className="w-full bg-primary text-primary-foreground h-16 rounded-[24px] shadow-2xl shadow-primary/30 flex items-center justify-between px-7 active:scale-95 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-9 h-9 bg-primary-foreground/10 backdrop-blur-md rounded-xl flex items-center justify-center font-black text-sm">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </div>
                  <span className="font-black uppercase tracking-widest text-xs">Review Order</span>
                </div>
                <span className="font-black text-xl tracking-tighter relative z-10">${total.toFixed(2)}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-[40px] px-8 pb-12 max-h-[90vh] border-none shadow-2xl glass-morphism-dark text-white">
              <SheetHeader className="mb-8 text-left">
                <SheetTitle className="text-3xl font-black text-white tracking-tight">Your Selection</SheetTitle>
                <SheetDescription className="font-bold text-white/50 uppercase tracking-widest text-[10px]">
                  {tableNumber ? `Table ${tableNumber} • Dine-in` : 'Dine-in Order'}
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-8 overflow-y-auto max-h-[45vh] mb-10 pr-2 no-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{item.name}</h4>
                      <p className="text-amber-500 font-bold tracking-tighter text-sm">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-black w-5 text-center text-lg">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-5 pt-8 border-t border-white/10">
                <div className="flex justify-between items-center text-white/50 font-bold uppercase tracking-widest text-[10px]">
                  <span>Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-black text-white tracking-tighter">
                  <span>Grand Total</span>
                  <span className="text-amber-500">${total.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-16 rounded-[24px] font-black text-lg mt-6 bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 border-none transition-all hover:scale-[1.02] active:scale-95"
                  onClick={() => handlePlaceOrder()}
                  disabled={isOrdering}
                >
                  {isOrdering ? 'PROCESSING...' : 'CONFIRM ORDER'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Payment Method Selection Sheet */}
      <Sheet open={isPaymentSheetOpen} onOpenChange={(open) => {
        setIsPaymentSheetOpen(open)
        if (!open) {
          setClientSecret(null)
        }
      }}>
        <SheetContent side="bottom" className="rounded-t-[40px] px-8 pb-12 glass-morphism-dark border-none text-white">
          <SheetHeader className="mb-10 text-left">
            <SheetTitle className="text-2xl font-black text-center">
              {clientSecret ? 'Complete Payment' : 'Payment Method'}
            </SheetTitle>
            <SheetDescription className="font-bold text-slate-500 text-center">
              {clientSecret 
                ? 'Enter your card details to complete the order' 
                : 'How would you like to pay for your order?'}
            </SheetDescription>
          </SheetHeader>

          {clientSecret ? (
            <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
              <Elements 
                stripe={stripePromise} 
                options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#F59E0B',
                      colorBackground: '#1e1e1e',
                      colorText: '#ffffff',
                      borderRadius: '16px', 
                    }
                  }
                }}
              >
                <CheckoutForm 
                  total={total} 
                  onPaymentSuccess={(intentId) => handlePlaceOrder(intentId)}
                  onCancel={() => {
                    setClientSecret(null)
                    setPaymentMethod(null)
                  }}
                />
              </Elements>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 mb-8">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                    paymentMethod === 'card' 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    paymentMethod === 'card' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900">Pay with Card</p>
                    <p className="text-sm font-bold text-slate-500">Debit or Credit Card</p>
                  </div>
                  {paymentMethod === 'card' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                    paymentMethod === 'cash' 
                      ? "border-blue-600 bg-blue-50/50" 
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    paymentMethod === 'cash' ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-900">Pay with Cash</p>
                    <p className="text-sm font-bold text-slate-500">Pay at the counter or to staff</p>
                  </div>
                  {paymentMethod === 'cash' && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                </button>
              </div>

              <Button 
                className="w-full h-16 rounded-2xl font-black text-lg bg-blue-600 shadow-xl shadow-blue-100"
                onClick={() => {
                  if (paymentMethod === 'card') {
                    handlePlaceOrder()
                  } else {
                    handlePlaceOrder()
                  }
                }}
                disabled={!paymentMethod || isOrdering}
              >
                {isOrdering ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>PREPARING...</span>
                  </div>
                ) : (
                  'CONFIRM & ORDER'
                )}
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
