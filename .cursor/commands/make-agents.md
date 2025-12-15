---
description: AIエージェントの挙動を制御するAGENTS.md ファイルを作成するコマンド
--- 

# AGENTS.mdを作成するコマンドファイル

あなたはAI駆動開発手法を用いてプロダクト開発を行うエンジニアです。
最新のspec.mdを参照して、プロジェクトの実行計画である `AGENTS.md` を以下のルールに従って作成してください。

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

```
Repository Guidelines (ルート)
├── 1. 導入・前提セクション
│   ├── ExecPlans / When to Use PLANS.md
│   └── Purpose（プロジェクト概要含む）
│
├── 2. プロジェクト構造セクション
│   └── Project Structure & Module Organization
│
├── 3. 開発環境セットアップセクション
│   ├── Setup Commands
│   └── Build, Test, and Development Commands
│
├── 4. 規約・ルールセクション
│   ├── Repository Conventions
│   ├── Coding Style & Naming Conventions
│   └── Task Policy (Very Important)
│
├── 5. 開発プロセスセクション
│   ├── Testing Guidelines
│   ├── Commit & Pull Request Guidelines
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
```


## 記述のポイント

### **Exec Planについての設定**
`PLANS.md` を参照させるタイミングについては、必ず以下の文言を記述するようにしてください。

```
複雑な機能や大規模なリファクタリングに取り組む際は、
必ず PLANS.md（PLANS.md） を使用してください。

「exec plan」という言葉を使ったときは、
PLANS.md（./PLANS.md） を参照し、以下を実行してください：

1. 全体像を理解する
2. 進捗状況を確認する
3. 作業後に PLANS.md を更新する
4. 発見事項と決定事項を記録する

PLANS.md はあなたの長期記憶であり、
プロジェクトの羅針盤です。
```

また、`PLANS.md`に記載する内容として、特に、Progress、Surprises & Discoveries、Decision Log、Outcomes & Retrospectiveのセクションは必須であり、作業の進行に合わせて更新し続ける必要があります。

### ドキュメントのルール

`docs`フォルダにドキュメントを書いてください
ドキュメントが無いならばmarkdown形式で新規作成してください
常に `docs`フォルダ内のドキュメントを最新の状態にしてください。

### 作業終了時
作業が完了したらドキュメントを更新するように指示を記述する。
作業が完了したら、コマンドを実行し、すべてが正常に動作することを確認させるように設定する。
```
例: 
- `npm run check` 
- `npm run build` 
- `npm run test`
```
確認が完了したら、変更をコミットさせるように設定する。
