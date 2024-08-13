import { getDataUrl } from './get-data-url'

/**
 * @type {import('maplibre-gl').Style}
 */
export const mapStyle = {
  version: 8,
  sources: {
    'osm-bright-ja-raster': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png',
      ],
      maxzoom: 19,
      tileSize: 256,
      attribution:
        '<a href="http://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a> contributors',
    },
    'gsi-pale-raster': {
      type: 'raster',
      tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],
      minzoom: 5,
      maxzoom: 18,
      tileSize: 256,
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル:淡色地図</a>',
    },
    'admin-boundary': {
      type: 'vector',
      url: `pmtiles://${getDataUrl('ADMIN_BOUNDARY_PMTILES_URL', 'pmtiles/admin-boundary.pmtiles')}`,
      minzoom: 5,
      maxzoom: 14,
      attribution:
        '<a href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2024.html:" target="_blank">「国土数値情報（行政区域データ）」</a>（国土交通省）を加工して作成',
    },
    'census-boundary': {
      type: 'vector',
      url: `pmtiles://${getDataUrl('CENSUS_BOUNDARY_PMTILES_URL', 'pmtiles/census-boundary.pmtiles')}`,
      minzoom: 10,
      maxzoom: 14,
      attribution:
        '<a href="https://www.e-stat.go.jp/gis/statmap-search?page=1&type=2&aggregateUnitForBoundary=A&toukeiCode=00200521&toukeiYear=2020&serveyId=A002005212020&datum=2011" target="_blank">「令和２年国勢調査 町丁・字等別境界データ」</a>（総務省統計局）を加工して作成',
    },
    'town-point': {
      type: 'vector',
      url: `pmtiles://${getDataUrl('TOWN_POINT_PMTILES_URL', 'pmtiles/town-point.pmtiles')}`,
      minzoom: 10,
      maxzoom: 14,
      attribution:
        '<a href="https://nlftp.mlit.go.jp/isj/index.html" target="_blank">「位置参照情報ダウンロードサービス（大字・町丁目レベル）」</a>（国土交通省）を加工して作成',
    },
    'block-point': {
      type: 'vector',
      url: `pmtiles://${getDataUrl('BLOCK_POINT_PMTILES_URL', 'pmtiles/block-point.pmtiles')}`,
      minzoom: 12,
      maxzoom: 14,
      attribution:
        '<a href="https://nlftp.mlit.go.jp/isj/index.html" target="_blank">「位置参照情報ダウンロードサービス（街区レベル）」</a>（国土交通省）を加工して作成',
    },
  },
  layers: [
    {
      id: 'osm-bright-ja-raster',
      type: 'raster',
      source: 'osm-bright-ja-raster',
      description: 'OpenStreetMap',
    },
    {
      id: 'gsi-pale-raster',
      type: 'raster',
      source: 'gsi-pale-raster',
      layout: {
        visibility: 'none',
      },
    },
    {
      id: 'admin-boundary',
      type: 'fill',
      source: 'admin-boundary',
      'source-layer': 'admin-boundary',
      minzoom: 5,
      paint: {
        'fill-color': '#008800',
        'fill-outline-color': '#008800',
        'fill-opacity': 0.4,
      },
    },
    {
      id: 'census-boundary',
      type: 'fill',
      source: 'census-boundary',
      'source-layer': 'census-boundary',
      minzoom: 10,
      paint: {
        'fill-color': '#0000ff',
        'fill-outline-color': '#0000ff',
        'fill-opacity': 0.4,
      },
    },
    {
      id: 'town-point',
      type: 'circle',
      source: 'town-point',
      'source-layer': 'town-point',
      minzoom: 12,
      paint: {
        'circle-radius': 3,
        'circle-color': '#ff0000',
        'circle-opacity': 0.6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ff0000',
        'circle-stroke-opacity': 1.0,
      },
    },
    {
      id: 'block-point',
      type: 'circle',
      source: 'block-point',
      'source-layer': 'block-point',
      minzoom: 14,
      paint: {
        'circle-radius': 3,
        'circle-color': '#00ff00',
        'circle-opacity': 0.6,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#00ff00',
        'circle-stroke-opacity': 1.0,
      },
    },
  ],
}

export const appendResidentPoint = async (mapStyle) => {
  // 電子国土基本図（地名情報）「住居表示住所」は測量成果の複製・使用承認申請が必要となるため
  // ローカル環境、かつ、ファイル存在時(ヘッダ取得可能時)のみ、ソース・レイヤに追加
  if (location.host.startsWith('localhost')) {
    const residentPointUrl = getDataUrl(null, 'pmtiles/resident-point.pmtiles')
    const response = await fetch(residentPointUrl, { method: 'HEAD' })
    if (response.ok) {
      mapStyle.sources['resident-point'] = {
        type: 'vector',
        url: `pmtiles://${residentPointUrl}`,
        minzoom: 16,
        maxzoom: 17,
        attribution:
          '<a href="https://www.gsi.go.jp/kihonjohochousa/jukyo_jusho.html" target="_blank">電子国土基本図（地名情報）「住居表示住所」</a>（国土交通省）を加工して作成',
      }
      mapStyle.layers.push({
        id: 'resident-point',
        type: 'circle',
        source: 'resident-point',
        'source-layer': 'resident-point',
        minzoom: 12,
        paint: {
          'circle-radius': 3,
          'circle-color': '#0000ff',
          'circle-opacity': 0.6,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#0000ff',
          'circle-stroke-opacity': 1.0,
        },
      })
      return true
    }
  }
  return false
}
