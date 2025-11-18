# AGENTS.mdを作成するコマンドファイル


## 概要
このファイルは、AGENTS.mdを作成するコマンドファイルです。構成とプロジェクトの仕様に基づいて、LLMの挙動を制御するためのルールを作成します。

## AGENTS.mdの基本構成
AGENTS.mdは以下の項目を必ず含むこと。

- プロジェクト概要（１～３行）
- 目的
- いつPLASNS.mdを参照するのか
- プロジェクト構成
- 開発環境のヒント
- セットアップ/ビルド/テスト の手順
- プルリクエストの手順
- コーディング規約/コーディングスタイル
- ガードレール/禁止事項
- 要件・受け入れ基準の参照
- PRルール

**全体構造の階層**

Repository Guidelines (ルート)
├── 1. 導入・前提セクション
│   ├── overview（プロジェクト概要）
│   ├── Purpose（プロジェクト概要含む）
│   └── ExecPlans / When to Use PLANS.md
│
├── 2. プロジェクト構造セクション
│   ├── Project Structure & Module Organization
│   └── Dev environment tips（開発環境のヒント）
│
├── 3. 開発環境セットアップセクション
│   ├── Setup Commands（セットアップコマンド）
│   └── Build, Test, and Development Commands
│
├── 4. 規約・ルールセクション
│   ├── Repository Conventions
│   ├── Coding Style & Naming Conventions & Linter
│   └── Task Policy (Very Important)
│
├── 5. 開発プロセスセクション
│   ├── Testing Guidelines
│   ├── Commit & Pull Request Guidelines（コミット＆プルリクエストの手順）
│   └── Verification
│
├── 6. リファレンスセクション
│   └── Files the Agent Should Read First
│
├── 7. 制約・禁止事項セクション
│   └── Don'ts
│
└── 8. その他設定
    └── 応答言語設定