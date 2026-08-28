import React, { useEffect, useState } from 'react';

export default function FlipScoreGauge({ score = 85, verdict = "COMPRALO", size = "normal" }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Color config based on verdict
  let strokeColor = "#10B981"; // Emerald/Lime for CÓMPRALO
  let glowClass = "glow-lime";
  let textColor = "text-emerald-400";
  let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  if (verdict === "NEGOCIA" || (score >= 60 && score < 80)) {
    strokeColor = "#F59E0B";
    glowClass = "glow-amber";
    textColor = "text-amber-400";
    badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  } else if (verdict === "PASA" || score < 60) {
    strokeColor = "#EF4444";
    glowClass = "glow-red";
    textColor = "text-red-400";
    badgeBg = "bg-red-500/10 text-red-400 border-red-500/30";
  }

  const radius = size === "small" ? 36 : 58;
  const strokeWidth = size === "small" ? 7 : 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const svgSize = size === "small" ? 90 : 140;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className={`relative flex items-center justify-center rounded-full p-2 ${glowClass}`}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="#1F2434"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground animated score progress */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Inner Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-black tracking-tight ${size === "small" ? "text-xl" : "text-3xl sm:text-4xl"} ${textColor}`}>
            {animatedScore}
          </span>
          <span className="text-[9px] font-bold tracking-wider uppercase text-gray-400 font-mono">
            /100
          </span>
        </div>
      </div>

      {/* Signature Tag */}
      <div className={`mt-2 flex items-center gap-1 rounded-full px-2.5 py-0.5 border text-[11px] font-bold font-mono ${badgeBg}`}>
        <span>FLIP SCORE™</span>
      </div>
    </div>
  );
}
