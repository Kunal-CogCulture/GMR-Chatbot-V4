export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#0f2440] via-[#1A3557] to-[#0f2440] p-8">
      {/* Hero Section */}
      <div className="text-center max-w-2xl flex flex-col items-center">
        {/* Logo Container */}
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-2xl p-4 rotate-1 hover:rotate-0 transition-transform">
          <img 
            src="https://www.gmraerocity.com/wp-content/themes/gmr-aerocity/images/gmr-aerocity.svg" 
            alt="GMR Aerocity" 
            className="w-full h-full object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live — Aero AI Concierge is online
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          GMR Aerocity<br />
          <span className="text-[#C8973A]">Smart Assistant</span>
        </h1>
        <p className="text-white/60 text-lg leading-relaxed mb-8">
          Your AI-powered concierge for India&apos;s premier Global Business District at Indira Gandhi International Airport.
        </p>
        <div className="flex flex-wrap gap-3 justify-center text-sm text-white/50">
          {["🏨 Hotels", "🍽️ Dining", "💼 Offices", "🎉 Events", "🚗 Parking", "✈️ Shuttle"].map(item => (
            <span key={item} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full">{item}</span>
          ))}
        </div>
      </div>

      {/* Arrow pointing to widget */}
      <div className="fixed bottom-24 right-5 flex flex-col items-end gap-1 pointer-events-none">
        <p className="text-white/60 text-xs bg-[#1A3557]/80 px-2 py-1 rounded-lg backdrop-blur-sm">Chat with Aero AI Concierge →</p>
      </div>
    </main>
  );
}
