# imi-enrichment-address β

入力となる JSON-LD に含まれる `住所>表記 をもつ 場所型` または `表記をもつ住所型` に対して各種のプロパティを補完して返すESモジュールです。

入力が `住所>表記 をもつ 場所型` の場合には地理座標と住所型の各プロパティが補完されます。

[![esmodules](https://taisukef.github.com/denolib/esmodulesbadge.svg)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)
[![deno](https://taisukef.github.com/denolib/denobadge.svg)](https://deno.land/)

## API (Node.js)

- 入力 (input) : 変換対象となる JSON または住所文字列
- 出力 : 変換結果の JSON-LD オブジェクトを返却する Promise ※ 変換は非同期で行うために Promise が返されます

```
import IMIEnrichmentAddress from "./IMIEnrichmentAddress.mjs";

console.log(await IMIEnrichmentAddress("福井県鯖江市新横江2-3-4"));
```
toplevel await 非対応のブラウザでは、async関数内で使用してください。

**input1.json**

```input.json
{
  "@type": "場所型",
  "住所" : {
    "@type": "住所型",
    "表記" : "霞が関2-1-10"
  }
}
```

**output1.json**

```
{
  "@type": "場所型",
  "住所": {
    "@type": "住所型",
    "表記": "霞が関2-1-10",
    "都道府県": "東京都",
    "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
    "市区町村": "千代田区",
    "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
    "町名": "霞が関",
    "丁目": "2",
    "番地": "1",
    "号": "10"
  },
  "地理座標": {
    "@type": "座標型",
    "緯度": "35.675551",
    "経度": "139.750413"
  }
}
```

入力が `表記をもつ住所型` の場合には住所型のプロパティだけが補完されます。

**input2.json**

```input.json
{
  "@type": "住所型",
  "表記" : "霞が関2-1-10"
}
```

**output2.json**

```
{
  "@type": "住所型",
  "表記": "霞が関2-1-10",
  "都道府県": "東京都",
  "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
  "市区町村": "千代田区",
  "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
  "町名": "霞が関",
  "丁目": "2",
  "番地": "1",
  "号": "10"
}
```



- [総務省統計局 e-Stat 統計LOD:地域に関するデータ:統計に用いる標準地域コード](http://data.e-stat.go.jp/lodw/provdata/lodRegion#3-2-1) および [国土交通省 国土政策局 国土情報課:位置参照情報ダウンロードサービス:大字・町丁目レベル位置参照情報](http://nlftp.mlit.go.jp/isj/index.html) のデータをもとに各種情報が補完されます
- 付与される地理座標は大字・町丁目レベル位置参照情報のデータによるもので、大字・町丁目の代表点に相当します (番地・号レベルの緯度経度ではありません)
- それぞれのデータをダウンロードして加工したものが本パッケージにバンドルされています
- 町名・丁目レベルまでの地名についてダウンロードデータをもとに実在性が検証されます
- 町名・丁目が実在した場合、それ以下の番地・号は表記をもとに正規化が行われます
- 所与の住所文字列に合致するような地名がない場合にはエラーが返されます


**output_with_error.json**

```
{
  "@context": "https://imi.go.jp/ns/core/context.jsonld",
  "@type": "場所型",
  "住所": {
    "@type": "住所型",
    "表記": "霞が関99",
    "都道府県": "東京都",
    "都道府県コード": "http://data.e-stat.go.jp/lod/sac/C13000",
    "市区町村": "千代田区",
    "市区町村コード": "http://data.e-stat.go.jp/lod/sac/C13101",
    "町名": "霞が関"
  },
  "メタデータ": {
    "@type": "文書型",
    "説明": "該当する丁目が見つかりません"
  }
}
```

以下のエラーが検出されます

- 該当する地名が見つからない場合 (海外住所、都道府県名の間違いなど)
- 該当する市区町村名が見つからない場合（*未対応）
- 該当する市区町村が複数存在する場合（「府中市」など）（*未対応）
- 該当する町名が見つからない場合（*未対応）
- 指定された丁目が存在しない場合（「霞が関五丁目」など）（*未対応）


## テスト

以下の手順でテストを実行します（現状、多くが通りません）

```
$ cd test
$ deno test -A
```

## ブラウザビルド(参考情報)

`imi-enrichment-address` はESモジュールとしてブラウザ上で直接動作します。  
[geocode](https://github.com/code4sabae/geocode)の仕様により、初期サイズ100KB程度、使用する市区町村を検索するごとに80KB程度のデータがキャッシュされます。

## 依存モジュール

住所ジオコーディングモジュール geocode.mjs  
https://github.com/code4sabae/lgcode  

地方公共団体コードモジュール lgcode.mjs  
https://github.com/code4sabae/lgcode  

## 出典

本ライブラリは IMI 情報共有基盤 コンポーネントツール <https://info.gbiz.go.jp/tools/imi_tools/> の「全角-半角統一コンポーネント」をESモジュール対応したものです。
