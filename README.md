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

## 1. ハンズオンで構築する構成

![構成図](https://cacoo.com/diagrams/Bik1Om7JvTVGzpfj-5F49C.png)

今回は上記の図のような構成を構築します。

- GitHub にコードがプッシュされると CodePipeline での処理が開始されます。
- CodeBuild ではテスト、Docker イメージの作成および作成したイメージの ECR へのプッシュを行います。
- CodeBuild での処理が成功したら ECS に新しいバージョンのイメージがデプロイされます。

## 2. サンプルアプリケーションのフォークおよびクローン

まずは、このリポジトリをフォークし、自分のアカウントにリポジトリを作成します。
サンプルアプリケーションは、指定された数まで FizzBuzz を表示する Node.js による簡単なアプリケーションです

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/fork-640x210.png" alt="" width="640" height="210" class="alignnone size-medium wp-image-348765" />

上のリンクから GitHub の当該リポジトリのページに移動し、右上の `Fork` というボタンからフォークを実行します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/f514b4e78f8a717b73707cc3b38dcff4-640x353.png" alt="" width="640" height="353" class="alignnone size-medium wp-image-348767" />

自分の GitHub アカウント上に作成されたフォークしたリポジトリから、ローカルの PC にクローンします。
作業用のディレクトリで以下のコマンドを実行します。

```shell
$ git clone git@github.com:<ご自分のgithubのアカウント名>/ci-cd-hands-on.git
```

クローンされたリポジトリのディレクトリに移動して中身を確認し、クローンが正しく行われたことを確認します。

```shell
$ cd ci-cd-handson
$ ls
Dockerfile		cloudformation		src
README.md		package-lock.json	template
buildspec.yml		package.json		test
```

## 3. ハンズオン用環境構築用の CloudFormation の実行

今回 ECS でアプリケーションを動作させるにあたってサービスにリンクしたロールが作成されている必要があります。
そのため、IAM のコンソールを開き、`AWSServiceRoleForECS`というロールがあるかを確認してください。
ない場合はサービスにリンクしたロールがない状態ですので、タスクが失敗してしまいます。

その場合は、以下のコマンドを実行するか

```shell
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com
```

空の ECS のクラスタを作成し、すぐに削除するなどして ECS のサービスにリンクしたロールが作成された状態にします。

[Launch Stack](https://console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/new?stackName=hands-on-environment&templateURL=https://s3-ap-northeast-1.amazonaws.com/ci-cd-hands-on-template/node/hands-on-environment.template.yaml)

上のリンクより、ハンズオン用の環境を構築するための CloudFormation を実行します。

この、CloudFormation によって、以下の図ような構成の環境が作成されます。

![CloudFormationによってい構築される構成](https://cacoo.com/diagrams/Bik1Om7JvTVGzpfj-2D387.png)

アプリケーションの動作環境以外に後で CodeBuild で使用するための IAM 　 Role を作成しています。

作成したスタックが `CREATE_COMPLETE` の状態になるまで待ちます。

### 動作確認

作成したスタックの出力に`ALBDNSName`というキーで出力された値が、今回のサンプルアプリケーションのアクセス先の URL です。アドレスバーにコピペして、サンプルアプリケーションの動作を確認します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/99049011a73b9c92d2967f57d2331c56-640x360.png" alt="" width="640" height="360" class="alignnone size-medium wp-image-349754"/>

## 4. 手動デプロイしてみる（講師が実演します。読み飛ばし可）

ecs-deploy のようなデプロイに便利なツールもありますが、CodeBuild で行う処理との対比をわかりやすくするため、ここではそういったものは使わずにデプロイを実行します。

まずはデプロイされたことがわかりやすくするため、画面を修正します。

```shell
$ npm install
$ vim template/views/index.ejs
$ npm test
$ git commit -am "manual deploy"
```

つぎに以下のコマンドを実行し、手動でデプロイを実行します。

まず、手元で Docker イメージを構築し、ECR にプッシュします。

```
$ $(aws ecr get-login --no-include-email --region ap-northeast-1)

$ IMAGE_REPOSITORY_NAME=`aws ssm get-parameter --name "IMAGE_REPOSITORY_NAME" --region ap-northeast-1 | jq -r .Parameter.Value`
$ IMAGE_TAG=`git rev-parse HEAD`
$ docker build -t $IMAGE_REPOSITORY_NAME:$IMAGE_TAG .
$ docker push $IMAGE_REPOSITORY_NAME:$IMAGE_TAG

$ echo $IMAGE_REPOSITORY_NAME:$IMAGE_TAG
```

ECS の設定の修正で使用するため、イメージをプッシュしたリポジトリとタグの値を覚えておきます。

ここまでの操作の中でも、プッシュする対象とは異なるブランチで作業を行っていた場合や、リモートブランチとの同期を忘れるなどした場合には意図したものとは異なるソースコードをデプロイしてしまうリスクがあります。

つぎに、コンソールの操作に移り、実際に ECS へのデプロイを行っていきます。

マネジメントコンソールから ECS の画面に移動します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/ecs-640x483.png" alt="" width="640" height="483" class="alignnone size-medium wp-image-349183" />

まず、タスク定義の新しいリビジョンを作成します。

環境構築用スタックによって作成されたタスクの新しいリビジョンの作成画面を表示します。
コンテナ名 fizzbuzz の設定画面に移動し、イメージの指定を先程プッシュしたイメージのものに書き換え新しいリビジョンを作成します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/a3eea352fa04680f29ce2e75163b5ca5-640x344.png" alt="" width="640" height="344" class="alignnone size-medium wp-image-349193" />

次に、環境構築用スタックによって作成されたサービスの編集画面に移動し、新しいタスク定義のリビジョンを指定するように編集をおこない、サービスの更新を実行します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/ef41ba4015f8a2f42ad5382c33fc1352-640x367.png" alt="" width="640" height="367" class="alignnone size-medium wp-image-349198" />

しばらくすると新しいタスク定義に基づくタスクが実行され、コードの修正が反映されます。

## 5. CodePipeline によるパイプラインの構築および自動デプロイの実行

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
| イメージのファイル名 | `imagedefinitions.json`           |

CodePipeline にアタッチする IAM Role の画面に変わるので、「ロールの作成」をクリック後、遷移する画面で「許可」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-21-640x363.png" alt="devops-hands-on-21" width="640" height="363" class="alignnone size-medium wp-image-259055" />

IAM Role の作成が完了したら「次のステップ」をクリックします。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2017/05/devops-hands-on-22-640x223.png" alt="devops-hands-on-22" width="640" height="223" class="alignnone size-medium wp-image-259056" />

最後に確認画面が表示されるので、内容を確認後、「パイプラインの作成」をクリックします。

すると、パイプラインが自動で開始されます。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/ddf0495992f096549e7a7aa62043c03b-640x885.png" alt="" width="640" height="885" class="alignnone size-medium wp-image-348910" />

`Staging`ステージまで緑色になり、デプロイが完了したところで一度正常にページにアクセスできることを確認します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/1769187c2286f846c233341f03da13e9-640x207.png" alt="" width="640" height="207" class="alignnone size-medium wp-image-349210" />

## 6. テストが失敗すると自動デプロイが止まるのを確認

バグが混入した際に、テストで処理が失敗し、デプロイが途中で止まることを確認するため、フォークしたリポジトリのコードを修正します。

エディタで FizzBuzz のロジックが記述されているファイル、`src/model/fizzbuzz.js`を開きます。

意図的にバグを混入させるため、

```
if (i % 15 == 0) {
```

と書かれた行を

```
if (i % 10 == 0) {
```

のように修正します。

修正が終わったらコミットし、GitHub 上にプッシュします。

```shell
$ git commit -am bug
$ git push origin master
```

GitHub にプッシュすると、CodePipeline での処理が開始されます。
しかし、CodeBuild でテストが失敗し、ECS へのデプロイは実行されません。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/6785bac4c64b2e508b1134aa19bed74d-640x908.png" alt="" width="640" height="908" class="alignnone size-medium wp-image-349032" />

テストが自動で実行される環境が構築されていたため、バグの混入したバージョンがデプロイされるのを防ぐことができました！

## 7. 再度正しいコードに戻して自動デプロイ

先程の修正をもとに戻すため、`src/model/fizzbuzz.js`　を開きます。

```
if (i % 10 == 0) {
```

のように先程編集した行を

```
if (i % 15 == 0) {
```

のように修正し、GitHub にプッシュします。

```shell
$ git commit -am fixbug
$ git push origin master
```

同様に自動で CodePipeline 上での処理が開始されます。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/e6dddcd46828eb204b0eef8048c50e4f-640x957.png" alt="" width="640" height="957" class="alignnone size-medium wp-image-349044" />

今度はテストが成功するため、デプロイが行われました。

## まとめ

CodePipeline を使用することでデプロイやテストが自動で実行されるようになりました。

煩雑な手作業が自動化されることで人為的ミスを削減し、デプロイにかかる時間を短縮できます。

## 参考資料

### EC2 に CodeDeploy でデプロイするパターン

- [「AWS と GitHub で始める DevOps ハンズオン」の資料を公開します！](https://dev.classmethod.jp/etc/aws-github-devops-hands-on/)

### Pull Requestをビルドしたいパターン

- [CodeBuild で GitHub のプルリクエストを自動ビルドして、結果を表示する](https://dev.classmethod.jp/cloud/aws/codebuild-github-pullrequest-settings/)

### サーバレスパターン

- [CodeDeploy を利用した Lambda のバージョン間の段階デプロイ](https://dev.classmethod.jp/cloud/aws/aws-reinvent-codedeploy-lambda/)
- [AWS SAM を通して CodeDeploy を利用した Lambda 関数のデプロイを理解する](https://dev.classmethod.jp/server-side/serverless/understanding-lambda-deploy-with-codedeploy-using-aws-sam/)

## 補足. 環境の削除

ハンズオンで作成した環境を削除したい場合は以下の手順を参考にしてください。
リソース間の依存関係がある関係で削除に失敗することがあるため、
CloudFormation スタックおよびクローンした GitHub のリポジトリは最後に削除を行ってください。

TODO 画像等も含めて手順を正確に提示

### AWS
 
#### CodePipeline のパイプラインの削除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/e8c7b85b815b9231b93b6c76a1331441-640x531.png" alt="" width="640" height="531" class="alignnone size-medium wp-image-354244" />

パイプラインの画面から編集ボタンをクリック、

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/895f14063d9b4ebfc04657899acd08a3-640x463.png" alt="" width="640" height="463" class="alignnone size-medium wp-image-354245" />

表示された編集画面で削除ボタンをクリックし、表示された確認ダイアログにパイプライン名`hands-on-pipeline`を入力して削除します。

#### CodeBuild のプロジェクトの削除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/ae5122b2851970fae6d119adab33a263-640x309.png" alt="" width="640" height="309" class="alignnone size-medium wp-image-354247" />

CodeBuild　の画面から、プロジェクト`hands-on-project`を選択した状態で、アクションのドロップダウンリストから削除をクリックします。

#### IAM Role の削除　 CodePipeline用 CodeBuild用

CodeBuild用のロール`hands-on-environment-CodeBuild-ServiceRole`を削除します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/899fb48d174d86e98f6bb281fd29727e-640x390.png" alt="" width="640" height="390" class="alignnone size-medium wp-image-354249" />

`hands-on-environment-CodeBuild-ServiceRole`という名前のロールを選択し、ロールを削除します。

CodePipelineでの他のプロジェクトが存在しない場合は`AWS-CodePipeline-Service`という名前のロールも同様の手順で削除しましょう。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/b7f0d8a5fdc73ca64c3baaa31e0639ff-640x379.png" alt="" width="640" height="379" class="alignnone size-medium wp-image-354248" />

#### CodePipeline のアーティファクト保存用 S3 バケット削除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/42dfdf601622493f20cbdffbf8f2c374-640x280.png" alt="" width="640" height="280" class="alignnone size-medium wp-image-354250" />

`codepipeline-ap-northeast-1-****`バケットの中身を確認し、

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/1a31704e05462dde8750e59651f7888e-640x280.png" alt="" width="640" height="280" class="alignnone size-medium wp-image-354251" />

もし、`hands-on-xxx` のフォルダだけしかなければ、バケット自体を削除します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/c72ecc6de66e24061ef1a12a12552659-640x382.png" alt="" width="640" height="382" class="alignnone size-medium wp-image-354252" />

他のフォルダがあれば、フォルダ以下を削除します。

#### ECR リポジトリ内のイメージをすべて削除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/899ad3960898d06dacd6be39a3ca0f85-640x247.png" alt="" width="640" height="247" class="alignnone size-medium wp-image-354254" />

ECSの画面の左側にある、リポジトリのリンクをクリックし、`hands-***`という名前のリポジトリの画面の移動します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/fc89af39613b29fc3112cbb093918216-640x197.png" alt="" width="640" height="197" class="alignnone size-medium wp-image-354255" />

そして、すべてのイメージを選択し、削除を行います。リポジトリ自体は削除しなくても大丈夫です。

#### CloudFormation スタックの削除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/496450dcfb095b95105cd9264d5d67af-640x354.png" alt="" width="640" height="354" class="alignnone size-medium wp-image-354256" />

CloudFormationのコンソールから、`hands-on-environment`という名前のスタックを選択し、削除します

#### hands-on-task-definition の登録を解除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/15a28e586fc12d481269df69037a1e76-640x388.png" alt="" width="640" height="388" class="alignnone size-medium wp-image-354257" />

ECSの画面の左側にある、タスク定義のリンクをクリックし、`hands-on-environment-****`という名前のタスク定義の画面に移動します。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/6eece21cbe5c833bf500aab26afe0019-640x371.png" alt="" width="640" height="371" class="alignnone size-medium wp-image-354259" />

すべてのタスク定義を選択し、登録解除します。

### GitHub

#### クローンしたリポジトリの削除

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/0539d520bebeb1e1782c3f33538578bb-640x214.png" alt="" width="640" height="214" class="alignnone size-medium wp-image-354260" />

フォーク先リポジトリのSettingを開き、

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/3b7190c3bdf6c2d9e5afa64505c426d9-640x341.png" alt="" width="640" height="341" class="alignnone size-medium wp-image-354261" />

一番下のDelete this Repositoryというボタンをクリック、確認ダイアログにリポジトリ名を入力して削除します。