'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Calendar, 
  MoreVertical,
  Search,
  CheckCircle2,
  Filter,
  Trash2,
  Edit2,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Briefcase
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

interface Staff {
  id: string
  name: string
  email: string
  role: string
  is_approved: boolean
  created_at: string
}

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'waiter'
  })

  const [editMember, setEditMember] = useState({
    name: '',
    role: ''
  })

  const supabase = createClient()

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStaff(data || [])
    } catch (error: any) {
      console.error('Error fetching staff:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInviteStaff = async () => {
    try {
      if (!newMember.name || !newMember.email) return
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('staff')
        .insert([{
          ...newMember,
          is_approved: false
        }])

      if (error) throw error
      
      setIsAddSheetOpen(false)
      setNewMember({ name: '', email: '', role: 'waiter' })
      fetchStaff()
    } catch (error: any) {
      alert('Error inviting staff: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStaff = async () => {
    try {
      if (!selectedStaff || !editMember.name) return
      setIsSubmitting(true)
      
      const { error } = await supabase
        .from('staff')
        .update({
          name: editMember.name,
          role: editMember.role
        })
        .eq('id', selectedStaff.id)

      if (error) throw error
      
      setIsEditSheetOpen(false)
      setSelectedStaff(null)
      fetchStaff()
    } catch (error: any) {
      alert('Error updating staff: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return
    
    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchStaff()
    } catch (error: any) {
      alert('Error deleting staff: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApproveStaff = async (id: string) => {
    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('staff')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) throw error
      fetchStaff()
    } catch (error: any) {
      alert('Error approving staff: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roles = ['waiter', 'chef', 'cashier', 'manager', 'admin']

  return (
    <div className="space-y-10 pb-16 min-h-screen bg-[#020202] text-white p-6 md:p-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">Team Control</h1>
          <p className="text-white/40 font-bold mt-4 uppercase tracking-[0.2em] text-[10px] max-w-md">Manage your restaurant personnel, roles, and access permissions in a unified interface.</p>
        </div>
        <Button 
          onClick={() => setIsAddSheetOpen(true)}
          className="h-20 px-12 rounded-[32px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 border-none uppercase italic tracking-tighter"
        >
          <UserPlus className="w-7 h-7 stroke-[3]" />
          Add Member
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-7 h-7" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">TEAM</Badge>
            </div>
            <div className="text-6xl font-black text-white italic tracking-tighter">{staff.length}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Total members</div>
          </CardContent>
        </Card>

        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                <UserCheck className="w-7 h-7" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">ACTIVE</Badge>
            </div>
            <div className="text-6xl font-black text-white italic tracking-tighter">{staff.filter(s => s.is_approved).length}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Approved access</div>
          </CardContent>
        </Card>

        <Card className="glass-morphism-dark border-white/[0.08] rounded-[40px] p-2 group hover:bg-white/[0.05] transition-all duration-500">
          <CardContent className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <Badge className="bg-brand-orange/10 text-brand-orange font-black border-none uppercase tracking-widest text-[10px] py-1.5 px-3">PRIVILEGED</Badge>
            </div>
            <div className="text-6xl font-black text-white italic tracking-tighter">{staff.filter(s => s.role.includes('admin') || s.role === 'owner').length}</div>
            <div className="text-[10px] font-black text-white/30 mt-3 uppercase tracking-[0.2em]">Admin accounts</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="glass-morphism-dark border-white/[0.05] rounded-[48px] overflow-hidden">
        <CardHeader className="p-10 border-b border-white/[0.05]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="relative flex-1 max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-amber-500 transition-colors" />
              <Input 
                placeholder="Search by name, email or role..." 
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/[0.05] hover:bg-transparent">
                <TableHead className="py-8 px-12 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Team Member</TableHead>
                <TableHead className="py-8 px-12 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Role</TableHead>
                <TableHead className="py-8 px-12 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Status</TableHead>
                <TableHead className="py-8 px-12 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">Joined</TableHead>
                <TableHead className="py-8 px-12 text-[10px] font-black text-white/30 uppercase tracking-[0.25em] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center text-white/20 font-black uppercase tracking-widest text-xs italic animate-pulse">
                    Synchronizing team data...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-32 text-center text-white/20 font-black uppercase tracking-widest text-xs italic">
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id} className="group border-b border-white/[0.03] hover:bg-white/[0.03] transition-all duration-500">
                    <TableCell className="py-10 px-12">
                      <div className="flex items-center gap-8">
                        <div className="w-20 h-20 bg-white/[0.03] rounded-[32px] flex items-center justify-center font-black text-white/10 text-3xl italic border border-white/[0.05] group-hover:scale-110 group-hover:text-amber-500 transition-all duration-700 shadow-inner">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-white text-2xl italic tracking-tighter leading-none group-hover:text-amber-500 transition-colors mb-2">{member.name}</div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                            <Mail className="w-3.5 h-3.5" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-10 px-12">
                      <Badge className="bg-white/5 text-white/40 font-black border-none uppercase tracking-widest text-[9px] py-2 px-4 italic rounded-lg">
                        {member.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-10 px-12">
                      {member.is_approved ? (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Active Access</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Pending Approval</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-10 px-12">
                      <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="py-10 px-12 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {!member.is_approved && (
                          <Button 
                            onClick={() => handleApproveStaff(member.id)}
                            disabled={isSubmitting}
                            className="h-14 px-6 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black font-black uppercase italic tracking-widest text-[10px] transition-all border border-emerald-500/20"
                          >
                            Approve
                          </Button>
                        )}
                        <Button 
                          onClick={() => {
                            setSelectedStaff(member)
                            setEditMember({ name: member.name, role: member.role })
                            setIsEditSheetOpen(true)
                          }}
                          variant="outline" 
                          className="h-14 w-14 rounded-2xl border-white/[0.08] bg-white/[0.03] hover:bg-white/10 transition-all group/btn"
                        >
                          <Edit2 className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                        </Button>
                        <Button 
                          onClick={() => handleDeleteStaff(member.id)}
                          variant="outline" 
                          className="h-14 w-14 rounded-2xl border-white/[0.08] bg-white/[0.03] hover:bg-white/10 transition-all group/btn"
                        >
                          <Trash2 className="w-5 h-5 text-white group-hover/btn:scale-110 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Member Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="bg-[#020202] border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-12 space-y-6">
              <SheetTitle className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Edit <span className="text-amber-500">Member</span></SheetTitle>
              <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                Modify team member details and adjust operational access.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 p-12 space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Full Name</label>
                <Input 
                  placeholder="e.g. JOHN DOE" 
                  className="h-20 bg-white/[0.03] border-white/[0.08] rounded-[24px] font-black text-2xl tracking-tighter text-white placeholder:text-white/10 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all px-8 italic" 
                  value={editMember.name}
                  onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Operational Role</label>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setEditMember({ ...editMember, role })}
                      className={cn(
                        "h-20 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-500 group",
                        editMember.role === role 
                          ? "bg-amber-500 border-amber-400 text-black shadow-[0_10px_30px_rgba(245,158,11,0.3)] scale-[1.02]" 
                          : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <div className="font-black uppercase tracking-widest text-[10px] italic">{role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-12 border-t border-white/10">
              <Button 
                className="w-full h-20 rounded-[24px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] border-none uppercase italic tracking-tighter shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                onClick={handleEditStaff}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Member Sheet */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent side="right" className="bg-[#020202] border-l border-white/10 text-white w-full sm:max-w-md p-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <SheetHeader className="p-12 space-y-6">
              <SheetTitle className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">Add <span className="text-amber-500">Member</span></SheetTitle>
              <SheetDescription className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] italic">
                Send an invitation to join your restaurant team and assign initial access privileges.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 p-12 space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Full Name</label>
                <Input 
                  placeholder="e.g. JOHN DOE" 
                  className="h-20 bg-white/[0.03] border-white/[0.08] rounded-[24px] font-black text-2xl tracking-tighter text-white placeholder:text-white/10 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all px-8 italic" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Email Address</label>
                <Input 
                  placeholder="e.g. MEMBER@RESTAURANT.COM" 
                  type="email" 
                  className="h-20 bg-white/[0.03] border-white/[0.08] rounded-[24px] font-black text-2xl tracking-tighter text-white placeholder:text-white/10 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all px-8 italic" 
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2 italic">Operational Role</label>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setNewMember({ ...newMember, role })}
                      className={cn(
                        "h-20 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all duration-500 group",
                        newMember.role === role 
                          ? "bg-amber-50 border-amber-400 text-black shadow-[0_10px_30px_rgba(245,158,11,0.3)] scale-[1.02]" 
                          : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <div className="font-black uppercase tracking-widest text-[10px] italic">{role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-12 border-t border-white/10">
              <Button 
                className="w-full h-20 rounded-[24px] bg-amber-500 hover:bg-amber-400 text-black font-black text-xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] border-none uppercase italic tracking-tighter shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                onClick={handleInviteStaff}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SYNCING...' : 'SEND INVITATION'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
