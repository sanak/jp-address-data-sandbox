#!/usr/bin/env bash

set -ex

SCRIPT_DIR=$(cd $(dirname $0); pwd)
DATA_TMP_DIR=$SCRIPT_DIR/../data-tmp
DATA_DIR=$SCRIPT_DIR/../data

################################################################################
# ksj (国土数値情報) - 行政区域 2025 for administrative city boundary polygon
# Link: https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2025.html
# Reference:
# - https://github.com/open-geocoding/open-reverse-geocoder-ja/blob/main/bin/download.sh
# - https://github.com/geolonia/poc-reverse-geocoder/blob/main/bin/build.sh
cd $DATA_TMP_DIR/ksj
KSJ_GJL_PATH=$DATA_TMP_DIR/ksj/admin-boundary.geojsonl
KSJ_FGB_PATH=flatgeobuf/admin-boundary.fgb
KSJ_PMT_PATH=pmtiles/admin-boundary.pmtiles
if [ ! -e $KSJ_GJL_PATH ]; then
  npx mapshaper -i ./admin-boundary.shp \
    -dissolve N03_007 copy-fields=N03_001,N03_003,N03_004,N03_005 \
    -sort 'this.N03_007' ascending \
    -o precision=0.000001 format=shapefile ./admin-boundary-mapshaped.shp

  ogr2ogr -f GeoJSONSeq /dev/stdout ./admin-boundary-mapshaped.shp \
    | node $SCRIPT_DIR/optimize-admin-boundary.js > $KSJ_GJL_PATH
fi
cd $DATA_DIR
if [ ! -e $KSJ_FGB_PATH ]; then
  ogr2ogr -f FlatGeobuf -nlt PROMOTE_TO_MULTI \
    $KSJ_FGB_PATH \
    $KSJ_GJL_PATH
fi
if [ ! -e $KSJ_PMT_PATH ]; then
  tippecanoe -Z5 -z14 -o $KSJ_PMT_PATH --force \
    -l admin-boundary \
    $KSJ_GJL_PATH \
    -pf -pk -P
fi

################################################################################
# isj (位置参照情報)
# - 大字・町丁目レベル 2024 for town representative point
# - 街区レベル 2024 for block representative point
# Links:
# - https://nlftp.mlit.go.jp/isj/index.html
# - https://nlftp.mlit.go.jp/isj/dls/form/18.0b.html
# - https://nlftp.mlit.go.jp/isj/dls/form/23.0a.html
cd $DATA_TMP_DIR/isj
ISJ_TOWN_GJL_PATH=$DATA_TMP_DIR/isj/town-point.geojsonl
ISJ_TOWN_FGB_PATH=flatgeobuf/town-point.fgb
ISJ_TOWN_PMT_PATH=pmtiles/town-point.pmtiles
if [ ! -e $ISJ_TOWN_GJL_PATH ]; then
  ogr2ogr -f GeoJSONSeq \
    $ISJ_TOWN_GJL_PATH \
    ./town-point.vrt
fi
cd $DATA_DIR
if [ ! -e $ISJ_TOWN_FGB_PATH ]; then
  ogr2ogr -f FlatGeobuf \
    $ISJ_TOWN_FGB_PATH \
    $ISJ_TOWN_GJL_PATH
fi
if [ ! -e $ISJ_TOWN_PMT_PATH ]; then
  tippecanoe -Z10 -z14 -o $ISJ_TOWN_PMT_PATH --force \
    -l town-point \
    -r1 $ISJ_TOWN_GJL_PATH \
    -pf -pk -P
fi

cd $DATA_TMP_DIR/isj
ISJ_BLOCK_GJL_PATH=$DATA_TMP_DIR/isj/block-point.geojsonl
ISJ_BLOCK_FGB_PATH=flatgeobuf/block-point.fgb
ISJ_BLOCK_PMT_PATH=pmtiles/block-point.pmtiles
if [ ! -e $ISJ_BLOCK_GJL_PATH ]; then
  ogr2ogr -f GeoJSONSeq \
    $ISJ_BLOCK_GJL_PATH \
    ./block-point.vrt
