import { useMemo } from 'react';

/**
 * Sparkline Component
 * A mini chart for showing trends in KPI cards
 */
export default function Sparkline({ 
  data = [], 
  color = 'var(--admin-primary)',
  height = 36,
  className = ''
}) {
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const max = Math.max(...data, 1);
    return data.map(value => (value / max) * 100);
  }, [data]);

  if (normalizedData.length === 0) {
    return (
      <div 
        className={className}
        style={{ 
          height, 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: 3 
        }}
      >
        {[20, 40, 30, 60, 45, 70, 50].map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: 'var(--border)',
              borderRadius: '3px 3px 0 0',
              opacity: 0.5
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{ 
        height, 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: 3 
      }}
    >
      {normalizedData.map((height, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            height: `${Math.max(height, 8)}%`,
            background: `color-mix(in oklab, ${color} 30%, transparent)`,
            borderRadius: '3px 3px 0 0',
            transition: 'all 0.3s ease',
            minHeight: 4
          }}
          onMouseEnter={(e) => {
            e.target.style.background = color;
            e.target.style.transform = 'scaleY(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = `color-mix(in oklab, ${color} 30%, transparent)`;
            e.target.style.transform = 'scaleY(1)';
          }}
        />
      ))}
    </div>
  );
}
