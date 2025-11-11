"use client";

import { useEffect, useRef } from "react";

const LineMovementChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 6; i++) {
      const y = (height / 6) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    for (let i = 0; i <= 12; i++) {
      const x = (width / 12) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Generate sample data for multiple sources
    const generateLine = (baseValue: number, volatility: number) => {
      const points = [];
      let value = baseValue;
      for (let i = 0; i <= 72; i++) {
        value += (Math.random() - 0.5) * volatility;
        value = Math.max(1.5, Math.min(3.5, value));
        points.push(value);
      }
      return points;
    };

    const sources = [
      { data: generateLine(2.1, 0.08), color: "#9ca3af", width: 1.5, label: "Source A" },
      { data: generateLine(2.15, 0.06), color: "#a5b4c3", width: 1.5, label: "Source B" },
      { data: generateLine(2.08, 0.1), color: "#b0c4d6", width: 1.5, label: "Source C" },
      { data: generateLine(2.12, 0.05), color: "#00ff88", width: 2.5, label: "Aggregated" },
    ];

    // Draw lines with glow effects
    sources.forEach((source) => {
      ctx.beginPath();
      
      source.data.forEach((value, index) => {
        const x = (width / (source.data.length - 1)) * index;
        const y = height - ((value - 1.5) / 2.0) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      // For aggregated line, create dramatic "lightning bolt" effect with intense glow
      if (source.label === "Aggregated") {
        // Rebuild path for each layer
        const rebuildPath = () => {
          ctx.beginPath();
          source.data.forEach((value, index) => {
            const x = (width / (source.data.length - 1)) * index;
            const y = height - ((value - 1.5) / 2.0) * height;
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
        };

        // Layer 1: Massive outer glow (very wide, very blurred)
        rebuildPath();
        ctx.strokeStyle = source.color;
        ctx.lineWidth = source.width + 16;
        ctx.shadowBlur = 40;
        ctx.shadowColor = source.color;
        ctx.globalAlpha = 0.15;
        ctx.stroke();
        
        // Layer 2: Large outer glow
        rebuildPath();
        ctx.lineWidth = source.width + 12;
        ctx.shadowBlur = 30;
        ctx.globalAlpha = 0.25;
        ctx.stroke();
        
        // Layer 3: Medium outer glow
        rebuildPath();
        ctx.lineWidth = source.width + 8;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        
        // Layer 4: Medium glow
        rebuildPath();
        ctx.lineWidth = source.width + 6;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.45;
        ctx.stroke();
        
        // Layer 5: Inner glow
        rebuildPath();
        ctx.lineWidth = source.width + 4;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        
        // Layer 6: Close glow
        rebuildPath();
        ctx.lineWidth = source.width + 2;
        ctx.shadowBlur = 6;
        ctx.globalAlpha = 0.75;
        ctx.stroke();
        
        // Layer 7: Tight glow
        rebuildPath();
        ctx.lineWidth = source.width + 1;
        ctx.shadowBlur = 3;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
        
        // Main line (sharp, bright)
        rebuildPath();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.lineWidth = source.width;
        ctx.strokeStyle = "#00ff88";
        ctx.stroke();
        
        // Reset
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else {
        // For source lines, add subtle glow
        ctx.strokeStyle = source.color;
        ctx.lineWidth = source.width + 1;
        ctx.shadowBlur = 4;
        ctx.shadowColor = source.color;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        
        // Main line
        ctx.lineWidth = source.width;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    });

    // Value range indicator
    ctx.fillStyle = "rgba(0, 255, 136, 0.1)";
    const rangeTop = height - ((2.2 - 1.5) / 2.0) * height;
    const rangeBottom = height - ((2.0 - 1.5) / 2.0) * height;
    ctx.fillRect(0, rangeTop, width, rangeBottom - rangeTop);

  }, []);

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">Line Movement Graph</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Multi-source tracking - last 6 hours</p>
        </div>
        <div className="flex gap-3 text-xs">
          {["Source A", "Source B", "Source C", "Aggregated"].map((source, i) => (
            <div key={source} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-0.5" 
                style={{ 
                  backgroundColor: i === 3 ? "#00ff88" : ["#9ca3af", "#a5b4c3", "#b0c4d6"][i],
                  height: i === 3 ? "2px" : "1.5px"
                }}
              />
              <span className={i === 3 ? "text-signal font-medium" : "text-muted-foreground"}>
                {source}
              </span>
            </div>
          ))}
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={240}
        className="w-full"
        style={{ height: "240px" }}
      />

      <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
        <span>6h ago</span>
        <span>3h ago</span>
        <span>Now</span>
      </div>
    </div>
  );
};

export default LineMovementChart;
