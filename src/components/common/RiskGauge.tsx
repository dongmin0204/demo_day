import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import type { Severity } from '@/types';
import { getRiskDisplaySeverity } from '@/utils/risk';

const config = {
  critical: { color: '#DC2626', fill: 0.92, Icon: AlertTriangle },
  caution: { color: '#D97706', fill: 0.55, Icon: AlertCircle },
  unknown: { color: '#9CA3AF', fill: 0.12, Icon: HelpCircle },
} as const;

/** Circular gauge visualising categorical severity (no fabricated score). */
export function RiskGauge({ severity, size = 48 }: { severity: Severity; size?: number }) {
  const { color, fill, Icon } = config[getRiskDisplaySeverity(severity)];
  const inner = size - 12;
  const icon = Math.round(size * 0.36);

  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${fill * 360}deg, #EDEFF2 0deg)`,
      }}
    >
      <div
        className="grid place-items-center rounded-full bg-white"
        style={{ width: inner, height: inner }}
      >
        <Icon style={{ color, width: icon, height: icon }} strokeWidth={2} />
      </div>
    </div>
  );
}
