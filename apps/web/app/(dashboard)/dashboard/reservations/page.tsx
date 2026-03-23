'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Plus,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  CalendarDays
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

interface Reservation {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  reservation_date: string
  reservation_time: string
  number_of_guests: number
  status: string
  created_at: string
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    reservation_time: '',
    number_of_guests: 2,
    status: 'pending'
  })

  const supabase = createClient()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })

      if (error) throw error
      setReservations(data || [])
    } catch (error: any) {
      console.error('Error fetching reservations:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      fetchReservations()
    } catch (error: any) {
      alert('Error updating reservation: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateReservation = async () => {
    try {
      if (!newReservation.customer_name || !newReservation.reservation_date) return
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('reservations')
        .insert([{
          ...newReservation,
          reservation_date: `${newReservation.reservation_date}T${newReservation.reservation_time}:00`
        }])

      if (error) throw error
      
      setIsAddSheetOpen(false)
      setNewReservation({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        reservation_date: '',
        reservation_time: '',
        number_of_guests: 2,
        status: 'pending'
      })
      fetchReservations()
    } catch (error: any) {
      alert('Error creating reservation: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredReservations = reservations.filter(res => 
    res.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.customer_phone.includes(searchQuery)
  )

  const upcomingReservations = reservations.filter(res => res.status === 'confirmed')
  const pendingReservations = reservations.filter(res => res.status === 'pending')

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Reservations</h1>
          <p className="text-slate-500 font-medium mt-1">Manage table bookings and guest requests.</p>
        </div>
        <Button 
          onClick={() => setIsAddSheetOpen(true)}
          className="h-14 px-8 rounded-[20px] font-black text-lg shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Reservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-none shadow-sm rounded-[32px] p-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <CalendarDays className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-black">TOTAL</Badge>
            </div>
            <div className="text-4xl font-black text-slate-900">{reservations.length}</div>
            <div className="text-sm font-bold text-slate-400 mt-1">All-time bookings</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-[32px] p-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-600 font-black">CONFIRMED</Badge>
            </div>
            <div className="text-4xl font-black text-slate-900">{upcomingReservations.length}</div>
            <div className="text-sm font-bold text-slate-400 mt-1">Ready for arrival</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-sm rounded-[32px] p-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-600 font-black">PENDING</Badge>
            </div>
            <div className="text-4xl font-black text-slate-900">{pendingReservations.length}</div>
            <div className="text-sm font-bold text-slate-400 mt-1">Awaiting approval</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-white border-none shadow-sm rounded-[40px] overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search by name, email or phone..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-slate-100 rounded-2xl font-medium focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-14 rounded-2xl border-slate-100 font-bold px-6 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 p-0 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Guest</TableHead>
                  <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</TableHead>
                  <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Guests</TableHead>
                  <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="py-6 px-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold">
                      Loading reservations...
                    </TableCell>
                  </TableRow>
                ) : filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 font-bold">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((res) => (
                    <TableRow key={res.id} className="group border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="py-6 px-8">
                        <div>
                          <div className="font-black text-slate-900">{res.customer_name}</div>
                          <div className="text-sm font-bold text-slate-400 flex flex-col">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {res.customer_email}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {res.customer_phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{new Date(res.reservation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-sm font-bold text-blue-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {res.reservation_time.slice(0, 5)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-black text-slate-900">{res.number_of_guests}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        {res.status === 'confirmed' ? (
                          <Badge className="bg-green-50 text-green-600 font-black border-none py-1 px-3">
                            CONFIRMED
                          </Badge>
                        ) : res.status === 'pending' ? (
                          <Badge className="bg-amber-50 text-amber-600 font-black border-none py-1 px-3">
                            PENDING
                          </Badge>
                        ) : (
                          <Badge className="bg-red-50 text-red-600 font-black border-none py-1 px-3">
                            CANCELLED
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {res.status === 'pending' && (
                            <Button 
                              onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                              disabled={isSubmitting}
                              variant="ghost" 
                              className="w-10 h-10 p-0 rounded-xl hover:bg-green-50 hover:text-green-600"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          {res.status !== 'cancelled' && (
                            <Button 
                              onClick={() => handleUpdateStatus(res.id, 'cancelled')}
                              disabled={isSubmitting}
                              variant="ghost" 
                              className="w-10 h-10 p-0 rounded-xl hover:bg-red-50 hover:text-red-600"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-white hover:shadow-sm">
                            <MoreVertical className="w-5 h-5 text-slate-400" />
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

      {/* Add Reservation Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-2xl font-black">New Reservation</SheetTitle>
            <SheetDescription>Manually add a guest booking to the system.</SheetDescription>
          </SheetHeader>
          <div className="space-y-6 py-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Guest Name</label>
              <Input 
                placeholder="Full name" 
                className="h-14 rounded-2xl border-slate-100" 
                value={newReservation.customer_name}
                onChange={(e) => setNewReservation({ ...newReservation, customer_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                <Input 
                  placeholder="+1..." 
                  className="h-14 rounded-2xl border-slate-100" 
                  value={newReservation.customer_phone}
                  onChange={(e) => setNewReservation({ ...newReservation, customer_phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Guests</label>
                <Input 
                  type="number" 
                  placeholder="2" 
                  className="h-14 rounded-2xl border-slate-100" 
                  value={newReservation.number_of_guests}
                  onChange={(e) => setNewReservation({ ...newReservation, number_of_guests: parseInt(e.target.value) || 2 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
                <Input 
                  type="date" 
                  className="h-14 rounded-2xl border-slate-100" 
                  value={newReservation.reservation_date}
                  onChange={(e) => setNewReservation({ ...newReservation, reservation_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Time</label>
                <Input 
                  type="time" 
                  className="h-14 rounded-2xl border-slate-100" 
                  value={newReservation.reservation_time}
                  onChange={(e) => setNewReservation({ ...newReservation, reservation_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email (Optional)</label>
              <Input 
                type="email" 
                placeholder="guest@example.com" 
                className="h-14 rounded-2xl border-slate-100" 
                value={newReservation.customer_email}
                onChange={(e) => setNewReservation({ ...newReservation, customer_email: e.target.value })}
              />
            </div>
          </div>
          <SheetFooter>
            <Button 
              className="w-full h-16 rounded-2xl font-black text-lg shadow-lg shadow-blue-100"
              onClick={handleCreateReservation}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Confirm Reservation'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
