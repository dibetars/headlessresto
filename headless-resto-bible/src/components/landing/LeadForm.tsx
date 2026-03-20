'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitLead } from '@/actions/leads';

interface LeadFormProps {
  type: 'consultation' | 'contact';
  className?: string;
  buttonText?: string;
  showSubject?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showMessage?: boolean;
  variant?: 'dark' | 'light';
}

function SubmitButton({ text, variant }: { text: string; variant: 'dark' | 'light' }) {
  const { pending } = useFormStatus();
  
  const baseClasses = "w-full py-6 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center space-x-3";
  const activeClasses = "hover:scale-[1.02] active:scale-95";
  const variantClasses = variant === 'dark' 
    ? "bg-brand-orange text-white shadow-brand-orange/40" 
    : "bg-gradient-to-r from-brand-orange to-brand-orange-light text-white shadow-brand-orange/40";

  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`${baseClasses} ${!pending ? activeClasses : 'opacity-70 cursor-not-allowed'} ${variantClasses}`}
    >
      <span>{pending ? 'Submitting...' : text}</span>
      {!pending && (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
        </svg>
      )}
    </button>
  );
}

const initialState = {
  message: '',
};

export default function LeadForm({ 
  type, 
  className = '', 
  buttonText = 'Submit',
  showSubject = false,
  showEmail = true,
  showPhone = false,
  showMessage = true,
  variant = 'light'
}: LeadFormProps) {
  const [state, formAction] = useFormState(submitLead, initialState);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (state?.message?.includes('Success')) {
      setIsSuccess(true);
      const timer = setTimeout(() => setIsSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const labelClasses = variant === 'dark' 
    ? "text-[10px] font-black text-white/40 uppercase tracking-widest ml-4"
    : "text-[10px] font-black text-white/60 uppercase tracking-widest ml-4";
  
  const inputClasses = variant === 'dark'
    ? "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all"
    : "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-brand-orange/50 outline-none transition-all";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    if (showEmail && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      e.preventDefault();
      return;
    }

    if (showPhone && phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
      alert('Please enter a valid phone number.');
      e.preventDefault();
      return;
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <input type="hidden" name="type" value={type} />
      
      <div className={`grid grid-cols-1 ${showEmail && type === 'contact' ? 'md:grid-cols-2' : ''} gap-6`}>
        <div className="space-y-2 text-left">
          <label className={labelClasses}>Your Name</label>
          <input 
            required
            name="name"
            type="text" 
            placeholder="John Doe"
            className={inputClasses}
          />
        </div>
        
        {showEmail && (
          <div className="space-y-2 text-left">
            <label className={labelClasses}>Email Address</label>
            <input 
              required={type === 'contact'}
              name="email"
              type="email" 
              placeholder="john@example.com"
              className={inputClasses}
            />
          </div>
        )}

        {showPhone && (
          <div className="space-y-2 text-left">
            <label className={labelClasses}>Phone / WhatsApp / Telegram</label>
            <input 
              required={type === 'consultation'}
              name="phone"
              type="text" 
              placeholder="+1 (555) 000-0000"
              className={inputClasses}
            />
          </div>
        )}
      </div>

      {showSubject && (
        <div className="space-y-2 text-left">
          <label className={labelClasses}>Subject</label>
          <select name="subject" className={`${inputClasses} appearance-none`}>
            <option className="bg-slate-900" value="General Inquiry">General Inquiry</option>
            <option className="bg-slate-900" value="Request a Demo">Request a Demo</option>
            <option className="bg-slate-900" value="Technical Support">Technical Support</option>
            <option className="bg-slate-900" value="Partnership">Partnership</option>
          </select>
        </div>
      )}

      {showMessage && (
        <div className="space-y-2 text-left">
          <label className={labelClasses}>Your Message</label>
          <textarea 
            name="message"
            rows={4} 
            placeholder="How can we help you?" 
            className={`${inputClasses} resize-none`}
          ></textarea>
        </div>
      )}

      {type === 'consultation' && (
        <div className="flex items-center space-x-3 text-left">
          <input required type="checkbox" className="w-5 h-5 rounded border-white/20 bg-white/5 text-brand-orange focus:ring-brand-orange/50" id="consent" />
          <label htmlFor="consent" className="text-xs text-white/60 leading-relaxed">
            By clicking the button, you consent to the privacy policy.
          </label>
        </div>
      )}

      <div className="space-y-4">
        <SubmitButton text={buttonText} variant={variant} />
        
        {state?.message && (
          <p className={`text-center text-sm font-bold ${isSuccess ? 'text-green-400' : 'text-rose-400'} animate-in fade-in zoom-in duration-300`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
