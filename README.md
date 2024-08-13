# jp-address-data-sandbox

## 概要

日本の位置座標を持つ住所データについて、クラウドネイティブなデータ形式(PMTiles、FlatGeobufなど)に変換し、
Webブラウザ上での地図表示や逆ジオコーディングなど、様々な用途で利用できないか調査するための実験用のリポジトリです。

主に [geolonia/poc-reverse-geocoder](https://github.com/geolonia/poc-reverse-geocoder) と
[open-geocoding/open-reverse-geocoder-ja](https://github.com/open-geocoding/open-reverse-geocoder-ja) の
ベクトルタイル生成の仕組みからインスピレーションを受けて開発しました。

## Webアプリ

(予定) https://sanak.github.io/jp-address-data-sandbox/

## リリースデータ

**注意: GitHub Release上の最新アセットダウンロードURLを直接指定してのPMTilesアクセスはできませんので、お手元にダウンロード後、ローカル開発環境より確認してください。**

### admin-boundary

* 出典(ファイル名 | 最新アセットダウンロードURL):
  * PMTiles: `admin-boundary.pmtiles` | https://github.com/sanak/jp-address-data-sandbox/releases/download/v0.1.0/admin-boundary.pmtiles
* 原初データ出典: [「国土数値情報（行政区域データ 2024年（令和6年）版）」（国土交通省）](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2024.html)
  * 利用規約: [国土数値情報ダウンロードサイトコンテンツ利用規約（政府標準利用規約準拠版）](https://nlftp.mlit.go.jp/ksj/other/agreement.html#agree-01)
  * データ仕様: [「国土数値情報（行政区域データ 2024年（令和6年）版）」（国土交通省）](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2024.html)
* 概要: [「国土数値情報（行政区域データ 2024年（令和6年）版）」（国土交通省）](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2024.html) を加工して作成
* レイヤ名: `admin-boundary`
* ジオメトリ種別: MultiPolygon
  * [mapshaper](https://github.com/mbloch/mapshaper) によるディゾルブ処理を行っています。
* 属性:
  * `pref_name`: 都道府県名 (= `[N03_001]`)
  * `city_name`: 市区町村名 (= `[N03_003] + [N03_004] + [N03_005]`)
    * 元データの 郡名(`N03_003`)、市区町村名(`N03_004`)、政令指定都市の行政区名(`N03_005`) を結合しています。
  * `city_code`: 市区町村(全国地方公共団体)コード (= `[N03_007]`)
* ズームレベル: 5-14
* ライセンス: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.ja)

### census-boundary

* 出典(ファイル名 | 最新アセットダウンロードURL):
  * PMTiles: `census-boundary.pmtiles` | https://github.com/sanak/jp-address-data-sandbox/releases/download/v0.1.0/census-boundary.pmtiles
* 原初データ出典: [「令和２年国勢調査 町丁・字等別境界データ 2020年（JGD2011）」（総務省統計局）](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521&toukeiYear=2020&serveyId=A002005212020&datum=2011)
  * 利用規約: [利用規約 | 政府統計の総合窓口](https://www.e-stat.go.jp/terms-of-use)
  * データ仕様(PDF): [令和２年国勢調査 町丁・字等境界データ データベース定義書](https://www.e-stat.go.jp/help/data-definition-information/downloaddata/A002005212020.pdf)
* 概要: [「令和２年国勢調査 町丁・字等別境界データ 2020年（JGD2011）」（総務省統計局）](https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521&toukeiYear=2020&serveyId=A002005212020&datum=2011) を加工して作成
* レイヤ名: `census-boundary`
* ジオメトリ種別: MultiPolygon
  * [mapshaper](https://github.com/mbloch/mapshaper) によるディゾルブ処理を行っています。
* 属性:
  * `city_name`: 市区町村名 (= `[CITY_NAME]`)
  * `city_code`: 市区町村コード (= `[PREF] + [CITY]`)
    * 元データの 都道府県番号(`PREF`)、市区町村番号(`CITY`) を結合しています。
  * `town_name`: 町丁・字等名称 (= `[S_NAME]`)
  * `town_code`: 町丁・字等コード (= `[KEY_CODE]` (= `[PREF] + [KEYCODE2]`))
  * `water`: 水面調査区フラグ (= `[HCODE] == 8154` )
* ズームレベル: 10-14
* ライセンス: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.ja)

### town-point

* 出典(ファイル名 | 最新アセットダウンロードURL):
  * PMTiles: `town-point.pmtiles` | https://github.com/sanak/jp-address-data-sandbox/releases/download/v0.1.0/town-point.pmtiles
* 原初データ出典: [「位置参照情報ダウンロードサービス（大字・町丁目レベル）令和5年」（国土交通省）](https://nlftp.mlit.go.jp/isj/index.html)
  * 利用規約: [位置参照情報ダウンロードサービスコンテンツ利用規約](https://nlftp.mlit.go.jp/ksj/other/agreement.html#agree-03)
  * データ仕様: [大字・町丁目レベル位置参照情報 (2023年版) データ形式](https://nlftp.mlit.go.jp/isj/dls/form/17.0b.html)
* 概要: [「位置参照情報ダウンロードサービス（大字・町丁目レベル）令和5年」（国土交通省）](https://nlftp.mlit.go.jp/isj/index.html) を加工して作成
* レイヤ名: `town-point`
* ジオメトリ種別: Point
* 属性: [town-point.vrt](data-tmp/isj/town-point.vrt)
  * `pref_code`: `[都道府県コード]`
  * `pref_name`: `[都道府県名]`
  * `city_code`: `[市区町村コード]`
  * `city_name`: `[市区町村名]`
  * `town_code`: `[大字町丁目コード]`
  * `town_name`: `[大字町丁目名]`
  * `scr_code`: `[原典資料コード]`
  * `town_type`: `[大字・字・丁目区分コード]`
* ズームレベル: 10-14
* ライセンス: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.ja)

### block-point

* 出典(ファイル名 | 最新アセットダウンロードURL):
  * PMTiles: `block-point.pmtiles` | https://github.com/sanak/jp-address-data-sandbox/releases/download/v0.1.0/block-point.pmtiles
* 原初データ出典: [「位置参照情報ダウンロードサービス（街区レベル）令和5年」（国土交通省）](https://nlftp.mlit.go.jp/isj/index.html)
  * 利用規約: [位置参照情報ダウンロードサービスコンテンツ利用規約](https://nlftp.mlit.go.jp/ksj/other/agreement.html#agree-03)
  * データ仕様: [街区レベル位置参照情報 (2023年版) データ形式](https://nlftp.mlit.go.jp/isj/dls/form/22.0a.html)
* 概要: [「位置参照情報ダウンロードサービス（街区レベル）令和5年」（国土交通省）](https://nlftp.mlit.go.jp/isj/index.html) を加工して作成
* レイヤ名: `block-point`
* ジオメトリ種別: Point
* 属性: [block-point.vrt](data-tmp/isj/block-point.vrt)
  * `pref_name`: `[都道府県名]`
  * `city_name`: `[市区町村名]`
  * `town_name`: `[大字・丁目名]`
  * `koaza_aka_name`: `[小字・通称名]`
  * `block_parcel_num`: `[街区符号・地番]`
  * `resident_address_flag`: `[住居表示フラグ]`
  * `rep_flag`: `[代表フラグ]`
* ズームレベル: 12-14
* ライセンス: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.ja)

## 開発関連

### 共通

必須要件:
* Node.js: 20.10.0 以上

```bash
npm install
```

### Webアプリ

確認はできていませんが、macOS以外の環境でも動作すると思います。

1. 各PMTilesファイルを最新リリースからダウンロードして `data` フォルダ内に配置
2. 以下で開発モードでWebアプリを起動
   ```bash
   npm run dev
   ```
3. ブラウザから http://localhost:5173/jp-address-data-sandbox/ にアクセスすると、Webアプリが表示されます。

### データのダウンロード・変換

現時点では、macOS + Homebrew環境でのみ、動作を確認しています。

必須要件:
* GDAL (3.9.0 以上推奨)
* Tippecanoe (2.58.0 以上推奨)
* wget
* unzip

```bash
npm run download
npm run build:data
```

* リリースデータには含めていませんが、 [電子国土基本図（地名情報）「住居表示住所」（国土交通省）](https://www.gsi.go.jp/kihonjohochousa/jukyo_jusho.html) のデータも含みます。
* `data/flatgeobuf` フォルダ内のFlatGeobuf形式のファイル、 `data/pmtiles` フォルダ内にPMTiles形式のファイルが生成されますので、FlatGeobufファイルについてはQGIS、PMTilesファイルについては [PMTiles Viewer](https://pmtiles.io/) などで詳細を確認できます。

## ライセンス

* ソースコード: [MIT](https://opensource.org/license/MIT)
* リリースデータ: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode.ja)
