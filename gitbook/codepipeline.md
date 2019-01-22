## CodePipeline によるパイプラインの構築

手動でのデプロイが大変だと感じてもらったところで、CodePipeline/CodeBuild を使用したパイプラインを作成していきます。

今回作成するパイプラインは以下図の左側の部分です。

![構成図](https://cacoo.com/diagrams/Bik1Om7JvTVGzpfj-5F49C.png)

では、早速作成していきましょう。

マネジメントコンソールのトップ画面より「CodePipeline」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-15-640x195.png" alt="devops-hands-on-15" width="640" height="195" class="alignnone size-medium wp-image-259029" />

まだパイプラインを作成していない場合は以下のような画面が表示されるので「今すぐ始める」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-16-640x269.png" alt="devops-hands-on-16" width="640" height="269" class="alignnone size-medium wp-image-259031" />

パイプラインのセットアップが開始するのでパイプライン名として`hands-on-pipeline`と入力して「次のステップ」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-17-640x204.png" alt="devops-hands-on-17" width="640" height="204" class="alignnone size-medium wp-image-259032" />

ソースプロバイダのセットアップが始まるので以下の表のように入力後、「次のステップ」をクリックします。

| 入力項目         | 値                           |
| ---------------- | ---------------------------- |
| ソースプロバイダ | GitHub                       |
| リポジトリ       | フォークしておいたリポジトリ |
| ブランチ         | master                       |

ビルドプロバイダのセットアップが始まるので以下の表のように入力後、「ビルドプロジェクトの保存」をクリックしてから「次のステップ」をクリックします。

| 入力項目                 | 値                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| ビルドプロバイダ         | AWS CodeBuild                                                                                 |
| プロジェクトの設定       | 新しいビルドプロジェクトを作成                                                                |
| プロジェクト名           | hands-on-project                                                                              |
| 環境イメージ             | AWS CodeBuild マネージド型イメージの使用                                                      |
| OS                       | Ubuntu                                                                                        |
| ランタイム               | Node.js                                                                                       |
| バージョン               | aws/codebuild/nodejs:10.1.0                                                                   |
| ビルド仕様               | ソースコードのルートディレクトリの buildspec.yml を使用                                       |
| キャッシュ タイプ        | キャッシュなし                                                                                |
| CodeBuild サービスロール | `アカウントから既存のロールを選択します`を選択し環境構築用スタックの出力の値を入力            |
| VPC                      | No VPC                                                                                        |
| 特権付与(アドバンスト内) | ✔                                                                                             |

デプロイプロバイダのセットアップが始まるのでプロバイダに「Amazon ECS」を入力後、「AWS CodeDeploy に新たにアプリケーションを作成します。」のリンクをクリックします。

| 入力項目             | 値                              |
| -------------------- | ------------------------------- |
| デプロイプロバイダ   | Amazon ECS                      |
| クラスター名         | hands-on-environment-ECSCluster |
| サービス名           | hands-on-environment-ECSService |
| イメージのファイル名 | `imagedefinitions.json`          |
コピー用
```
imagedefinitions.json
```

CodePipeline にアタッチする IAM Role の画面に変わるので、「ロールの作成」をクリック後、遷移する画面で「許可」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-21-640x363.png" alt="devops-hands-on-21" width="640" height="363" class="alignnone size-medium wp-image-259055" />

IAM Role の作成が完了したら「次のステップ」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-22-640x223.png" alt="devops-hands-on-22" width="640" height="223" class="alignnone size-medium wp-image-259056" />

最後に確認画面が表示されるので、内容を確認後、「パイプラインの作成」をクリックします。
