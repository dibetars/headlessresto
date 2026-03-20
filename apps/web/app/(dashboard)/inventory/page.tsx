'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  History,
  MoreVertical,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet'

interface StockItem {
  id: string
  name: string
  quantity: number
  unit: string
  cost_per_unit_cents: number
  reorder_threshold: number
  category: string
  updated_at: string
}

interface StockMovement {
  id: string
  stock_item_id: string
  quantity_change: number
  reason: string
  created_at: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [isAddingItem, setIsAddingItem] = useState(false)
  
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
        .order('name')
      
      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('stock_item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      setMovements(data || [])
    } catch (error) {
      console.error('Error fetching movements:', error)
    }
  }

  const handleSelectItem = (item: StockItem) => {
    setSelectedItem(item)
    fetchMovements(item.id)
  }

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (item: StockItem) => {
    if (item.quantity <= 0) return <Badge variant="destructive">Out of Stock</Badge>
    if (item.quantity <= item.reorder_threshold) return <Badge variant="warning">Low Stock</Badge>
    return <Badge variant="success">In Stock</Badge>
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-brand-orange" />
            Inventory Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your ingredients, supplies, and stock levels.</p>
        </div>
        <Button onClick={() => setIsAddingItem(true)} className="rounded-2xl h-12 px-6 font-black shadow-lg shadow-brand-orange/10 bg-brand-orange hover:bg-brand-orange/90 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Total Items</CardTitle>
            <Package className="w-5 h-5 text-brand-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Low Stock</CardTitle>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-500">
              {items.filter(i => i.quantity > 0 && i.quantity <= i.reorder_threshold).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Out of Stock</CardTitle>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-500">
              {items.filter(i => i.quantity <= 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by name or category..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl font-bold">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-400">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => handleSelectItem(item)}>
                    <TableCell className="font-bold text-slate-900">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-slate-100">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-black">{item.quantity}</span>
                      <span className="ml-1 text-slate-400 text-xs uppercase font-bold">{item.unit}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell className="font-medium text-slate-600">
                      ${(item.cost_per_unit_cents / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronRight className="w-5 h-5 text-slate-300" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={(open: boolean) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <SheetTitle>{selectedItem?.name}</SheetTitle>
                <SheetDescription>{selectedItem?.category}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-8 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stock Level</div>
                <div className="text-2xl font-black">{selectedItem?.quantity} {selectedItem?.unit}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Threshold</div>
                <div className="text-2xl font-black">{selectedItem?.reorder_threshold} {selectedItem?.unit}</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Movements
              </h3>
              <div className="space-y-3">
                {movements.map((move) => (
                  <div key={move.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        move.quantity_change > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      )}>
                        {move.quantity_change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold">{move.reason}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{new Date(move.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className={cn(
                      "font-black text-sm",
                      move.quantity_change > 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {move.quantity_change > 0 ? '+' : ''}{move.quantity_change}
                    </div>
                  </div>
                ))}
                {movements.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm italic">No recent movements recorded.</div>
                )}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" className="flex-1 rounded-xl">Edit Item</Button>
            <Button className="flex-1 rounded-xl">Record Movement</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
