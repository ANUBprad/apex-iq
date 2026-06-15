export type Severity = "low" | "moderate" | "high";
export type GemVariant = "confidence" | "risk" | "neutral";

export interface GemMeterProps {
  value: number;
  max?: number;
  gems?: number;
  variant?: GemVariant;
  label?: string;
  showValue?: boolean;
  pulse?: boolean;
  className?: string;
}

export interface RiskPillProps {
  level: string;
  className?: string;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: "favorable" | "unfavorable" | "neutral";
  sub?: string;
  className?: string;
}
