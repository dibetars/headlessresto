'use client';

import { deleteStaff } from '@/actions/staff';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  is_approved: boolean;
}

interface StaffListProps {
  staff: Staff[];
}

import { approveStaff } from '@/actions/staff';

export default function StaffList({ staff }: StaffListProps) {
  const roleLabels: Record<string, string> = {
    owner: 'Restaurant Owner',
    manager: 'Manager',
    chef: 'Chef & Kitchen Staff',
    waitstaff: 'Waitstaff & Bartenders',
    super_admin: 'Super Admin',
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Staff Members</h2>
      <ul className="mt-4 space-y-4">
        {staff.map((member) => (
          <li key={member.id} className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="font-bold">{member.name} {!member.is_approved && <span className="ml-2 text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full">Pending Approval</span>}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
              <p className="text-sm text-gray-500">{roleLabels[member.role] || member.role}</p>
            </div>
            <div className="flex space-x-2">
              {!member.is_approved && (
                <button
                  onClick={() => approveStaff(member.id)}
                  className="px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Approve
                </button>
              )}
              <button
                onClick={() => deleteStaff(member.id)}
                className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
