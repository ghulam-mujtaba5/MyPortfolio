/**
 * ProgressRing Component
 * Circular progress indicator for KPI cards
 */
export default function ProgressRing({ 
  value = 0, 
  size = 48, 
  strokeWidth = 4,
  color = 'var(--admin-primary)',
  bgColor = 'var(--border)',
  showValue = true,
  className = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  // Determine color based on value thresholds
  const getColor = () => {
    if (color !== 'var(--admin-primary)') return color;
    if (value >= 80) return 'var(--admin-success)';
    if (value >= 50) return 'var(--admin-warning)';
    if (value < 30) return 'var(--admin-error)';
    return color;
  };

  return (
    <div 
      className={className}
      style={{ 
        position: 'relative', 
        width: size, 
        height: size 
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease'
          }}
        />
      </svg>
      {showValue && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size > 40 ? '0.75rem' : '0.625rem',
            fontWeight: 600,
            color: 'var(--text)',
          }}
        >
          {Math.round(value)}%
        </div>
      )}
    </div>
  );
}
