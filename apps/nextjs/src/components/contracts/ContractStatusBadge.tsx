const STATUS_MAP: Record<
  string,
  {
    label: string;
    classes: string;
  }
> = {
  DRAFT: { label: "下書き", classes: "bg-slate-100 text-slate-600" },
  AWAITING_APPROVAL: {
    label: "承認待ち",
    classes: "bg-amber-50 text-amber-700",
  },
  SUBMITTED: { label: "提出済", classes: "bg-emerald-50 text-emerald-600" },
  RETURNED: { label: "差戻し", classes: "bg-rose-50 text-rose-600" },
};

export const ContractStatusBadge = ({ status }: { status: string }) => {
  const info = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${info.classes}`}>
      {info.label}
    </span>
  );
};
