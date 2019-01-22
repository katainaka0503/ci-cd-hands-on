
## テストが失敗すると自動デプロイが止まるのを確認

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
git commit -am bug
git push origin master
```

GitHub にプッシュすると、CodePipeline での処理が開始されます。
しかし、CodeBuild でテストが失敗し、ECS へのデプロイは実行されません。

<img src="https://cdn-ssl-devio-img.classmethod.jp/wp-content/uploads/2018/08/6785bac4c64b2e508b1134aa19bed74d-640x908.png" alt="" width="640" height="908" class="alignnone size-medium wp-image-349032" />

テストが自動で実行される環境が構築されていたため、バグの混入したバージョンがデプロイされるのを防ぐことができました！