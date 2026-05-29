export default function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
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
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.4,
            animation: `particleFloat ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
