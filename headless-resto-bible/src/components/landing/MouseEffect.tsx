'use client';

import React, { useEffect, useState } from 'react';

const MouseEffect = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number, y: number, id: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      const newId = Date.now();
      setTrail((prev) => [...prev, { x: e.clientX, y: e.clientY, id: newId }].slice(-15));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      {/* Main Cursor */}
      <div 
        className="fixed w-8 h-8 bg-brand-orange/30 rounded-full blur-xl transition-transform duration-75 ease-out"
        style={{ 
          left: mousePos.x - 16, 
          top: mousePos.y - 16,
          transform: 'scale(1.5)'
        }}
      />
      
      {/* Trail elements */}
      {trail.map((point, index) => (
        <div
          key={point.id}
          className="fixed w-2 h-2 rounded-full"
          style={{
            left: point.x - 4,
            top: point.y - 4,
            backgroundColor: index % 2 === 0 ? 'var(--brand-orange)' : 'var(--brand-blue)',
            opacity: (index / trail.length) * 0.5,
            transform: `scale(${index / trail.length})`,
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
            background: index % 2 === 0 ? '#FF6B00' : '#0047AB'
          }}
        />
      ))}

      {/* Glow effect */}
      <div 
        className="fixed w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[120px]"
        style={{ 
          left: mousePos.x - 300, 
          top: mousePos.y - 300,
        }}
      />
    </div>
  );
};

export default MouseEffect;
