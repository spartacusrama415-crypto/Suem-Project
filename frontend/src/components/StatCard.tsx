interface StatCardProps {
  icon: string;
  iconClass: string;
  label: string;
  value: string;
  delta: string;
}

export default function StatCard({ icon, iconClass, label, value, delta }: StatCardProps) {
  return (
    <div className="stat-card reveal spot">
      <div className="stat-top">
        <div className={`stat-icon ${iconClass}`}>{icon}</div>
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value num">{value}</div>
        <div className="stat-delta">{delta}</div>
      </div>
    </div>
  );
}
