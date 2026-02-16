# Vercelへのデプロイ・更新ガイド (XKLD 4.0 Manager)

このガイドでは、アプリケーションの最新版をVercelにアップロード（デプロイ）する手順を説明します。

---

## 方法1：自動スクリプトを使用する（推奨・一番簡単）

私が作成した自動デプロイ用のスクリプトを使用する方法です。

1. **ターミナル**（コマンドプロンプトやVS Codeのターミナル）を開きます。
2. 以下のコマンドを入力して実行します：

   ```batch
   .\deploy_vercel.bat
   ```

3. **初回の実行時**は、ブラウザが開いてVercelへのログインを求められます。画面の指示に従ってログインしてください。
4. スクリプトが自動的にビルドとアップロードを行います。
5. 完了すると「Deploy thanh cong!」と表示され、新しいURLが発行されます。

---

## 方法2：Vercel CLI（コマンドライン）を手動で使用する

スクリプトを使わずに、手動でコマンドを入力する方法です。

### 1. Vercel CLIのインストール（まだの場合）
```bash
npm install -g vercel
```

### 2. Vercelにログイン
```bash
npx vercel login
```
* 矢印キーでログイン方法（Email, GitHubなど）を選択し、ブラウザで認証します。

### 3. プロジェクトのデプロイ（更新）
本番環境（Production）に適用するには、必ず `--prod` オプションを付けます。

```bash
npx vercel --prod
```

* 質問が表示された場合（例：`Set up and deploy?`）、すべて `Enter` キー（Yes/Default）を押して進めてください。
* **Inspect:** リンクが表示されたらデプロイ完了です。

---

## 方法3：GitHub連携（Gitを使用している場合）

もしソースコードをGitHubにプッシュしている場合は、Vercelと連携するのが最も一般的です。

1. コードをGitHubにプッシュします：
   ```bash
   git add .
   git commit -m "UI更新: 検索バーとリスト表示の改善"
   git push origin main
   ```
2. Vercelのダッシュボードで、リポジトリと連携されていれば、**プッシュするだけで自動的にデプロイ**が開始されます。

---

## 注意事項

* **環境変数 (.env):** 
  Vercelのダッシュボード（Settings > Environment Variables）で、Supabaseの接続情報を設定する必要があります。
  * `VITE_SUPABASE_URL`
  * `VITE_SUPABASE_ANON_KEY`

* **反映されない場合:**
  ブラウザのキャッシュが残っている可能性があります。`Ctrl + Shift + R` でハードリロードするか、シークレットモードで確認してください。
