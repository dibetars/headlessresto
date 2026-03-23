'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Plus, 
  Trash2, 
  Search, 
  LayoutGrid, 
  QrCode,
  MoreVertical,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  UtensilsCrossed,
  Layers,
  Box,
  Monitor,
  Edit2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

interface Table {
  id: string
  table_number: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved'
  restaurant_id: string
  location_id: string
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
    table_number: string,
    capacity: number,
    status: 'available' | 'occupied' | 'reserved'
  }>({
    table_number: '',
    capacity: 2,
    status: 'available'
  })

  const supabase = createClient()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number', { ascending: true })

      if (error) throw error
      setTables(data || [])
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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('users')
        .select('restaurant_id')
        .eq('id', user.id)
        .single()

      const { error } = await supabase
        .from('tables')
        .insert([{
          ...newTable,
          restaurant_id: profile?.restaurant_id
        }])

      if (error) throw error
      
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
      
      const { error } = await supabase
        .from('tables')
        .update({
          table_number: editTable.table_number,
          capacity: editTable.capacity,
          status: editTable.status
        })
        .eq('id', selectedTable.id)

      if (error) throw error
      
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
    if (!confirm('Are you sure you want to delete this table?')) return
    
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchTables()
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
    <div className="space-y-10 pb-16 min-h-screen bg-[#020202] text-white p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Table Architecture</h1>
          <p className="text-white/40 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] max-w-md">Design and manage your physical dining space. Connect tables to digital ordering systems.</p>
        </div>
        <Button 
          onClick={() => setIsAddSheetOpen(true)}
          className="h-20 px-12 rounded-[32px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 border-none uppercase italic tracking-tighter"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
          Deploy Table
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-10 group hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Layers className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-amber-500/10 text-amber-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3 mb-6">CAPACITY</Badge>
            <div className="text-6xl font-black text-white italic tracking-tighter">{tables.length}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Active dining terminals</div>
          </div>
        </div>

        <div className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-10 group hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Users className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-emerald-500/10 text-emerald-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3 mb-6">SEATING</Badge>
            <div className="text-6xl font-black text-white italic tracking-tighter">
              {tables.reduce((sum, t) => sum + t.capacity, 0)}
            </div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Total guest covers</div>
          </div>
        </div>

        <div className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-10 group hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <QrCode className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-blue-500/10 text-blue-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3 mb-6">DIGITAL</Badge>
            <div className="text-6xl font-black text-white italic tracking-tighter">100%</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">QR Integration active</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative group max-w-xl">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-amber-500 transition-colors z-10" />
        <input 
          type="text"
          placeholder="SEARCH TABLES..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-20 pr-10 h-20 bg-white/[0.03] border-white/[0.08] focus:border-amber-500/30 focus:ring-8 focus:ring-amber-500/5 rounded-[32px] transition-all font-black uppercase tracking-[0.2em] text-sm shadow-inner outline-none placeholder:text-white/10 italic"
        />
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1,2,3,4].map(n => (
            <div key={n} className="h-80 bg-white/[0.02] rounded-[48px] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredTables.map((table) => (
            <div 
              key={table.id} 
              className="glass-morphism-dark rounded-[56px] p-12 border border-white/[0.05] hover:border-amber-500/30 transition-all duration-700 group relative overflow-hidden flex flex-col items-center text-center hover:scale-[1.02]"
            >
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedTable(table)
                    setEditTable({
                      table_number: table.table_number,
                      capacity: table.capacity,
                      status: table.status
                    })
                    setIsEditSheetOpen(true)
                  }}
                  className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all border border-white/5"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDeleteTable(table.id)}
                  className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-white/5"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className={cn(
                "w-32 h-32 rounded-[40px] flex items-center justify-center font-black text-5xl italic tracking-tighter mb-10 relative group-hover:scale-110 transition-transform duration-700 shadow-2xl",
                table.status === 'available' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/10" :
                table.status === 'occupied' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-amber-500/10" :
                "bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-rose-500/10"
              )}>
                {table.table_number}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-[6px] border-[#020202]",
                  table.status === 'available' ? "bg-emerald-500" :
                  table.status === 'occupied' ? "bg-amber-500" :
                  "bg-rose-500"
                )} />
              </div>
              
              <div className="space-y-3 mb-10">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Seating Capacity</div>
                <div className="flex items-center justify-center font-black text-2xl tracking-tighter text-white italic">
                  <Users className="w-6 h-6 mr-3 text-amber-500" />
                  {table.capacity} GUESTS
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full pt-6 border-t border-white/5">
                <Button 
                  variant="outline"
                  className="rounded-[24px] h-16 font-black uppercase tracking-widest text-[10px] italic border-white/[0.08] bg-white/[0.03] hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all flex items-center justify-center gap-3"
                  onClick={() => {
                    setSelectedTable(table)
                    setIsQRSheetOpen(true)
                  }}
                >
                  <QrCode className="w-5 h-5" />
                  QR ENGINE
                </Button>
              </div>
              
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="bg-[#020202] border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-12 space-y-6">
              <SheetTitle className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Deploy <span className="text-amber-500">Terminal</span></SheetTitle>
              <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">Initialize a new physical dining location into the digital ecosystem.</SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 p-12 space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Table Identifier</label>
                <input 
                  type="text"
                  placeholder="e.g. 101, A1, VIP-1"
                  value={newTable.table_number}
                  onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                  className="w-full px-8 h-20 bg-white/[0.03] border-white/[0.08] focus:border-amber-500/30 focus:ring-8 focus:ring-amber-500/5 rounded-[24px] transition-all font-black text-3xl italic tracking-tighter outline-none text-white placeholder:text-white/10"
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Seating Capacity</label>
                <div className="grid grid-cols-4 gap-4">
                  {[2, 4, 6, 8].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setNewTable({ ...newTable, capacity: cap })}
                      className={cn(
                        "h-20 rounded-[20px] font-black text-xl italic transition-all duration-500 border",
                        newTable.capacity === cap 
                          ? "bg-amber-500 border-amber-400 text-black shadow-2xl shadow-amber-500/30 scale-105" 
                          : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-12 border-t border-white/10">
              <Button 
                className="w-full h-20 rounded-[24px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] border-none uppercase italic tracking-tighter shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                onClick={handleAddTable}
                disabled={isSubmitting || !newTable.table_number}
              >
                {isSubmitting ? 'DEPLOYING...' : 'INITIALIZE TABLE'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Table Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="bg-[#020202] border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-12 space-y-6">
              <SheetTitle className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Modify <span className="text-amber-500">Terminal</span></SheetTitle>
              <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">Update physical table parameters and operational status.</SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 p-12 space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Table Identifier</label>
                <input 
                  type="text"
                  placeholder="e.g. 101, A1, VIP-1"
                  value={editTable.table_number}
                  onChange={(e) => setEditTable({ ...editTable, table_number: e.target.value })}
                  className="w-full px-8 h-20 bg-white/[0.03] border-white/[0.08] focus:border-amber-500/30 focus:ring-8 focus:ring-amber-500/5 rounded-[24px] transition-all font-black text-3xl italic tracking-tighter outline-none text-white placeholder:text-white/10"
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Seating Capacity</label>
                <div className="grid grid-cols-4 gap-4">
                  {[2, 4, 6, 8].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setEditTable({ ...editTable, capacity: cap })}
                      className={cn(
                        "h-20 rounded-[20px] font-black text-xl italic transition-all duration-500 border",
                        editTable.capacity === cap 
                          ? "bg-amber-500 border-amber-400 text-black shadow-2xl shadow-amber-500/30 scale-105" 
                          : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Terminal Status</label>
                <div className="grid grid-cols-1 gap-3">
                  {['available', 'occupied', 'reserved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditTable({ ...editTable, status: status as any })}
                      className={cn(
                        "h-16 px-8 rounded-[20px] font-black text-sm italic transition-all duration-500 border flex items-center justify-between uppercase tracking-widest",
                        editTable.status === status 
                          ? (
                              status === 'available' ? "bg-emerald-500 border-emerald-400 text-black" :
                              status === 'occupied' ? "bg-amber-500 border-amber-400 text-black" :
                              "bg-rose-500 border-rose-400 text-black"
                            )
                          : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <span>{status}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        editTable.status === status ? "bg-black" : (
                          status === 'available' ? "bg-emerald-500" :
                          status === 'occupied' ? "bg-amber-500" :
                          "bg-rose-500"
                        )
                      )} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-12 border-t border-white/10">
              <Button 
                className="w-full h-20 rounded-[24px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] border-none uppercase italic tracking-tighter shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                onClick={handleEditTable}
                disabled={isSubmitting || !editTable.table_number}
              >
                {isSubmitting ? 'UPDATING...' : 'SAVE MODIFICATIONS'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* QR Code Sheet */}
      <Sheet open={isQRSheetOpen} onOpenChange={setIsQRSheetOpen}>
        <SheetContent side="right" className="bg-[#020202] border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-12 space-y-6">
              <SheetTitle className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">QR <span className="text-amber-500">Engine</span></SheetTitle>
              <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">Generate secure ordering access for Table {selectedTable?.table_number}.</SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 p-12 flex flex-col items-center justify-center space-y-12 overflow-y-auto">
              <div className="p-16 bg-white rounded-[64px] shadow-2xl shadow-amber-500/10 flex flex-col items-center relative overflow-hidden group">
                <div className="mb-10 text-center relative z-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40 mb-3 italic">SCAN TO ACCESS MENU</div>
                  <div className="text-5xl font-black text-black tracking-tighter italic leading-none">TABLE {selectedTable?.table_number}</div>
                </div>
                
                <div className="p-6 bg-white rounded-[40px] relative z-10 border-[8px] border-black">
                  {selectedTable && (
                    <QRCodeSVG 
                      id={`qr-table-${selectedTable.table_number}`}
                      value={`${window.location.origin}/menu/demo?table=${selectedTable.table_number}`}
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                  )}
                </div>
                
                <div className="mt-12 flex items-center space-x-4 relative z-10 px-8 py-3 rounded-full bg-black">
                  <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                  <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white italic">HEADLESS RESTO OS</div>
                </div>
              </div>

              <div className="grid grid-cols-1 w-full gap-4">
                <Button 
                  className="w-full h-20 rounded-[28px] bg-amber-500 hover:bg-amber-400 text-black font-black text-lg flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] border-none uppercase italic tracking-tighter shadow-2xl shadow-amber-500/20"
                  onClick={() => selectedTable && downloadQRCode(selectedTable.table_number)}
                >
                  <Download className="w-7 h-7 stroke-[3]" />
                  Download Assets
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-20 rounded-[28px] border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase italic tracking-widest text-xs transition-all"
                  onClick={() => window.print()}
                >
                  Print Terminal Label
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
