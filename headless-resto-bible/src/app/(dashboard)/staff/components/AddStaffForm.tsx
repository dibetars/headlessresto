'use client';

import { addStaff } from '@/actions/staff';
import { useFormState, useFormStatus } from 'react-dom';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center space-x-3 ${
        pending 
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
          : 'bg-brand-orange text-white hover:bg-brand-orange-light hover:scale-[1.02] active:scale-95 shadow-brand-orange/20'
      }`}
    >
      {pending ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Adding...</span>
        </span>
      ) : (
        <>
          <span>Add Staff Member</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
        </>
      )}
    </button>
  );
}

export default function AddStaffForm() {
  const [state, formAction] = useFormState(addStaff, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    if (name.trim().length < 2) {
      alert('Please enter a valid name.');
      e.preventDefault();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      e.preventDefault();
      return;
    }
  };

  const inputClasses = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all font-medium";
  const labelClasses = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 block";

  return (
    <form action={formAction} onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 max-w-2xl mx-auto mt-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">Add New <span className="text-brand-orange">Staff</span></h2>
        <p className="text-slate-500 text-sm font-medium">Invite a new member to your restaurant team.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className={labelClasses}>Full Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            placeholder="John Doe"
            required 
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className={labelClasses}>Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="john@example.com"
            required 
            className={inputClasses} 
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="role" className={labelClasses}>Role</label>
          <select
            id="role"
            name="role"
            required
            className={inputClasses}
          >
            <option value="owner">Restaurant Owner</option>
            <option value="manager">Manager</option>
            <option value="chef">Chef & Kitchen Staff</option>
            <option value="waitstaff">Waitstaff & Bartenders</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton />
      </div>

      {state?.message && (
        <p className={`text-center text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-500 ${
          state.message.includes('Success') ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
