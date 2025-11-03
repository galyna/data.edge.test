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
      { data: generateLine(2.1, 0.08), color: "#4a5568", width: 1.5, label: "Source A" },
      { data: generateLine(2.15, 0.06), color: "#5a6c7d", width: 1.5, label: "Source B" },
      { data: generateLine(2.08, 0.1), color: "#6b7b8c", width: 1.5, label: "Source C" },
      { data: generateLine(2.12, 0.05), color: "#00ff88", width: 2.5, label: "Aggregated" },
    ];

    // Draw lines
    sources.forEach((source) => {
      ctx.strokeStyle = source.color;
      ctx.lineWidth = source.width;
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
      
      ctx.stroke();

      // Add glow to aggregated line
      if (source.label === "Aggregated") {
        ctx.shadowBlur = 8;
        ctx.shadowColor = source.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
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
                  backgroundColor: i === 3 ? "#00ff88" : ["#4a5568", "#5a6c7d", "#6b7b8c"][i],
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
