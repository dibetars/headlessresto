'use client'

import React, { useState, useEffect } from 'react'
import { getInventoryItems, addInventoryItemAction, adjustStockAction } from '@/app/auth/actions'
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
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null)
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

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const data = await getInventoryItems()
      setItems(data as StockItem[])
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
      await addInventoryItemAction(newItem)
      setIsAddSheetOpen(false)
      setNewItem({ name: '', quantity: 0, unit: 'unit', category: 'produce', reorder_threshold: 5, cost_per_unit_cents: 0 })
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
      await adjustStockAction(selectedItem.id, adjustment.quantity, adjustment.reason, selectedItem.quantity)
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor and manage your restaurant's stock levels.</p>
        </div>
        <Button
          onClick={() => setIsAddSheetOpen(true)}
          className="h-11 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{items.length}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Total Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{lowStockItems.length}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Low Stock</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">${(totalValueCents / 100).toLocaleString()}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Stock Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Item</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Stock</TableHead>
                  <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</TableHead>
                  <TableHead className="py-4 px-6 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-gray-400 text-sm animate-pulse">
                      Loading inventory…
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-gray-400 text-sm">
                      No items found in stock.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.quantity <= (item.reorder_threshold || 0)
                    const isOut = item.quantity <= 0

                    return (
                      <TableRow key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4 px-6">
                          <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            ${(item.cost_per_unit_cents / 100).toFixed(2)} / {item.unit}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge className="bg-gray-100 text-gray-600 font-semibold border-none uppercase tracking-wider text-[10px] py-1 px-3 rounded-lg">
                            {item.category || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xl font-black",
                              isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-gray-900"
                            )}>
                              {item.quantity}
                            </span>
                            <span className="text-xs text-gray-400">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {isOut ? (
                            <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              Out of stock
                            </div>
                          ) : isLow ? (
                            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Low stock
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              In stock
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-6 text-right">
                          <Button
                            onClick={() => {
                              setSelectedItem(item)
                              setIsAdjustSheetOpen(true)
                              setAdjustment({ quantity: 1, reason: 'Restock' })
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-xl border-gray-200 hover:bg-brand-orange/5 hover:border-brand-orange/30"
                          >
                            <Plus className="w-3.5 h-3.5 text-gray-500" />
                          </Button>
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
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="pb-6 border-b border-gray-100">
            <SheetTitle className="text-2xl font-black tracking-tight">Add Stock Item</SheetTitle>
            <SheetDescription>Create a new item in your inventory list.</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Item Name</label>
              <Input
                placeholder="e.g. Tomato Sauce"
                className="h-11 rounded-xl bg-gray-50 border-gray-200 font-medium"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Initial Qty</label>
                <Input
                  type="number"
                  placeholder="0"
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 font-medium"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Unit</label>
                <select
                  className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-3 font-medium outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="l">Liter (l)</option>
                  <option value="unit">Unit</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cost (Cents)</label>
                <Input
                  type="number"
                  placeholder="100"
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 font-medium"
                  value={newItem.cost_per_unit_cents}
                  onChange={(e) => setNewItem({ ...newItem, cost_per_unit_cents: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Category</label>
                <select
                  className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-3 font-medium outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="produce">Produce</option>
                  <option value="meat">Meat &amp; Poultry</option>
                  <option value="dairy">Dairy</option>
                  <option value="dry">Dry Goods</option>
                  <option value="beverages">Beverages</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reorder Threshold</label>
              <Input
                type="number"
                placeholder="Alert when stock falls below..."
                className="h-11 rounded-xl bg-gray-50 border-gray-200 font-medium"
                value={newItem.reorder_threshold}
                onChange={(e) => setNewItem({ ...newItem, reorder_threshold: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <SheetFooter className="pt-6 border-t border-gray-100">
            <Button
              className="w-full h-11 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
              onClick={handleAddItem}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding…' : 'Add Item'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Adjust Stock Sheet */}
      <Sheet open={isAdjustSheetOpen} onOpenChange={setIsAdjustSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader className="pb-6 border-b border-gray-100">
            <SheetTitle className="text-2xl font-black tracking-tight">Adjust Stock</SheetTitle>
            <SheetDescription>Update stock level for {selectedItem?.name}.</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quantity Change</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-11 w-11 rounded-xl border-gray-200 text-lg font-black hover:bg-gray-100 shrink-0"
                  onClick={() => setAdjustment({ ...adjustment, quantity: adjustment.quantity - 1 })}
                >
                  -
                </Button>
                <Input
                  type="number"
                  className="h-11 rounded-xl bg-gray-50 border-gray-200 text-center text-xl font-black"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })}
                />
                <Button
                  variant="outline"
                  className="h-11 w-11 rounded-xl border-gray-200 text-lg font-black hover:bg-gray-100 shrink-0"
                  onClick={() => setAdjustment({ ...adjustment, quantity: adjustment.quantity + 1 })}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reason</label>
              <select
                className="w-full h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-3 font-medium outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
                value={adjustment.reason}
                onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
              >
                <option value="Restock">Restock</option>
                <option value="Damage">Damage</option>
                <option value="Waste">Waste</option>
                <option value="Correction">Correction</option>
              </select>
            </div>
          </div>
          <SheetFooter className="pt-6 border-t border-gray-100">
            <Button
              className="w-full h-11 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
              onClick={handleAdjustStock}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating…' : 'Confirm Adjustment'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
