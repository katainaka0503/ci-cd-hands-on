
## 手動デプロイしてみる（講師が実演します。読み飛ばし可）

ecs-deploy のようなデプロイに便利なツールもありますが、CodeBuild で行う処理との対比をわかりやすくするため、ここではそういったものは使わずにデプロイを実行します。

まずはデプロイされたことがわかりやすくするため、画面を修正します。

```shell
npm install
vim template/views/index.ejs
npm test
git commit -am "manual deploy"
```

つぎに以下のコマンドを実行し、手動でデプロイを実行します。

まず、手元で Docker イメージを構築し、ECR にプッシュします。

```
$(aws ecr get-login --no-include-email --region ap-northeast-1)

IMAGE_REPOSITORY_NAME=`aws ssm get-parameter --name "IMAGE_REPOSITORY_NAME" --region ap-northeast-1 | jq -r .Parameter.Value`
IMAGE_TAG=`git rev-parse HEAD`
docker build -t $IMAGE_REPOSITORY_NAME:$IMAGE_TAG .
docker push $IMAGE_REPOSITORY_NAME:$IMAGE_TAG

echo $IMAGE_REPOSITORY_NAME:$IMAGE_TAG
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
