# 契約テーブルの雇用満了日管理と勤務条件テーブルの統合

## 概要

このPRでは、以下の2つの機能を実装します：

1. **契約テーブルの雇用満了日管理機能** (`specs/002-contract-expiry-date`)
   - `contracts`テーブルに`employment_expiry_scheduled_date`（雇用満了予定日）と`employment_expiry_date`（実際の雇用満了日）フィールドを追加
   - 既存の`contract_end_date`を`employment_expiry_scheduled_date`に移行
   - 契約更新アラートを雇用満了予定日に基づいて動作するように変更

2. **勤務条件テーブルの統合** (`specs/003-work-conditions-consolidation`)
   - `work_conditions`テーブルにJSONBカラムを追加して物理的に統合
   - 子テーブル（`working_hours`、`break_hours`、`work_locations`、`transportation_routes`）を削除
   - テーブル番号を1-8に整理

## 変更内容

### データベーススキーマ
- `contracts`テーブルに雇用満了予定日・雇用満了日フィールドを追加
- `work_conditions`テーブルにJSONBカラム（`working_hours_jsonb`、`break_hours_jsonb`、`work_locations_jsonb`、`transportation_routes_jsonb`）を追加
- 子テーブルを削除して1つのテーブルに統合
- テーブル番号を1-8に整理

### マイグレーション
- `2025-01-28_contract_expiry_date_migration.sql`: 契約テーブルの雇用満了日管理マイグレーション
- `2025-01-28_work_conditions_consolidation.sql`: 勤務条件テーブル統合マイグレーション

### ドキュメント
- `specs/002-contract-expiry-date/spec.md`: 契約テーブルの雇用満了日管理仕様書
- `specs/003-work-conditions-consolidation/spec.md`: 勤務条件テーブル統合仕様書（実装に合わせて更新）
- `database/SUPABASE_SETUP.md`: テーブル一覧を8テーブルに更新

## 関連Issue

- `specs/002-contract-expiry-date/spec.md`
- `specs/003-work-conditions-consolidation/spec.md`

## チェックリスト

- [x] スキーマ変更が完了
- [x] マイグレーションファイルが作成済み
- [x] 仕様書が実装に合わせて更新済み
- [x] テーブル番号が整理済み

