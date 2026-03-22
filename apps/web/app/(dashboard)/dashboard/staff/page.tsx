'use client'

import React, { useState, useEffect } from 'react'
import { getStaffMembers, updateStaffRoleAction, removeStaffMemberAction } from '@/app/auth/actions'
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  Search,
  Trash2,
  Edit2,
  ShieldCheck,
  UserCheck
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
  SheetDescription
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface Staff {
  id: string
  user_id: string
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
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [editRole, setEditRole] = useState('')

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      setLoading(true)
      const data = await getStaffMembers()
      setStaff(data)
    } catch (error: any) {
      console.error('Error fetching staff:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStaff = async () => {
    try {
      if (!selectedStaff || !editRole) return
      setIsSubmitting(true)
      await updateStaffRoleAction(selectedStaff.id, editRole)
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
    if (!confirm('Remove this team member?')) return
    try {
      setIsSubmitting(true)
      await removeStaffMemberAction(id)
      setStaff(prev => prev.filter(s => s.id !== id))
    } catch (error: any) {
      alert('Error removing staff: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roles = ['waiter', 'kitchen', 'cashier', 'manager', 'admin']

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Team Members</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage restaurant personnel, roles, and access permissions.</p>
        </div>
        <Button
          onClick={() => alert('To add a team member, have them sign up and join your organization.')}
          className="h-11 px-6 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold flex items-center gap-2 shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-orange" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{staff.length}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{staff.length}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Active Access</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">
                  {staff.filter(s => s.role === 'admin' || s.role === 'owner').length}
                </div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">Admin Accounts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
        <CardHeader className="p-6 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-gray-200 rounded-xl text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</TableHead>
                <TableHead className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 text-center text-gray-400 text-sm animate-pulse">
                    Loading team…
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 text-center text-gray-400 text-sm">
                    No team members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((member) => (
                  <TableRow key={member.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-2xl flex items-center justify-center font-black text-brand-orange text-base shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-none">{member.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge className="bg-gray-100 text-gray-600 font-semibold border-none uppercase tracking-wider text-[10px] py-1 px-3 rounded-lg">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedStaff(member)
                            setEditRole(member.role)
                            setIsEditSheetOpen(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-xl border-gray-200 hover:bg-gray-100"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteStaff(member.id)}
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                          className="h-8 w-8 p-0 rounded-xl border-gray-200 hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-500" />
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

      {/* Edit Role Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <div className="h-full flex flex-col">
            <SheetHeader className="pb-6">
              <SheetTitle className="text-2xl font-black tracking-tight">Edit Role</SheetTitle>
              <SheetDescription>
                Change the operational role for {selectedStaff?.name}.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => setEditRole(role)}
                      className={cn(
                        'h-14 rounded-2xl flex items-center justify-center border transition-all duration-200',
                        editRole === role
                          ? 'bg-brand-orange border-brand-orange text-white shadow-[0_4px_12px_rgba(245,124,0,0.25)]'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span className="font-bold uppercase tracking-wider text-xs">{role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button
                className="w-full h-11 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold shadow-[0_4px_12px_rgba(245,124,0,0.25)] border-none"
                onClick={handleEditStaff}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
