// frontend/src/components/CanvasUtilizationChart.jsx
import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function CanvasUtilizationChart({ categories = [] }) {
  const canvasRef = useRef(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  // Chart data
  const chartData = categories.length > 0
    ? categories.map(c => ({
        label: c.category_name?.replace(' & Recreation', '').replace(' & Reference', '').replace(' & Photography', '') || 'Category',
        value: Math.min(100, Math.max(20, Math.round(c.utilization_rate || 50))),
        bookings: c.total_bookings || 4
      }))
    : [
        { label: 'Cameras', value: 85, bookings: 12 },
        { label: 'Laptops', value: 70, bookings: 10 },
        { label: 'Projectors', value: 60, bookings: 8 },
        { label: 'Lab Equip', value: 45, bookings: 6 },
        { label: 'Sports', value: 30, bookings: 5 }
      ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw horizontal grid lines & Y-axis labels
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';

    const yTicks = [0, 20, 40, 60, 80, 100];
    yTicks.forEach((tick) => {
      const y = padding.top + chartHeight - (tick / 100) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(`${tick}%`, padding.left - 10, y + 4);
    });

    // Draw Bars
    const barCount = chartData.length;
    const barWidth = Math.min(50, chartWidth / (barCount * 1.8));
    const step = chartWidth / barCount;

    chartData.forEach((item, index) => {
      const x = padding.left + index * step + (step - barWidth) / 2;
      const barHeight = (item.value / 100) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      const isHovered = hoveredBar === index;

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      if (isHovered) {
        gradient.addColorStop(0, '#1d4ed8');
        gradient.addColorStop(1, '#3b82f6');
      } else {
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#60a5fa');
      }

      ctx.fillStyle = gradient;
      
      // Draw rounded rectangle for bar
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
      ctx.lineTo(x + barWidth, padding.top + chartHeight);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.closePath();
      ctx.fill();

      // Top value text (e.g., 85%)
      ctx.fillStyle = isHovered ? '#1d4ed8' : '#334155';
      ctx.font = isHovered ? 'bold 12px Inter, sans-serif' : '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.value}%`, x + barWidth / 2, y - 8);

      // Bottom label (e.g., Cameras)
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(item.label, x + barWidth / 2, height - padding.bottom + 22);
    });
  }, [chartData, hoveredBar]);

  // Handle canvas mouse move for interactive tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const scaleX = canvas.width / rect.width;
    const actualX = mouseX * scaleX;

    const padding = { left: 50, right: 30 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const step = chartWidth / chartData.length;

    let found = null;
    chartData.forEach((_, index) => {
      const startX = padding.left + index * step;
      const endX = startX + step;
      if (actualX >= startX && actualX <= endX) {
        found = index;
      }
    });

    setHoveredBar(found);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
  };

  return (
    <div className="canvas-wrapper p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 className="fw-bold text-dark mb-0 fs-6">Resource Utilization by Category</h6>
        {hoveredBar !== null && (
          <span className="badge bg-primary px-2 py-1">
            {chartData[hoveredBar].label}: {chartData[hoveredBar].value}% ({chartData[hoveredBar].bookings} bookings)
          </span>
        )}
      </div>

      <div className="w-100 position-relative" style={{ overflowX: 'auto' }}>
        <canvas
          ref={canvasRef}
          id="utilization-canvas"
          width={580}
          height={280}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-100"
          style={{ maxHeight: '280px', display: 'block' }}
        />
      </div>
      <div className="text-center text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
        Calculated from confirmed reservations across categories.
      </div>
    </div>
  );
}

CanvasUtilizationChart.propTypes = {
  categories: PropTypes.array
};
