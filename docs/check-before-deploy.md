### 動作確認

事前にデプロイしてあるサンプルアプリケーションの現時点での動作を確認してみましょう。

サンプルアプリケーションのアクセス先の情報を取得するため、以下のリンクより CloudFormation のコンソールに移動します。

[CloudFormation のコンソール](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks?filter=active)

`StackSet-hands-on-environment-XXXXXXX`という名前のスタックの出力の中に`AppURL`というキーで URL が出力されています。

![](https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/11/FireShot-Capture-24-The-page-is-temporarily-unavailable_-http___hands-o-alb-101l4qnweepgi-1.png)

こちらのURLにアクセスしてみると、まだソースコードがデプロイされていないため、Nginxのエラー画面が表示されています。