fi
cd $DATA_DIR
if [ ! -e $ISJ_BLOCK_FGB_PATH ]; then
  ogr2ogr -f FlatGeobuf \
    $ISJ_BLOCK_FGB_PATH \
    $ISJ_BLOCK_GJL_PATH
fi
if [ ! -e $ISJ_BLOCK_PMT_PATH ]; then
  tippecanoe -Z12 -z14 -o $ISJ_BLOCK_PMT_PATH --force \
    -l block-point \
    -r1 $ISJ_BLOCK_GJL_PATH \
    -pf -pk -P
fi

################################################################################
# estat (e-Stat政府統計ポータル) for census town boundary polygon
# - 境界データ/小地域/国勢調査/2020年/小地域（町丁・字等）（JGD2011）/世界測地系緯度経度・Shapefile
# Link:
# - https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521&toukeiYear=2020&serveyId=A002005212020&datum=2011
# - https://www.e-stat.go.jp/help/data-definition-information/downloaddata/A002005212020.pdf
cd $DATA_TMP_DIR/estat
ESTAT_GJL_PATH=$DATA_TMP_DIR/estat/census-boundary.geojsonl
ESTAT_FGB_PATH=flatgeobuf/census-boundary.fgb
ESTAT_PMT_PATH=pmtiles/census-boundary.pmtiles
if [ ! -e $ESTAT_GJL_PATH ]; then
  npx mapshaper -i ./census-boundary.shp \
    -dissolve KEY_CODE copy-fields=PREF,CITY,PREF_NAME,CITY_NAME,S_NAME,HCODE,KEYCODE2 \
    -sort 'this.KEYCODE' ascending \
    -o precision=0.000001 format=shapefile ./census-boundary-mapshaped.shp

  ogr2ogr -f GeoJSONSeq /dev/stdout ./census-boundary-mapshaped.shp \
    | node $SCRIPT_DIR/optimize-census-boundary.js > $ESTAT_GJL_PATH
fi
cd $DATA_DIR
if [ ! -e $ESTAT_FGB_PATH ]; then
  ogr2ogr -f FlatGeobuf -nlt PROMOTE_TO_MULTI \
    $ESTAT_FGB_PATH \
    $ESTAT_GJL_PATH
fi
if [ ! -e $ESTAT_PMT_PATH ]; then
  tippecanoe -Z10 -z14 -o $ESTAT_PMT_PATH --force \
    -l census-boundary \
    $ESTAT_GJL_PATH \
    -pf -pk -P
fi

################################################################################
# jusho (住居表示住所) for resident frontage point
# Links:
# - https://www.gsi.go.jp/kihonjohochousa/jukyo_jusho.html
# - https://www.gsi.go.jp/common/000255933.pdf
cd $DATA_TMP_DIR/jusho
JUSHO_GJL_PATH=$DATA_TMP_DIR/jusho/resident-point.geojsonl
JUSHO_FGB_PATH=flatgeobuf/resident-point.fgb
JUSHO_PMT_PATH=pmtiles/resident-point.pmtiles
if [ ! -e $JUSHO_GJL_PATH ]; then
  ogr2ogr -f GeoJSONSeq \
    $JUSHO_GJL_PATH \
    ./resident-point.vrt
fi
cd $DATA_DIR
if [ ! -e $JUSHO_FGB_PATH ]; then
  ogr2ogr -f FlatGeobuf \
    $JUSHO_FGB_PATH \
    $JUSHO_GJL_PATH
fi
if [ ! -e $JUSHO_PMT_PATH ]; then
  tippecanoe -Z16 -z17 -o $JUSHO_PMT_PATH --force \
    -l resident-point \
    -r1 $JUSHO_GJL_PATH \
    -pf -pk -P
fi

cd $DATA_TMP_DIR
