import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.8 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2800);

    // Complete after fade animation (3.5 seconds total)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-700 ease-out ${
        fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: `url('https://image.qwenlm.ai/generated-images/3bf3a034-8e26-4477-8cf1-46e2229c7a05/_result.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 via-slate-900/70 to-slate-900/95" />
      
      {/* Animated particles/dots effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-blue-300/20 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400/20 rounded-full animate-ping" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '1.5s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* BWS Logo/Text */}
        <div className="relative mb-6 splash-bws">
          {/* Glow effect behind text */}
          <div className="absolute inset-0 blur-3xl bg-blue-500/20 rounded-full scale-[2]" />
          <div className="absolute inset-0 blur-xl bg-blue-400/10 rounded-full scale-150" />
          
          {/* Main BWS text */}
          <h1 className="relative text-[6rem] sm:text-8xl md:text-9xl font-black tracking-wider leading-none">
            <span className="bg-gradient-to-b from-white via-blue-50 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              BWS
            </span>
          </h1>
          
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400/60" />
            <div className="w-2 h-2 rounded-full bg-blue-400/60" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400/60" />
          </div>
        </div>

        {/* Subtitle */}
        <div className="splash-subtitle text-center">
          <p className="text-xl md:text-2xl font-bold text-white tracking-[0.2em] uppercase">
            Balaji Wash Sand
          </p>
          <p className="text-sm md:text-base text-blue-200/80 mt-2 tracking-wider font-medium">
            Enterprise Resource Planning
          </p>
        </div>

        {/* Loader Section */}
        <div className="flex flex-col items-center mt-10 splash-loader">
          {/* Modern spinning loader */}
          <div className="relative w-14 h-14 mb-5 splash-glow rounded-full">
            {/* Background track */}
            <div className="absolute inset-0 rounded-full border-[3px] border-white/10" />
            {/* Spinning gradient arc */}
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
              style={{
                borderTopColor: '#60a5fa',
                borderRightColor: '#3b82f6',
                animationDuration: '1s',
              }}
            />
            {/* Second counter-rotating arc */}
            <div className="absolute inset-1.5 rounded-full border-2 border-transparent animate-spin"
              style={{
                borderBottomColor: '#93c5fd',
                borderLeftColor: '#60a5fa',
                animationDuration: '1.5s',
                animationDirection: 'reverse',
              }}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50" />
            </div>
          </div>

          {/* Loading text with animated dots */}
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-white/70 font-medium tracking-wide">Initializing System</span>
            <span className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
              style={{
                width: '100%',
                backgroundSize: '200% 100%',
                backgroundImage: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 50%, #3b82f6 100%)',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-white/40 tracking-widest uppercase">
          © 2026 Balaji Wash Sand
        </p>
      </div>
    </div>
  );
}
