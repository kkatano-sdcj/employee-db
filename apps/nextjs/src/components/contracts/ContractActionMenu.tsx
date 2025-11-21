"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  EllipsisVerticalIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  PrinterIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

type ContractActionMenuProps = {
  contractId: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
};

type MenuLinkItem = {
  type: "link";
  label: string;
  description: string;
  href: string;
  icon: ReactNode;
};

type MenuButtonItem = {
  type: "button";
  label: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
};

type MenuItem = MenuLinkItem | MenuButtonItem;

export function ContractActionMenu(props: ContractActionMenuProps) {
  const { contractId, employeeId, employeeName, employeeNumber } = props;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      type: "link",
      label: "契約書プレビュー",
      description: "新しいタブで契約書PDFを表示",
      href: `/api/pdf/contracts/${contractId}?type=contract`,
      icon: <PrinterIcon className="h-4 w-4 text-slate-400" />,
    },
    {
      type: "link",
      label: "誓約書プレビュー",
      description: "新しいタブで誓約書PDFを表示",
      href: `/api/pdf/contracts/${contractId}?type=pledge`,
      icon: <DocumentTextIcon className="h-4 w-4 text-slate-400" />,
    },
    {
      type: "link",
      label: "契約プレビュー",
      description: `${employeeName} の契約履歴を開く`,
      href: `/employees/${employeeId}?view=contracts`,
      icon: <EyeIcon className="h-4 w-4 text-slate-400" />,
    },
    {
      type: "link",
      label: "契約更新",
      description: "従業員の編集ページで契約を修正",
      href: `/employees/${employeeId}/edit?source=contract`,
      icon: <PencilSquareIcon className="h-4 w-4 text-slate-400" />,
    },
    {
      type: "link",
      label: "新規契約作成",
      description: "既存情報をベースに新しい契約を作成",
      href: `/employees/${employeeId}/edit?source=contract&mode=new-contract`,
      icon: <PlusIcon className="h-4 w-4 text-slate-400" />,
    },
    {
      type: "button",
      label: "契約削除",
      description: "近日リリース予定（権限管理中）",
      icon: <TrashIcon className="h-4 w-4 text-slate-400" />,
      disabled: true,
    },
  ];

  const onToggle = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        aria-expanded={open}
        aria-label="契約操作メニューを開く"
        className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 rounded-2xl border border-slate-100 bg-white p-3 text-sm text-slate-600 shadow-soft">
          <div className="mb-2 border-b border-slate-100 pb-2 text-xs text-slate-400">
            {employeeName}（{employeeNumber}）<br />
            契約番号: <span className="font-mono text-slate-500">{contractId}</span>
          </div>
          <div className="space-y-1">
            {menuItems.map((item) =>
              item.type === "link" ? (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("/api/pdf/") ? "_blank" : undefined}
                  rel={item.href.startsWith("/api/pdf/") ? "noreferrer" : undefined}
                  className="flex items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">{item.description}</span>
                  </span>
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>{item.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      {item.label}
                    </span>
                    <span className="text-xs text-slate-500">{item.description}</span>
                  </span>
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
