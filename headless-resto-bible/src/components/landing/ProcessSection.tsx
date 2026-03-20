'use client';

import React from 'react';

const ProcessSection = () => {
  const steps = [
    {
      id: 1,
      title: 'Consultation',
      description: 'You submit a request, and our manager contacts you to discuss the restaurant\'s needs and select the appropriate system features.',
    },
    {
      id: 2,
      title: 'Contract',
      description: 'We outline all necessary terms of cooperation, rights, and obligations of the parties.',
    },
    {
      id: 3,
      title: 'Setup',
      description: 'We gather information: menu, inventory, staff. We organize a photo shoot of the interior and dishes. We input all necessary data into the software, create the room structure, and set up access rights for employees.',
    },
    {
      id: 4,
      title: 'Training',
      description: 'We show how to use the system: from adding orders to generating reports. We answer questions, provide instructions, and recommendations.',
    },
    {
      id: 5,
      title: 'Launch',
      description: 'We check that everything works correctly, launch the system in your restaurant in demo mode for 14 days, and provide support.',
    },
  ];

  return (
    <section className="py-32 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em]">How to get started</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Clear steps towards <br />
            <span className="text-brand-blue">automating your restaurant</span>
          </h2>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.id} className="group">
                <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black mb-6 group-hover:bg-brand-orange transition-colors duration-500">
                    {step.id}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex justify-center">
          <button className="px-12 py-6 bg-slate-900 text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-brand-blue hover:scale-105 transition-all">
            Try for 14 days free
          </button>
        </div>
      </div>

      {/* Background Decorative Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
        <span className="text-[300px] font-black tracking-tighter italic uppercase">HeadlessResto</span>
      </div>
    </section>
  );
};

export default ProcessSection;
