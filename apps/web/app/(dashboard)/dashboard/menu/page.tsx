'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  UtensilsCrossed,
  LayoutGrid,
  Image as ImageIcon,
  Edit2,
  Trash2,
  ChevronRight,
  DollarSign,
  Tag
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
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  image_url?: string
  description?: string
  restaurant_id: string
}

export default function DashboardMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const [newItem, setNewItem] = useState({
    name: '',
    price: 0,
    category: 'Main',
    description: '',
    image_url: ''
  })

  const supabase = createClient()

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get restaurant_id from user profile or membership
      const { data: profile } = await supabase
        .from('users')
        .select('restaurant_id')
        .eq('id', user.id)
        .single()

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', profile?.restaurant_id)
        .order('category', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      console.error('Error fetching menu:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      if (!newItem.name || newItem.price <= 0) return
      setIsSubmitting(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users')
        .select('restaurant_id')
        .eq('id', user?.id)
        .single()

      const { error } = await supabase
        .from('menu_items')
        .insert([{
          ...newItem,
          restaurant_id: profile?.restaurant_id
        }])

      if (error) throw error
      
      setIsAddSheetOpen(false)
      setNewItem({
        name: '',
        price: 0,
        category: 'Main',
        description: '',
        image_url: ''
      })
      fetchMenu()
    } catch (error: any) {
      alert('Error adding menu item: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = Array.from(new Set(items.map(item => item.category)))
  
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-10 pb-16 min-h-screen bg-[#020202] text-white p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Menu Manager</h1>
          <p className="text-white/40 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] max-w-md">Design and curate your digital menu experience. Real-time updates across all customer touchpoints.</p>
        </div>
        <Button 
          onClick={() => setIsAddSheetOpen(true)}
          className="h-20 px-12 rounded-[32px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 border-none uppercase italic tracking-tighter"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
          Create Item
        </Button>
      </div>

      {/* Stats & Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Quick Stats */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">DISHES</Badge>
              </div>
              <div className="text-6xl font-black text-white italic tracking-tighter">{items.length}</div>
              <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Total menu items</div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
            <CardContent className="pt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform duration-500">
                  <Tag className="w-7 h-7" />
                </div>
                <Badge className="bg-blue-500/10 text-blue-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">SECTIONS</Badge>
              </div>
              <div className="text-6xl font-black text-white italic tracking-tighter">{categories.length}</div>
              <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Active categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Bar */}
        <div className="lg:col-span-3">
          <Card className="glass-morphism-dark border-white/[0.05] rounded-[48px] overflow-hidden h-full">
            <CardHeader className="p-10 border-b border-white/[0.05]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="relative flex-1 max-w-xl group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                  <Input 
                    placeholder="Search menu catalog..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-16 h-18 bg-white/[0.03] border-white/[0.08] rounded-[24px] font-bold text-white placeholder:text-white/20 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all text-xl"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="h-18 rounded-[24px] border-white/[0.08] bg-white/[0.03] text-white font-black px-10 flex items-center gap-4 hover:bg-white/10 uppercase italic tracking-widest text-xs">
                    <Filter className="w-5 h-5" />
                    Sort
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-10">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 border italic",
                    selectedCategory === null 
                      ? "bg-amber-500 border-amber-400 text-black shadow-[0_10px_30px_rgba(245,158,11,0.3)] scale-105" 
                      : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                  )}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-500 border italic",
                      selectedCategory === cat 
                        ? "bg-amber-500 border-amber-400 text-black shadow-[0_10px_30px_rgba(245,158,11,0.3)] scale-105" 
                        : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Menu Table */}
      <Card className="glass-morphism-dark border-white/[0.05] rounded-[56px] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="py-10 px-12 text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Dish / Product</TableHead>
                  <TableHead className="py-10 px-12 text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Category</TableHead>
                  <TableHead className="py-10 px-12 text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Price</TableHead>
                  <TableHead className="py-10 px-12 text-right text-[11px] font-black uppercase tracking-[0.3em] text-white/30">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-96 text-center text-white/20 font-black uppercase italic tracking-widest">
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        Synchronizing Menu...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-96 text-center text-white/20 font-black uppercase italic tracking-widest">
                      No menu items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, idx) => (
                    <TableRow key={item.id} className="group border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-500">
                      <TableCell className="py-10 px-12">
                        <div className="flex items-center gap-8">
                          <div className="w-24 h-24 bg-white/[0.03] rounded-[32px] overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-700 shadow-inner">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/10">
                                <ImageIcon className="w-10 h-10" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-white text-2xl italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors">{item.name}</div>
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-3 max-w-xs line-clamp-1 italic">
                              {item.description || "NO DESCRIPTION PROVIDED"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-10 px-12">
                        <Badge variant="secondary" className="bg-white/[0.05] text-white/60 font-black rounded-xl py-2 px-5 border border-white/[0.05] uppercase tracking-widest text-[10px] italic">
                          {item.category.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-10 px-12">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black italic tracking-tighter text-amber-500">${Number(item.price).toFixed(2)}</span>
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-2">USD</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-10 px-12 text-right">
                        <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <Button 
                            variant="ghost" 
                            className="w-14 h-14 p-0 rounded-2xl bg-white/[0.03] text-white/40 hover:bg-amber-500 hover:text-black transition-all"
                          >
                            <Edit2 className="w-5 h-5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="w-14 h-14 p-0 rounded-2xl bg-white/[0.03] text-white/40 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="sm:max-w-xl glass-morphism-dark border-white/[0.08] text-white p-12">
          <SheetHeader className="pb-10 border-b border-white/[0.05]">
            <SheetTitle className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">New Selection</SheetTitle>
            <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-4">Expand your culinary catalog with a new premium dish.</SheetDescription>
          </SheetHeader>
          <div className="space-y-10 py-12">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Dish Name</label>
              <Input 
                placeholder="e.g. TRUFFLE RIBEYE STEAK" 
                className="h-18 rounded-[24px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/10 font-bold text-xl px-8" 
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-18 rounded-[24px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/10 font-bold text-xl pl-16 pr-8" 
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Category</label>
                <div className="relative">
                  <select 
                    className="w-full h-18 rounded-[24px] bg-white/[0.03] border border-white/[0.08] text-white px-8 font-bold text-xl outline-none focus:ring-4 focus:ring-amber-500/10 transition-all appearance-none italic"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    <option value="Appetizer" className="bg-[#020202]">APPETIZER</option>
                    <option value="Main" className="bg-[#020202]">MAIN DISH</option>
                    <option value="Dessert" className="bg-[#020202]">DESSERT</option>
                    <option value="Beverage" className="bg-[#020202]">BEVERAGE</option>
                    <option value="Wine" className="bg-[#020202]">WINE LIST</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-white/30 ml-1">Description</label>
              <textarea 
                placeholder="Describe the flavors, ingredients, and preparation..." 
                className="w-full h-32 rounded-[24px] bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/10 font-bold text-lg p-8 outline-none focus:ring-4 focus:ring-amber-500/10 transition-all resize-none" 
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter className="pt-8 border-t border-white/[0.05]">
            <Button 
              className="w-full h-20 rounded-[32px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.02] active:scale-95 border-none uppercase italic tracking-tighter"
              onClick={handleAddItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'PROCESSING...' : 'CONFIRM DISH'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
