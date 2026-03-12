import { useMemo, useState } from "react";
import { useCarbonPrice } from "../context/CarbonPriceContext";
import "./CarbonCreditChart.css";

// SVG chart dimensions
const CHART_W = 800;
const CHART_H = 280;
const PAD = { top: 20, right: 20, bottom: 40, left: 50 };

function buildSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const cpx = (x0 + x1) / 2;
    d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
  }
  return d;
}

export default function CarbonCreditChart() {
  const {
    selectedRange,
    setSelectedRange,
    priceHistory,
    currentPrice,
    high24h,
    low24h,
    volume,
    ranges,
  } = useCarbonPrice();

  const [hoveredIdx, setHoveredIdx] = useState(null);

  const { linePath, areaPath, points, yLabels, xLabels, gridLines } = useMemo(() => {
    const prices = priceHistory.map((d) => d.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const padding = (maxP - minP) * 0.15 || 10;
    const yMin = minP - padding;
    const yMax = maxP + padding;

    const innerW = CHART_W - PAD.left - PAD.right;
    const innerH = CHART_H - PAD.top - PAD.bottom;

    // Map data to SVG coordinates
    const pts = priceHistory.map((d, i) => {
      const x = PAD.left + (i / (priceHistory.length - 1)) * innerW;
      const y = PAD.top + (1 - (d.price - yMin) / (yMax - yMin)) * innerH;
      return [x, y];
    });

    const line = buildSmoothPath(pts);

    // Area: close the path at the bottom
    const lastPt = pts[pts.length - 1];
    const firstPt = pts[0];
    const area =
      line +
      ` L ${lastPt[0]},${PAD.top + innerH} L ${firstPt[0]},${PAD.top + innerH} Z`;

    // Y-axis labels (4 ticks)
    const yTicks = 4;
    const yLbls = [];
    const grids = [];
    for (let i = 0; i <= yTicks; i++) {
      const val = yMin + (i / yTicks) * (yMax - yMin);
      const y = PAD.top + (1 - i / yTicks) * innerH;
      yLbls.push({ label: `₹${Math.round(val).toLocaleString("en-IN")}`, y });
      grids.push(y);
    }

    // X-axis labels (pick ~5 evenly spaced)
    const xCount = Math.min(5, priceHistory.length);
    const xLbls = [];
    for (let i = 0; i < xCount; i++) {
      const idx = Math.round((i / (xCount - 1)) * (priceHistory.length - 1));
      const x = PAD.left + (idx / (priceHistory.length - 1)) * innerW;
      xLbls.push({ label: priceHistory[idx].date, x });
    }

    return {
      linePath: line,
      areaPath: area,
      points: pts,
      yLabels: yLbls,
      xLabels: xLbls,
      gridLines: grids,
    };
  }, [priceHistory]);

  const lastPoint = points[points.length - 1];
  const innerH = CHART_H - PAD.top - PAD.bottom;

  return (
    <div className="cc-chart-card">
      {/* Header */}
      <div className="cc-chart-header">
        <div>
          <h3 className="cc-chart-title">Credit Price History</h3>
          <p className="cc-chart-subtitle">
            VCS · tCO<sub>2</sub>e per credit
          </p>
        </div>
        <div className="cc-range-toggles">
          {ranges.map((r) => (
            <button
              key={r}
              className={`cc-range-btn ${selectedRange === r ? "active" : ""}`}
              onClick={() => setSelectedRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="cc-chart-svg-wrap">
        <svg
          className="cc-chart-svg"
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="cc-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>

            {/* Subtle glow */}
            <filter id="cc-glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((y, i) => (
            <line
              key={i}
              className="cc-grid-line"
              x1={PAD.left}
              y1={y}
              x2={CHART_W - PAD.right}
              y2={y}
            />
          ))}

          {/* Y-axis labels */}
          {yLabels.map((lbl, i) => (
            <text
              key={i}
              className="cc-y-label"
              x={PAD.left - 8}
              y={lbl.y + 4}
              textAnchor="end"
            >
              {lbl.label}
            </text>
          ))}

          {/* X-axis labels */}
          {xLabels.map((lbl, i) => (
            <text
              key={i}
              className="cc-x-label"
              x={lbl.x}
              y={CHART_H - 8}
              textAnchor="middle"
            >
              {lbl.label}
            </text>
          ))}

          {/* Area fill */}
          <path
            className="cc-chart-area"
            d={areaPath}
            fill="url(#cc-area-grad)"
          />

          {/* Line */}
          <path className="cc-chart-line" d={linePath} filter="url(#cc-glow)" />

          {/* Current price dot (only if not hovering) */}
          {lastPoint && hoveredIdx === null && (
            <g>
              <circle
                className="cc-price-dot-outer"
                cx={lastPoint[0]}
                cy={lastPoint[1]}
                r="8"
              />
              <circle
                className="cc-price-dot-inner"
                cx={lastPoint[0]}
                cy={lastPoint[1]}
                r="4"
              />
            </g>
          )}

          {/* Invisible hover hitbox circles for each data point */}
          {points.map((pt, i) => (
            <circle
              key={i}
              className="cc-hover-dot"
              cx={pt[0]}
              cy={pt[1]}
              r="12"
              onMouseEnter={() => setHoveredIdx(i)}
            />
          ))}

          {/* Hover tooltip */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <g className="cc-tooltip">
              {/* Vertical dashed line */}
              <line
                className="cc-tooltip-line"
                x1={points[hoveredIdx][0]}
                y1={PAD.top}
                x2={points[hoveredIdx][0]}
                y2={PAD.top + innerH}
              />

              {/* Highlighted dot */}
              <circle
                className="cc-tooltip-dot"
                cx={points[hoveredIdx][0]}
                cy={points[hoveredIdx][1]}
                r="5"
              />

              {/* Tooltip box */}
              <g transform={`translate(${
                // Flip tooltip to left if near right edge
                points[hoveredIdx][0] > CHART_W - 120
                  ? points[hoveredIdx][0] - 105
                  : points[hoveredIdx][0] + 10
              }, ${
                // Keep tooltip above point, but not above chart
                Math.max(PAD.top, points[hoveredIdx][1] - 48)
              })`}>
                <rect
                  className="cc-tooltip-bg"
                  x="0"
                  y="0"
                  width="95"
                  height="40"
                />
                <text className="cc-tooltip-price" x="10" y="18">
                  ₹{priceHistory[hoveredIdx].price.toLocaleString("en-IN")}
                </text>
                <text className="cc-tooltip-date" x="10" y="32">
                  {priceHistory[hoveredIdx].date}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Stats Bar */}
      <div className="cc-stats-bar">
        <div className="cc-stat-item">
          <span className="cc-stat-label">Current</span>
          <span className="cc-stat-value current">
            ₹{currentPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="cc-stat-item">
          <span className="cc-stat-label">24h High</span>
          <span className="cc-stat-value high">
            ₹{high24h.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="cc-stat-item">
          <span className="cc-stat-label">24h Low</span>
          <span className="cc-stat-value low">
            ₹{low24h.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="cc-stat-item">
          <span className="cc-stat-label">Volume</span>
          <span className="cc-stat-value volume">
            {volume.toLocaleString()} tCO₂
          </span>
        </div>
      </div>
    </div>
  );
}
