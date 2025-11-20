# プルリクエスト作成コマンド集

このドキュメントでは、GitHubでプルリクエストを作成する際に使用するコマンドをまとめています。

## 前提条件

- Gitがインストールされていること
- GitHub CLI (`gh`) がインストールされていること（オプション）
- GitHubアカウントにログインしていること

## GitHub CLIのインストール

```bash
# Ubuntu/Debian
sudo apt install gh

# または snap
sudo snap install gh

# 認証
gh auth login
```

## 基本的なプルリクエスト作成手順

### 1. ブランチの作成と変更のコミット

```bash
# 新しいブランチを作成
git checkout -b feature-branch-name

# 変更をステージング
git add .

# 変更をコミット
git commit -m "feat: 機能の説明"

# リモートにプッシュ
git push origin feature-branch-name
```

### 2. プルリクエストの作成

#### 方法1: GitHub CLIを使用（推奨）

```bash
# 基本的なコマンド
gh pr create --title "PRタイトル" --body "PR本文" --base main --head feature-branch-name

# 本文をファイルから読み込む場合
gh pr create --title "PRタイトル" --body-file PR_BODY.md --base main --head feature-branch-name
```

#### 方法2: GitHub Web UIを使用

1. ブランチをプッシュ後、以下のURLにアクセス：
   ```
   https://github.com/kkatano-sdcj/employee-db/compare/main...feature-branch-name
   ```

2. タイトルと本文を入力して「Create pull request」をクリック

## デフォルトブランチの確認と変更

### リモートのデフォルトブランチを確認

```bash
# リモートブランチ一覧を表示
git branch -r

# デフォルトブランチを確認
git remote show origin | grep "HEAD branch"

# リモートの全ブランチを確認
git ls-remote --heads origin
```

### デフォルトブランチを`main`に変更

#### 1. リモートに`main`ブランチを作成

```bash
# 既存のブランチからmainを作成
git checkout -b main origin/001-employee-db-requirements
git push origin main

# または、直接リモートにmainブランチを作成
git push origin 001-employee-db-requirements:main
```

#### 2. GitHubのリポジトリ設定でデフォルトブランチを変更

1. GitHubのリポジトリページ（`https://github.com/kkatano-sdcj/employee-db`）にアクセス
2. **Settings** → **Branches** に移動
3. **Default branch** セクションで「Switch to another branch」をクリック
4. `main`を選択して「Update」をクリック
5. 確認ダイアログで「I understand, update the default branch」をクリック

#### 3. ローカルの設定を更新

```bash
# リモートの最新情報を取得
git fetch origin

# ローカルのmainブランチをリモートのmainに追従
git checkout main
git branch --set-upstream-to=origin/main main
```

## よくあるエラーと解決方法

### エラー: "Base ref must be a branch"

**原因**: 指定したベースブランチがリモートに存在しない

**解決方法**:
```bash
# リモートブランチを確認
git branch -r

# 存在するブランチをベースに指定
gh pr create --title "PRタイトル" --body-file PR_BODY.md --base 001-employee-db-requirements --head feature-branch-name
```

### エラー: "No commits between main and feature-branch"

**原因**: ブランチ間にコミット差分がない

**解決方法**:
```bash
# コミット差分を確認
git log --oneline main..feature-branch-name

# コミットがあることを確認してから再度実行
```

### エラー: "Head sha can't be blank"

**原因**: リモートブランチがプッシュされていない

**解決方法**:
```bash
# リモートにプッシュ
git push origin feature-branch-name

# その後、再度プルリクエストを作成
```

## プルリクエスト本文のテンプレート

`PR_BODY.md`ファイルの例：

```markdown
# 機能のタイトル

## 概要

このPRでは、以下の機能を実装します：

- 機能1の説明
- 機能2の説明

## 変更内容

### データベーススキーマ
- 変更内容1
- 変更内容2

### マイグレーション
- マイグレーションファイルの説明

### ドキュメント
- 更新されたドキュメントの説明

## 関連Issue

- Issue番号またはリンク

## チェックリスト

- [x] テストが完了
- [x] ドキュメントが更新済み
- [x] コードレビュー準備完了
```

## 実用的なコマンド例

### 現在のブランチからプルリクエストを作成

```bash
# 現在のブランチ名を取得してプルリクエストを作成
BRANCH_NAME=$(git branch --show-current)
gh pr create --title "feat: 機能の説明" --body-file PR_BODY.md --base main --head $BRANCH_NAME
```

### プルリクエストの一覧を表示

```bash
# オープンなプルリクエストを表示
gh pr list

# 詳細を表示
gh pr list --state all
```

### プルリクエストの詳細を表示

```bash
# プルリクエスト番号を指定
gh pr view <PR番号>

# 現在のブランチのプルリクエストを表示
gh pr view
```

### プルリクエストをマージ

```bash
# マージ（通常はWeb UIから実行）
gh pr merge <PR番号> --merge

# マージ後にブランチを削除
gh pr merge <PR番号> --delete-branch
```

## 参考リンク

- [GitHub CLI公式ドキュメント](https://cli.github.com/manual/)
- [GitHub Pull Request作成ガイド](https://docs.github.com/ja/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)

