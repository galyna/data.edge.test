import { useEffect, useRef } from "react";

interface DataPoint {
  time: string;
  bookmaker1: number;
  bookmaker2: number;
  bookmaker3: number;
}

const OddsChart = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Generate sample data
    const data: DataPoint[] = [];
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      data.push({
        time: new Date(now - i * 60000).toLocaleTimeString(),
        bookmaker1: 1.85 + Math.random() * 0.1,
        bookmaker2: 1.88 + Math.random() * 0.1,
        bookmaker3: 1.82 + Math.random() * 0.1,
      });
    }

    // Clear canvas
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw lines
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const xStep = chartWidth / (data.length - 1);

    const drawLine = (values: number[], color: string, glow: boolean = false) => {
      const minVal = 1.7;
      const maxVal = 2.1;
      const range = maxVal - minVal;

      ctx.beginPath();
      data.forEach((point, i) => {
        const x = padding + i * xStep;
        const normalizedValue = (values[i] - minVal) / range;
        const y = height - padding - normalizedValue * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
    };

    // Draw multiple bookmaker lines
    drawLine(data.map(d => d.bookmaker1), "#39FF14", true);
    drawLine(data.map(d => d.bookmaker2), "#00FFFF", false);
    drawLine(data.map(d => d.bookmaker3), "#FF00FF", false);

    // Draw labels
    ctx.fillStyle = "#666";
    ctx.font = "10px monospace";
    ctx.fillText("1.70", 5, height - padding + 15);
    ctx.fillText("2.10", 5, padding);

  }, []);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card/80 backdrop-blur border border-border rounded-lg p-3 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-primary glow-primary"></div>
          <span>Bookmaker A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-cyan-400"></div>
          <span>Bookmaker B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-fuchsia-400"></div>
          <span>Bookmaker C</span>
        </div>
      </div>
    </div>
  );
};

export default OddsChart;
