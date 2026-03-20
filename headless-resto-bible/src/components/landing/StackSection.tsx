import React from 'react';

const technologies = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'Supabase',
  'PostgreSQL',
  'Vercel',
  'Stripe',
];

const StackSection = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em]">Infrastructure</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">
            Built on a <span className="text-brand-blue">Modern, Scalable Stack</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <div 
              key={index} 
              className="px-10 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-slate-900 hover:text-white hover:-translate-y-2 transition-all duration-500 shadow-xl shadow-slate-200/50"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
      
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </section>
  );
};

export default StackSection;
