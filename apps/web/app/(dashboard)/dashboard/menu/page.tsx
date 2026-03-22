'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Search,
  UtensilsCrossed,
  Image as ImageIcon,
  Edit2,
  Trash2,
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Design and curate your digital menu. Real-time updates across all customer touchpoints.</p>
        </div>
        <Button
          onClick={() => setIsAddSheetOpen(true)}
          className="h-10 px-5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center gap-2 border-none shadow-[0_4px_12px_rgba(245,124,0,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Stats & Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quick Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white border border-gray-100 rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <Badge className="bg-amber-50 text-amber-600 font-semibold border-none uppercase tracking-wide text-[10px]">DISHES</Badge>
              </div>
              <div className="text-3xl font-black text-gray-900">{items.length}</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Total menu items</div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                  <Tag className="w-5 h-5" />
                </div>
                <Badge className="bg-blue-50 text-blue-600 font-semibold border-none uppercase tracking-wide text-[10px]">SECTIONS</Badge>
              </div>
              <div className="text-3xl font-black text-gray-900">{categories.length}</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Active categories</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Bar */}
        <div className="lg:col-span-3">
          <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden h-full">
            <CardHeader className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search menu catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 bg-gray-50 border-gray-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all border",
                    selectedCategory === null
                      ? "bg-brand-orange border-brand-orange text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                  )}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-4 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition-all border",
                      selectedCategory === cat
                        ? "bg-brand-orange border-brand-orange text-white"
                        : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
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
      <Card className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">Dish / Product</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">Price</TableHead>
                  <TableHead className="py-4 px-6 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
                        <span className="text-gray-400 text-sm">Loading menu...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-gray-400 text-sm">
                      No menu items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="group border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                            {item.image_url ? (
                              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm group-hover:text-brand-orange transition-colors">{item.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5 max-w-xs line-clamp-1">
                              {item.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-semibold rounded-lg py-1 px-3 border-none uppercase tracking-wider text-[10px]">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="font-bold text-brand-orange text-sm">${Number(item.price).toFixed(2)}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider">USD</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            className="w-9 h-9 p-0 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-9 h-9 p-0 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <SheetContent side="right" className="sm:max-w-lg bg-white border-l border-gray-100 p-8">
          <SheetHeader className="pb-6 border-b border-gray-100">
            <SheetTitle className="text-xl font-bold text-gray-900">Add Menu Item</SheetTitle>
            <SheetDescription className="text-gray-500 text-sm mt-1">Add a new dish or product to your menu.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Dish Name</label>
              <Input
                placeholder="e.g. Truffle Ribeye Steak"
                className="rounded-xl bg-gray-50 border-gray-200 text-sm"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Price (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-9 rounded-xl bg-gray-50 border-gray-200 text-sm"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                <select
                  className="w-full h-10 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 px-3 outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main">Main Dish</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Wine">Wine</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</label>
              <textarea
                placeholder="Describe the flavors, ingredients, and preparation..."
                className="w-full h-28 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 p-3 outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all resize-none"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter className="pt-4 border-t border-gray-100">
            <Button
              className="w-full h-11 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold border-none shadow-[0_4px_12px_rgba(245,124,0,0.2)]"
              onClick={handleAddItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add to Menu'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
