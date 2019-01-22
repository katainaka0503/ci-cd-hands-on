## パイプライン構築の準備

### サンプルアプリケーションのフォークおよびクローン

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

### ハンズオン用環境構築用の CloudFormation の実行

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