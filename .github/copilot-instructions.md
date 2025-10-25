このプロジェクトは backlog-js を deno に移植したものです。
backlog の API は https://developer.nulab.com/ja/docs/backlog/ を参照してください。
認証は、API キーと OAuth 2.0 に対応します。

# コーディング規約

- TypeScript を使用
- 変数名、関数名、クラス名はキャメルケース
- クラスは使わずに、関数とインターフェースで実装
- Promise を返す非同期関数は async/await を使用
- エラーハンドリングは try/catch を使用
- 各エンドポイントに対して、テストコードを実装
- ドキュメントコメントを必ず記述
- コード整形と、リンティングは deno fmt と deno lint を使用
- コミットメッセージは英語で記述
- Pull Request の説明は英語で記述
- GitHub Actions を使用して、CI/CD を実装
- バージョン管理は SemVer に従う
- 既存の backlog-js の実装を参考にすることができる
