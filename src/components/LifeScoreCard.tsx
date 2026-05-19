interface LifeScoreProps {
  score: number;
  label: string;
  explanation: string;
}

export function LifeScoreCard({ score, label, explanation }: LifeScoreProps) {
  // Determine color based on score
  let colorClass = "bg-red-500";
  let textClass = "text-red-400";
  
  if (score >= 90) { 
    colorClass = "bg-cyan-400"; 
    textClass = "text-cyan-400"; 
  } else if (score >= 75) { 
    colorClass = "bg-green-400"; 
    textClass = "text-green-400"; 
  } else if (score >= 55) { 
    colorClass = "bg-yellow-400"; 
    textClass = "text-yellow-400"; 
  } else if (score >= 35) { 
    colorClass = "bg-orange-400"; 
    textClass = "text-orange-400"; 
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden transition-all hover:bg-white/10 mt-1 shadow-lg">
      <div className="flex justify-between items-center z-10">
        <h4 className="text-white/60 uppercase tracking-widest text-xs font-semibold">Life Score</h4>
        <span className={`text-2xl font-bold ${textClass}`}>{score}</span>
      </div>
      
      <div className="z-10">
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-white/50 text-sm leading-snug">{explanation}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-black/40 rounded-full mt-2 overflow-hidden z-10 shadow-inner">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Subtle background glow based on score */}
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 ${colorClass} rounded-full blur-[50px] opacity-10 pointer-events-none`}></div>
    </div>
  );
}
