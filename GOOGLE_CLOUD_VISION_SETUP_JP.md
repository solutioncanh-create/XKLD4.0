# Google Cloud Vision API 導入ガイド (日本語)

Google Cloud Console (日本語インターフェース) を使用して、AI-OCR機能（IDカード読み取り）に必要なAPIキーを取得する手順です。

## ステップ 1: プロジェクトの選択または作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスします。
2. 上部のバーにある **プロジェクト ID**（または「プロジェクトの選択」）をクリックします。
3. 既存のプロジェクトを選択するか、**「新しいプロジェクト」** (New Project) をクリックして作成します。

## ステップ 2: Cloud Vision API の有効化

1. 左側のメニュー（ハンバーガーメニュー ≡）をクリックします。
2. **「API とサービス」** (APIs & Services) > **「ライブラリ」** (Library) を選択します。
3. 検索バーに `Cloud Vision API` と入力して検索し、**「有効にする」** (Enable) をクリックします。
4. 続けて検索バーに `Generative Language API` (Google Gemini) と入力して検索し、これも **「有効にする」** (Enable) をクリックします。

## ステップ 3: API キーの作成 (認証情報)

1. 左側のメニューで **「API とサービス」** (APIs & Services) > **「認証情報」** (Credentials) を選択します。
2. 上部にある **「認証情報を作成」** (Create Credentials) をクリックします。
3. **「API キー」** (API Key) を選択します。
4. ポップアップが表示され、新しい API キー (`AIza...` で始まる文字列) が表示されます。
5. このキーをコピーしてください。

## ステップ 4: プロジェクトへの設定 (.env)

プロジェクトのルートフォルダ (`quan-ly-xkld` フォルダ) にある `.env` ファイルを開き (なければ作成し)、以下の行を追加します。

```env
VITE_GOOGLE_CLOUD_API_KEY=ここにコピーしたAPIキーを貼り付け
```

例:
```env
VITE_GOOGLE_CLOUD_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ステップ 5: 再起動

設定を反映させるため、ターミナルで実行中のサーバーを停止 (`Ctrl + C`) し、再起動してください。

```bash
npm run dev
```

これで、登録フォームの「写真アップロード」機能で AI が自動的に情報を読み取るようになります。
