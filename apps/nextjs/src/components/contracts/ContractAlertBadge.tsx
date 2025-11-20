import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type ContractAlertBadgeProps = {
  needsUpdate: boolean;
  scheduledDate?: string | null;
  actualDate?: string | null;
};

export const ContractAlertBadge = ({
  needsUpdate,
  scheduledDate,
  actualDate,
}: ContractAlertBadgeProps) => {
  if (!needsUpdate) {
    return (
      <div className="text-xs text-slate-400">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-500">
          正常
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600">
        <ExclamationTriangleIcon className="h-3 w-3" />
        要更新
      </span>
      {scheduledDate && (
        <p className="text-xs text-rose-500">満了予定日: {scheduledDate}</p>
      )}
      {actualDate && (
        <p className="text-[11px] text-rose-400">実満了日: {actualDate}</p>
      )}
    </div>
  );
};
