import React, { useMemo } from 'react';

// React.memo berfungsi sebagai "tameng" agar background tidak ikut ter-refresh 
// saat kamu mengetik keyboard atau angka di Dashboard sedang berjalan
const BackgroundOrbs = React.memo(() => {
  
  // useMemo mengunci hasil acak (random) agar posisinya permanen
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      baseOpacity: 0.2 + Math.random() * 0.4,
      animDuration: `${3 + Math.random() * 4}s`,
      animDelay: `${Math.random() * 5}s`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      
      {/* Menambahkan deklarasi keyframes langsung agar animasinya smooth tanpa putus */}
      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(20px, -20px); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-20px, 20px); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(15px, 15px); }
          }
          @keyframes particleFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
        `}
      </style>

      {/* Main gradient bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a2e] to-[#0f0520]" />

      {/* Animated orbs */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
          animation: 'float1 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          bottom: '-10%',
          left: '-5%',
          animation: 'float2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[350px] h-[350px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)',
          top: '40%',
          left: '30%',
          animation: 'float3 18s ease-in-out infinite',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Particle dots */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400"
          style={{
            top: p.top,
            left: p.left,
            opacity: p.baseOpacity,
            animation: `particleFloat ${p.animDuration} ease-in-out infinite`,
            animationDelay: p.animDelay,
          }}
        />
      ))}
    </div>
  );
});

export default BackgroundOrbs;