# CI/CD 環境構築ハンズオン

## アジェンダ

### 必要な事前準備

- 自分の AWS アカウントのコンソールにログインする。（できれば EC2-Classic に対応していないアカウントが望ましいです）
- **東京リージョンのコンソールが表示されるようにしておく**
- 自分の GitHub アカウントにログインする。
- Git をインストール及びセットアップする。（自分の自分のリポジトリからのクローンおよびプッシュが行える状態にしておいてください。）
- コンソールから起動しコードの編集が行えるエディタ(Vim, Emacs, VSCode 等)

### ハンズオンの目的

CodePipeline を使用してデプロイの自動化が簡単に行えることを体感していただき、実際にデプロイの自動化に取り組むきっかけにしていただく。

### このハンズオンでかかる AWS の費用

$1 未満

### ハンズオンの流れ

1. 構成の簡単な紹介
1. サンプルアプリケーションのフォーク及びクローン
1. ハンズオン用環境構築用の CloudFormation の実行
1. 手動デプロイしてみる(講師が実演します)
1. CodePipeline によるパイプラインの構築および自動デプロイの実行
1. テストが失敗すると自動デプロイが止まるのを確認
1. 再度正しいコードに戻して自動デプロイ

## 参考資料

### EC2 に CodeDeploy でデプロイするパターン

- [「AWS と GitHub で始める DevOps ハンズオン」の資料を公開します！](https://dev.classmethod.jp/etc/aws-github-devops-hands-on/)

### Pull Request をビルドしたいパターン

- [CodeBuild で GitHub のプルリクエストを自動ビルドして、結果を表示する](https://dev.classmethod.jp/cloud/aws/codebuild-github-pullrequest-settings/)

### サーバレスパターン

- [CodeDeploy を利用した Lambda のバージョン間の段階デプロイ](https://dev.classmethod.jp/cloud/aws/aws-reinvent-codedeploy-lambda/)
- [AWS SAM を通して CodeDeploy を利用した Lambda 関数のデプロイを理解する](https://dev.classmethod.jp/server-side/serverless/understanding-lambda-deploy-with-codedeploy-using-aws-sam/)

### ECSでBlue Greenデプロイパターン
- [CodePipelineからECSにBlue/Greenデプロイする](https://dev.classmethod.jp/cloud/aws/codepipeline-ecs-codedeploy/)

### EKS でパターン

- [Kustomize + CodePipeline + CodeBuild で EKS に継続的デプロイしてみた](https://dev.classmethod.jp/cloud/aws/kustomize-codepipeline-codebuild/)
