interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: "primary" | "green" | "amber" | "red" | "blue";
  delay?: number;
}

const colorMap = {
  primary: "text-primary",
  green: "text-stat-green",
  amber: "text-stat-amber",
  red: "text-stat-red",
  blue: "text-stat-blue",
};

const StatCard = ({ label, value, subtitle, color = "primary", delay = 0 }: StatCardProps) => {
  return (
    <div
      className="bg-gradient-card rounded-lg border border-border p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-2">
        {label}
      </p>
      <p className={`text-3xl font-bold font-mono ${colorMap[color]}`}>{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
