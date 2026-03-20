'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  AlertCircle,
  TrendingUp,
  History
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

interface StockItem {
  id: string
  name: string
  quantity: number
  unit: string
  cost_per_unit_cents: number
  reorder_threshold: number
  category: string
  updated_at: string
  last_restocked?: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isAdjustSheetOpen, setIsAdjustSheetOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [adjustment, setAdjustment] = useState<{ quantity: number, reason: string }>({ quantity: 0, reason: 'Restock' })
  
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 0,
    unit: 'unit',
    category: 'produce',
    reorder_threshold: 5,
    cost_per_unit_cents: 0
  })

  const supabase = createClient()

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stock_items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      console.error('Error fetching inventory:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    try {
      if (!newItem.name) return
      setIsSubmitting(true)
      const { error } = await supabase
        .from('stock_items')
        .insert([newItem])

      if (error) throw error
      
      setIsAddSheetOpen(false)
      setNewItem({
        name: '',
        quantity: 0,
        unit: 'unit',
        category: 'produce',
        reorder_threshold: 5,
        cost_per_unit_cents: 0
      })
      fetchInventory()
    } catch (error: any) {
      alert('Error adding item: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedItem) return
    try {
      setIsSubmitting(true)
      
      const newQuantity = selectedItem.quantity + adjustment.quantity
      
      const { error: updateError } = await supabase
        .from('stock_items')
        .update({ quantity: newQuantity })
        .eq('id', selectedItem.id)

      if (updateError) throw updateError

      const { error: moveError } = await supabase
        .from('stock_movements')
        .insert({
          stock_item_id: selectedItem.id,
          quantity_change: adjustment.quantity,
          reason: adjustment.reason
        })

      if (moveError) throw moveError

      setIsAdjustSheetOpen(false)
      setAdjustment({ quantity: 0, reason: 'Restock' })
      setSelectedItem(null)
      fetchInventory()
    } catch (error: any) {
      alert('Error adjusting stock: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockItems = items.filter(item => item.quantity <= (item.reorder_threshold || 0))
  const totalValueCents = items.reduce((acc, item) => acc + (item.quantity * item.cost_per_unit_cents), 0)

  return (
    <div className="space-y-8 pb-10 min-h-screen bg-[#020202] text-white p-6 md:p-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Inventory</h1>
          <p className="text-white/40 font-bold mt-2 uppercase tracking-widest text-xs">Monitor and manage your restaurant's stock levels.</p>
        </div>
        <Button 
          onClick={() => setIsAddSheetOpen(true)}
          className="h-16 px-10 rounded-[24px] bg-amber-500 hover:bg-amber-400 text-black font-black text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95 border-none uppercase italic"
        >
          <Plus className="w-6 h-6" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,1)] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <Package className="w-7 h-7" />
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 font-black border-none uppercase tracking-tighter py-1.5 px-3">TOTAL ITEMS</Badge>
            </div>
            <div className="text-5xl font-black text-white italic tracking-tighter">{items.length}</div>
            <div className="text-xs font-black text-white/30 mt-2 uppercase tracking-widest">Across all categories</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,1)] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform duration-500">
                <AlertCircle className="w-7 h-7" />
              </div>
              <Badge variant="secondary" className="bg-red-500/10 text-red-500 font-black border-none uppercase tracking-tighter py-1.5 px-3">LOW STOCK</Badge>
            </div>
            <div className="text-5xl font-black text-white italic tracking-tighter">{lowStockItems.length}</div>
            <div className="text-xs font-black text-white/30 mt-2 uppercase tracking-widest">Requires immediate reorder</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,1)] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-7 h-7" />
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 font-black border-none uppercase tracking-tighter py-1.5 px-3">VALUATION</Badge>
            </div>
            <div className="text-5xl font-black text-white italic tracking-tighter">${(totalValueCents / 100).toLocaleString()}</div>
            <div className="text-xs font-black text-white/30 mt-2 uppercase tracking-widest">Total stock value (USD)</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,1)] rounded-[48px] overflow-hidden">
        <CardHeader className="p-10 border-b border-white/[0.05] bg-white/[0.01]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <Input 
                placeholder="Search inventory items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-16 bg-white/[0.03] border-white/[0.08] rounded-2xl font-bold text-white placeholder:text-white/20 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all text-lg"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="h-16 rounded-2xl border-white/[0.08] bg-white/[0.03] text-white font-black px-8 flex items-center gap-3 hover:bg-white/10 uppercase italic tracking-widest text-sm">
                <Filter className="w-5 h-5" />
                Filter
              </Button>
              <Button variant="outline" className="h-16 w-16 rounded-2xl border-white/[0.08] bg-white/[0.03] text-white p-0 flex items-center justify-center hover:bg-white/10">
                <History className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.01]">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Stock Item</TableHead>
                  <TableHead className="py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Category</TableHead>
                  <TableHead className="py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Current Stock</TableHead>
                  <TableHead className="py-8 px-10 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Status</TableHead>
                  <TableHead className="py-8 px-10 text-right text-[11px] font-black uppercase tracking-[0.2em] text-white/30">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-white/20 font-black uppercase italic tracking-widest">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-white/20 font-black uppercase italic tracking-widest">
                      No items found in stock.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.quantity <= (item.reorder_threshold || 0);
                    const isOut = item.quantity <= 0;
                    
                    return (
                      <TableRow key={item.id} className="group border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-300">
                        <TableCell className="py-8 px-10">
                          <div>
                            <div className="font-black text-white text-xl italic tracking-tight">{item.name}</div>
                            <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                              ${(item.cost_per_unit_cents / 100).toFixed(2)} / {item.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-8 px-10">
                          <Badge variant="secondary" className="bg-white/[0.05] text-white/60 font-black rounded-lg py-1.5 px-4 border border-white/[0.05] uppercase tracking-tighter text-[10px]">
                            {item.category?.toUpperCase() || 'GENERAL'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-8 px-10">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-3xl font-black italic tracking-tighter",
                              isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-white"
                            )}>
                              {item.quantity}
                            </span>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{item.unit}S</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-8 px-10">
                          {isOut ? (
                            <div className="flex items-center gap-2 text-red-500 font-black text-[11px] uppercase tracking-widest">
                              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                              Out of Stock
                            </div>
                          ) : isLow ? (
                            <div className="flex items-center gap-2 text-amber-500 font-black text-[11px] uppercase tracking-widest">
                              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
                              Low Stock
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-500 font-black text-[11px] uppercase tracking-widest">
                              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                              In Stock
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-8 px-10 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <Button 
                              onClick={() => {
                                setSelectedItem(item)
                                setIsAdjustSheetOpen(true)
                                setAdjustment({ quantity: 1, reason: 'Restock' })
                              }}
                              variant="ghost" 
                              className="w-12 h-12 p-0 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all group-hover:scale-110"
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" className="w-12 h-12 p-0 rounded-2xl hover:bg-white/[0.05] text-white/40 hover:text-white">
                              <MoreVertical className="w-6 h-6" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Item Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md bg-[#020202] border-white/[0.08] text-white">
          <SheetHeader className="pb-8 border-b border-white/[0.05]">
            <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Add Stock Item</SheetTitle>
            <SheetDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Create a new item in your inventory list.</SheetDescription>
          </SheetHeader>
          <div className="space-y-8 py-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Item Name</label>
              <Input 
                placeholder="e.g. Tomato Sauce" 
                className="h-16 rounded-2xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/10 font-bold" 
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Initial Quantity</label>
                <Input 
                  type="number" 
                  placeholder="0" 
                  className="h-16 rounded-2xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/10 font-bold" 
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Unit</label>
                <select 
                  className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white px-5 font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                >
                  <option value="kg" className="bg-[#020202]">Kilogram (kg)</option>
                  <option value="l" className="bg-[#020202]">Liter (l)</option>
                  <option value="unit" className="bg-[#020202]">Unit</option>
                  <option value="box" className="bg-[#020202]">Box</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Cost (Cents)</label>
                <Input 
                  type="number" 
                  placeholder="100" 
                  className="h-16 rounded-2xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/10 font-bold" 
                  value={newItem.cost_per_unit_cents}
                  onChange={(e) => setNewItem({ ...newItem, cost_per_unit_cents: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Category</label>
                <select 
                  className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-white px-5 font-bold outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="produce" className="bg-[#020202]">Produce</option>
                  <option value="meat" className="bg-[#020202]">Meat & Poultry</option>
                  <option value="dairy" className="bg-[#020202]">Dairy</option>
                  <option value="dry" className="bg-[#020202]">Dry Goods</option>
                  <option value="beverages" className="bg-[#020202]">Beverages</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Reorder Threshold</label>
              <Input 
                type="number" 
                placeholder="Alert when stock falls below..." 
                className="h-16 rounded-2xl bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/10 font-bold" 
                value={newItem.reorder_threshold}
                onChange={(e) => setNewItem({ ...newItem, reorder_threshold: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <SheetFooter className="pt-8 border-t border-white/[0.05]">
            <Button 
              className="w-full h-20 rounded-3xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xl italic uppercase tracking-tighter shadow-[0_10px_40px_rgba(245,158,11,0.2)] transition-all active:scale-95"
              onClick={handleAddItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Create Item'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Adjust Stock Sheet */}
      <Sheet open={isAdjustSheetOpen} onOpenChange={setIsAdjustSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md bg-[#020202] border-white/[0.08] text-white">
          <SheetHeader className="pb-8 border-b border-white/[0.05]">
            <SheetTitle className="text-3xl font-black italic uppercase tracking-tighter text-white">Adjust Stock</SheetTitle>
            <SheetDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Update stock level for {selectedItem?.name}.</SheetDescription>
          </SheetHeader>
          <div className="space-y-10 py-12">
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Quantity Change</label>
              <div className="flex items-center gap-6">
                <Button 
                  variant="outline" 
                  className="h-20 w-20 rounded-3xl bg-white/[0.03] border-white/[0.08] text-white text-2xl font-black hover:bg-white/10"
                  onClick={() => setAdjustment({ ...adjustment, quantity: adjustment.quantity - 1 })}
                >
                  -
                </Button>
                <Input 
                  type="number" 
                  className="h-20 rounded-3xl bg-white/[0.03] border-white/[0.08] text-white text-center text-4xl font-black italic tracking-tighter" 
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })}
                />
                <Button 
                  variant="outline" 
                  className="h-20 w-20 rounded-3xl bg-white/[0.03] border-white/[0.08] text-white text-2xl font-black hover:bg-white/10"
                  onClick={() => setAdjustment({ ...adjustment, quantity: adjustment.quantity + 1 })}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Reason</label>
              <select 
                className="w-full h-20 rounded-3xl bg-white/[0.03] border border-white/[0.08] text-white px-8 font-black text-lg italic uppercase tracking-tighter outline-none focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
                value={adjustment.reason}
                onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
              >
                <option value="Restock" className="bg-[#020202]">Restock</option>
                <option value="Damage" className="bg-[#020202]">Damage</option>
                <option value="Waste" className="bg-[#020202]">Waste</option>
                <option value="Correction" className="bg-[#020202]">Correction</option>
              </select>
            </div>
          </div>
          <SheetFooter className="pt-8 border-t border-white/[0.05]">
            <Button 
              className="w-full h-20 rounded-3xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xl italic uppercase tracking-tighter shadow-[0_10px_40px_rgba(245,158,11,0.2)] transition-all active:scale-95"
              onClick={handleAdjustStock}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Confirm Adjustment'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
