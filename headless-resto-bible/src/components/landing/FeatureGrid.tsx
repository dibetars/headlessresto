import React from 'react';

const FeatureGrid = () => {
  const benefits = [
    {
      title: 'Save time on managing the restaurant and staff.',
      icon: '⏰',
      accent: 'brand-blue',
    },
    {
      title: 'Speed up guest service and reduce order errors.',
      icon: '⚡',
      accent: 'brand-orange',
    },
    {
      title: 'Gain complete control over revenues, expenses, and inventory.',
      icon: '📊',
      accent: 'brand-blue',
    },
    {
      title: 'Reduce risks of data loss, theft, and fraud.',
      icon: '🛡️',
      accent: 'brand-orange',
    },
    {
      title: 'Simplify team interactions through automation.',
      icon: '🤝',
      accent: 'brand-blue',
    },
    {
      title: 'Increase guest loyalty through convenient service.',
      icon: '❤️',
      accent: 'brand-orange',
    },
  ];

  return (
    <section className="py-32 bg-slate-900 relative overflow-hidden">
      {/* Background Abstract Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-orange/20 via-transparent to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mb-20">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em] mb-4">Results</p>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic uppercase leading-tight">
            Automation that helps effectively <br />
            <span className="text-brand-orange">manage restaurant operations</span>
          </h2>
          <p className="mt-6 text-xl text-slate-400 font-medium">By implementing HeadlessResto, you:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <div 
              key={i} 
              className="group relative p-10 rounded-[48px] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
            >
              {/* Glassmorphism Gradient Accent */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-${benefit.accent}`}></div>
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black text-white leading-tight group-hover:text-brand-orange transition-colors">
                  {benefit.title}
                </h3>
              </div>
              
              {/* Counter decoration */}
              <span className="absolute bottom-8 right-10 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
