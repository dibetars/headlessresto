'use client'

import React, { useState, useEffect } from 'react'
import { getTables, addTableAction, updateTableAction, deleteTableAction } from '@/app/auth/actions'
import {
  Plus,
  Trash2,
  Search,
  QrCode,
  Download,
  Users,
  Layers,
  UtensilsCrossed,
  Edit2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

interface Table {
  id: string
  table_number: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  org_id?: string
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isQRSheetOpen, setIsQRSheetOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newTable, setNewTable] = useState({
    table_number: '',
    capacity: 2,
    status: 'available' as const
  })

  const [editTable, setEditTable] = useState<{
    table_number: string
    capacity: number
    status: 'available' | 'occupied' | 'reserved'
  }>({
    table_number: '',
    capacity: 2,
    status: 'available'
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const data = await getTables()
      setTables(data as Table[])
    } catch (error: any) {
      console.error('Error fetching tables:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = async () => {
    try {
      if (!newTable.table_number) return
      setIsSubmitting(true)
      await addTableAction(newTable.table_number, newTable.capacity)
      setIsAddSheetOpen(false)
      setNewTable({ table_number: '', capacity: 2, status: 'available' })
      fetchTables()
    } catch (error: any) {
      alert('Error adding table: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTable = async () => {
    try {
      if (!selectedTable || !editTable.table_number) return
      setIsSubmitting(true)
      await updateTableAction(selectedTable.id, {
        table_number: editTable.table_number,
        capacity: editTable.capacity,
        status: editTable.status,
      })
      setIsEditSheetOpen(false)
      setSelectedTable(null)
      fetchTables()
    } catch (error: any) {
      alert('Error updating table: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Delete this table?')) return
    try {
      await deleteTableAction(id)
      setTables(prev => prev.filter(t => t.id !== id))
    } catch (error: any) {
      alert('Error deleting table: ' + error.message)
    }
  }

  const downloadQRCode = (tableNumber: string) => {
    const svg = document.getElementById(`qr-table-${tableNumber}`)
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `table-${tableNumber}-qr.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const filteredTables = tables.filter(t =>
    t.table_number.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Tables</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage dining space and connect tables to digital ordering.</p>
        </div>
        <Button
          onClick={() => setIsAddSheetOpen(true)}
          className="h-11 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
        >
          <Plus className="w-4 h-4" />
          Add Table
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{tables.length}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Total Tables</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{tables.reduce((s, t) => s + t.capacity, 0)}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Total Covers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{tables.filter(t => t.status === 'available').length}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Available Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 h-10 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
        />
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Layers className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-semibold">No tables yet</p>
          <p className="text-xs mt-1">Add your first table to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <Card
              key={table.id}
              className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            >
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                {/* Actions */}
                <div className="w-full flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSelectedTable(table)
                      setEditTable({ table_number: table.table_number, capacity: table.capacity, status: table.status })
                      setIsEditSheetOpen(true)
                    }}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>

                {/* Table number badge */}
                <div className={cn(
                  'w-20 h-20 rounded-2xl flex items-center justify-center font-black text-3xl relative',
                  table.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                  table.status === 'occupied' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                )}>
                  {table.table_number}
                  <div className={cn(
                    'absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white',
                    table.status === 'available' ? 'bg-emerald-500' :
                    table.status === 'occupied' ? 'bg-amber-500' :
                    'bg-red-500'
                  )} />
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  {table.capacity} guests
                </div>

                <Badge className={cn(
                  'font-semibold border-none uppercase tracking-wider text-[10px] py-1 px-3 rounded-lg',
                  table.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                  table.status === 'occupied' ? 'bg-amber-50 text-amber-600' :
                  'bg-red-50 text-red-600'
                )}>
                  {table.status}
                </Badge>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl h-9 border-gray-200 hover:bg-brand-orange/5 hover:border-brand-orange/30 text-gray-600 hover:text-brand-orange font-semibold text-xs gap-1.5 transition-all"
                  onClick={() => { setSelectedTable(table); setIsQRSheetOpen(true) }}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR Code
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Table Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <div className="h-full flex flex-col">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-black tracking-tight">Add Table</SheetTitle>
              <SheetDescription>Initialize a new dining table in your space.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Table Number / ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1, A1, VIP-1"
                  value={newTable.table_number}
                  onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                  className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Seating Capacity</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setNewTable({ ...newTable, capacity: cap })}
                      className={cn(
                        'h-12 rounded-xl font-bold text-base transition-all duration-200 border',
                        newTable.capacity === cap
                          ? 'bg-brand-orange border-brand-orange text-white shadow-[0_4px_12px_rgba(245,124,0,0.25)]'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button
                className="w-full h-11 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
                onClick={handleAddTable}
                disabled={isSubmitting || !newTable.table_number}
              >
                {isSubmitting ? 'Adding…' : 'Add Table'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Table Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <div className="h-full flex flex-col">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-black tracking-tight">Edit Table</SheetTitle>
              <SheetDescription>Update table parameters and status.</SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Table Number / ID</label>
                <input
                  type="text"
                  value={editTable.table_number}
                  onChange={(e) => setEditTable({ ...editTable, table_number: e.target.value })}
                  className="w-full px-4 h-11 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Capacity</label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setEditTable({ ...editTable, capacity: cap })}
                      className={cn(
                        'h-12 rounded-xl font-bold text-base transition-all duration-200 border',
                        editTable.capacity === cap
                          ? 'bg-brand-orange border-brand-orange text-white shadow-[0_4px_12px_rgba(245,124,0,0.25)]'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</label>
                <div className="grid grid-cols-1 gap-2">
                  {(['available', 'occupied', 'reserved'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditTable({ ...editTable, status })}
                      className={cn(
                        'h-12 px-4 rounded-xl font-semibold text-sm transition-all border flex items-center justify-between uppercase tracking-wider',
                        editTable.status === status
                          ? status === 'available' ? 'bg-emerald-500 border-emerald-500 text-white'
                          : status === 'occupied' ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-red-500 border-red-500 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span>{status}</span>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        editTable.status === status ? 'bg-white' :
                        status === 'available' ? 'bg-emerald-500' :
                        status === 'occupied' ? 'bg-amber-500' : 'bg-red-500'
                      )} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button
                className="w-full h-11 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
                onClick={handleEditTable}
                disabled={isSubmitting || !editTable.table_number}
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* QR Code Sheet */}
      <Sheet open={isQRSheetOpen} onOpenChange={setIsQRSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <div className="h-full flex flex-col">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-black tracking-tight">QR Code</SheetTitle>
              <SheetDescription>
                Scan to access menu for Table {selectedTable?.table_number}.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="p-8 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-black/[0.04] flex flex-col items-center gap-4">
                <div className="text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scan to order</div>
                  <div className="text-2xl font-black text-gray-900 mt-1">Table {selectedTable?.table_number}</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border-4 border-gray-900">
                  {selectedTable && (
                    <QRCodeSVG
                      id={`qr-table-${selectedTable.table_number}`}
                      value={`${window.location.origin}/menu/demo?table=${selectedTable.table_number}`}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900">
                  <UtensilsCrossed className="w-4 h-4 text-brand-orange" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-white">Headless Resto</span>
                </div>
              </div>

              <div className="w-full space-y-2">
                <Button
                  className="w-full h-11 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none gap-2"
                  onClick={() => selectedTable && downloadQRCode(selectedTable.table_number)}
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
