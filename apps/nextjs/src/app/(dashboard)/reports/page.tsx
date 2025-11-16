import { PayrollDownloadForm } from "@/components/reports/PayrollDownloadForm";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-400">Reports</p>
        <h1 className="text-2xl font-semibold text-slate-900">レポート / CSV出力</h1>
        <p className="text-sm text-slate-500">給与計算・契約更新のCSV/帳票を一括生成</p>
      </div>

      <section className="section-card grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">給与データ出力</h2>
          <p className="text-sm text-slate-500">
            時給、勤務条件、交通費など給与計算に必要なデータを指定日時点で抽出します。
          </p>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
            <ul className="list-disc space-y-2 pl-5">
              <li>従業員番号・氏名・部門コード</li>
              <li>最新の勤務条件（勤務時間帯・勤務日数）</li>
              <li>契約中の時給、残業時給、交通費ルート</li>
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-inner-soft">
          <PayrollDownloadForm />
        </div>
      </section>

      <section className="section-card grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">契約更新レポート</h2>
          <p className="text-sm text-slate-500">
            期限切れアラート・承認状態をまとめたハイライトレポート
          </p>
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-700">
            契約期限60日以内の従業員数や承認待ち件数をグラフで表示。近日中にPDF出力も追加予定です。
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white/90 p-4">
          <p className="text-sm text-slate-600">
            CSV以外の帳票（契約書PDF、レポートテンプレート）はPhase
            5以降で順次導入予定です。要望があれば PLANS.md に追記してください。
          </p>
        </div>
      </section>
    </div>
  );
}
