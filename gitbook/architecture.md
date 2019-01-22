## ハンズオンで構築する構成

![構成図](https://cacoo.com/diagrams/Bik1Om7JvTVGzpfj-5F49C.png)

今回は上記の図のような構成を構築します。

- GitHub にコードがプッシュされると CodePipeline での処理が開始されます。
- CodeBuild ではテスト、Docker イメージの作成および作成したイメージの ECR へのプッシュを行います。
- CodeBuild での処理が成功したら ECS に新しいバージョンのイメージがデプロイされます。