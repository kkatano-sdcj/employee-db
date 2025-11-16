const LABELS: Record<string, { label: string; classes: string }> = {
  ACTIVE: { label: "稼働", classes: "bg-emerald-50 text-emerald-600" },
  ON_LEAVE: { label: "休職", classes: "bg-amber-50 text-amber-600" },
  RETIRED: { label: "退職", classes: "bg-slate-100 text-slate-500" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const info = LABELS[status] ?? LABELS.RETIRED;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${info.classes}`}>
      {info.label}
    </span>
  );
};
