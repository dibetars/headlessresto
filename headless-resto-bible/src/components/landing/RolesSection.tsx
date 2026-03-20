import React from 'react';

const roles = [
  {
    title: 'Restaurant Owners',
    description: 'Get a 360-degree view of your business, from sales and inventory to staff performance. Make data-driven decisions to increase profitability.',
  },
  {
    title: 'Managers',
    description: 'Streamline daily operations, manage staff, and ensure a smooth service. Spend less time on admin and more time with your customers.',
  },
  {
    title: 'Chefs & Kitchen Staff',
    description: 'Improve order accuracy and reduce ticket times with our KDS. Focus on what you do best: creating amazing food.',
  },
  {
    title: 'Waitstaff & Bartenders',
    description: 'Turn tables faster and provide better service with our intuitive POS and QR ordering. More happy customers, more tips.',
  },
  {
    title: 'Super Admin',
    description: 'Full system access to manage all aspects of the restaurant, including staff roles, system configurations, and platform-wide settings.',
  },
];

const RolesSection = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <p className="text-xs font-black text-brand-orange uppercase tracking-[0.3em]">Built for you</p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">
            Designed for <span className="text-brand-blue">Every Role</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <div key={index} className="group p-10 rounded-[48px] bg-slate-50 border border-slate-100 hover:bg-white hover:border-brand-blue/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                  {['👑', '👔', '👨‍🍳', '🍹', '⚙️'][index % 5]}
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic group-hover:text-brand-blue transition-colors">{role.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-[100px] -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[120px] translate-x-1/2"></div>
    </section>
  );
};

export default RolesSection;
