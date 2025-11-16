import { env } from "@/env";

const mask = (value?: string) => {
  if (!value) return "未設定";
  if (value.length <= 10) return `${value.slice(0, 3)}****`;
  return `${value.slice(0, 6)}•••${value.slice(-4)}`;
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">システム設定</h1>
        <p className="text-sm text-slate-500">通知、権限、Supabase接続情報を管理</p>
      </div>

      <section className="section-card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">通知設定</h2>
          <p className="text-sm text-slate-500">
            契約更新やアラートの配信先を設定します。
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            defaultChecked
          />
          契約期限60日前に統括管理者へ通知
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            defaultChecked
          />
          契約承認待ちを現場マネージャーへ通知
        </label>
      </section>

      <section className="section-card space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Supabase 接続情報</h2>
          <p className="text-sm text-slate-500">
            `.env` に設定した接続情報の概要を表示します。
          </p>
        </div>
        <dl className="grid gap-4 text-sm text-slate-600 md:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">DATABASE_URL</dt>
            <dd className="truncate rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              {mask(env.DATABASE_URL)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">NEXT_PUBLIC_SUPABASE_URL</dt>
            <dd className="truncate rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              {mask(env.NEXT_PUBLIC_SUPABASE_URL)}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
