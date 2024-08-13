#!/usr/bin/env bash

set -ex

SCRIPT_DIR=$(cd $(dirname $0); pwd)
DATA_TMP_DIR=$SCRIPT_DIR/../data-tmp
cd $DATA_TMP_DIR

################################################################################
# ksj (国土数値情報) - 行政区域 2024 for administrative city boundary polygon
# Link: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2024.html
# Reference: https://github.com/open-geocoding/open-reverse-geocoder-ja/blob/main/bin/download.sh
mkdir -p ksj
cd ksj
KSJ_ZIP_FNAME=N03-20240101_GML.zip
KSJ_OUT_FNAME=admin-boundary.shp
if [ ! -e $KSJ_OUT_FNAME ]; then
  if [ ! -e $KSJ_ZIP_FNAME ]; then
    wget "https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2024/${KSJ_ZIP_FNAME}"
  fi
  mkdir -p tmp
  unzip -o $KSJ_ZIP_FNAME -d tmp
  ogr2ogr -f "ESRI Shapefile" \
    -lco ENCODING=UTF-8 \
    -oo ENCODING=UTF-8 \
    $KSJ_OUT_FNAME \
    "tmp/N03-20240101.shp"
  rm -rf tmp
fi

cd $DATA_TMP_DIR

################################################################################
# isj (位置参照情報)
# - 大字・町丁目レベル 2023 for town representative point
# - 街区レベル 2023 for block representative point
# Links:
# - https://nlftp.mlit.go.jp/isj/index.html
# - https://nlftp.mlit.go.jp/isj/dls/form/17.0b.html
# - https://nlftp.mlit.go.jp/isj/dls/form/22.0a.html
# Reference: https://github.com/ypresto/imi-enrichment-address/blob/master/tools/download.sh
mkdir -p isj
cd isj

ISJ_TOWN_VERSION=17.0b # 2023 大字・町丁目レベル
ISJ_TOWN_OUT_FNAME=town-point.csv
if [ ! -e $ISJ_TOWN_OUT_FNAME ]; then
  rm -f $ISJ_TOWN_OUT_FNAME
  touch $ISJ_TOWN_OUT_FNAME
  mkdir -p town
  echo '"都道府県コード","都道府県名","市区町村コード","市区町村名","大字町丁目コード","大字町丁目名","緯度","経度","原典資料コード","大字・字・丁目区分コード"' > $ISJ_TOWN_OUT_FNAME
  for no in `seq -w 1000 1000 47000` ; do
    zip="${no}-${ISJ_TOWN_VERSION}.zip"
    if [ ! -e "town/${zip}" ]; then
      wget "https://nlftp.mlit.go.jp/isj/dls/data/${ISJ_TOWN_VERSION}/${zip}" -O "town/${zip}"
    fi
    # unzip only town level csv
    unzip -p "town/${zip}" '*.[cC][sS][vV]' | iconv -f CP932 -t utf8 | tail -n +2 >> $ISJ_TOWN_OUT_FNAME
  done
fi

ISJ_BLOCK_VERSION=22.0a # 2023 街区レベル
ISJ_BLOCK_OUT_FNAME=block-point.csv
if [ ! -e $ISJ_BLOCK_OUT_FNAME ]; then
  rm -f $ISJ_BLOCK_OUT_FNAME
  touch $ISJ_BLOCK_OUT_FNAME
  mkdir -p block
  echo '"都道府県名","市区町村名","大字・丁目名","小字・通称名","街区符号・地番","座標系番号","Ｘ座標","Ｙ座標","緯度","経度","住居表示フラグ","代表フラグ","更新前履歴フラグ","更新後履歴フラグ"' > $ISJ_BLOCK_OUT_FNAME
  for no in `seq -w 1000 1000 47000` ; do
    zip="${no}-${ISJ_BLOCK_VERSION}.zip"
    if [ ! -e "block/${zip}" ]; then
      wget "https://nlftp.mlit.go.jp/isj/dls/data/${ISJ_BLOCK_VERSION}/${zip}" -O "block/${zip}"
    fi
    # unzip only block level csv
    unzip -p "block/${zip}" '*.[cC][sS][vV]' | iconv -f CP932 -t utf8 | tail -n +2 >> $ISJ_BLOCK_OUT_FNAME
  done
fi

cd $DATA_TMP_DIR

################################################################################
# estat (e-Stat政府統計ポータル) for census town boundary polygon
# - 境界データ/小地域/国勢調査/2020年/小地域（町丁・字等）（JGD2011）/世界測地系緯度経度・Shapefile
# Link:
# - https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521&toukeiYear=2020&serveyId=A002005212020&datum=2011
# - https://www.e-stat.go.jp/help/data-definition-information/downloaddata/A002005212020.pdf
mkdir -p estat
cd estat

ESTAT_OUT_FNAME=census-boundary.shp
if [ ! -e $ESTAT_OUT_FNAME ]; then
  mkdir -p zip
  mkdir -p shp
  for no in `seq -w 1 1 47` ; do
    zip="A002005212020DDSWC${no}-JGD2011.zip"
    if [ ! -e "zip/${zip}" ]; then
      wget "https://www.e-stat.go.jp/gis/statmap-search/data?dlserveyId=A002005212020&code=${no}&coordSys=1&format=shape&downloadType=5&datum=2011" -O "zip/${zip}"
    fi
    unzip -jo "zip/${zip}" -d shp
    append_option=""
    if [ "${no}" != "01" ]; then
      append_option="-update -append"
    fi
    ogr2ogr -f "ESRI Shapefile" \
      -lco ENCODING=UTF-8 \
      -oo ENCODING=CP932 \
      ${append_option} \
      $ESTAT_OUT_FNAME \
      "shp/r2ka${no}.shp"
  done
  rm -rf shp
fi

cd $DATA_TMP_DIR

################################################################################
# jusho (住居表示住所) for resident frontage point
# Links:
# - https://www.gsi.go.jp/kihonjohochousa/jukyo_jusho.html
# - https://www.gsi.go.jp/common/000255933.pdf
mkdir -p jusho
cd jusho

JUSHO_OUT_FNAME=resident-point.csv
if [ ! -e $JUSHO_OUT_FNAME ]; then
  touch $JUSHO_OUT_FNAME
  mkdir -p html
  mkdir -p zip
  echo '市区町村コード,町又は字の名称,街区符号,基礎番号,住所コード（可読）,住所コード（数値）,経度,緯度,地図情報レベル' > $JUSHO_OUT_FNAME
  for no in `seq -w 1 1 47` ; do
    html="${no}.html"
    if [ ! -e "html/${html}" ]; then
      wget "https://saigai.gsi.go.jp/jusho/download/pref/${no}.html" -O "html/${html}"
    fi
  done
  grep -h '.zip">' html/*.html | sed -n 's/.*<a href="\.\.\/data\/\([0-9]\{5\}\.zip\)">.*/\1/p' | while read zip ; do
    if [ ! -e "zip/${zip}" ]; then
      wget "https://saigai.gsi.go.jp/jusho/download/data/${zip}" -O "zip/${zip}"
    fi
    unzip -p "zip/${zip}" '*.[cC][sS][vV]' | tail -n +2 >> $JUSHO_OUT_FNAME
  done
fi

cd $DATA_TMP_DIR
