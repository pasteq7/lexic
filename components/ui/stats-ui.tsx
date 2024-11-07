export function Stats({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-sm text-primary/50">{label}</div>
    </div>
  );
} 