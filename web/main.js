import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css'
import '@watergis/maplibre-gl-legend/dist/maplibre-gl-legend.css'
import '@maplibre/maplibre-gl-inspect/dist/maplibre-gl-inspect.css'
import './ctrl-overrides.css'

import maplibregl from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder'
import { MaplibreLegendControl } from '@watergis/maplibre-gl-legend'
import MaplibreInspect from '@maplibre/maplibre-gl-inspect'
import { mapStyle, appendResidentPoint } from './map-style.js'
import { fetchMuniCodes } from './fetch-muni-codes.js'

const muniCodes = {}
fetchMuniCodes(muniCodes)

const protocol = new pmtiles.Protocol()
maplibregl.addProtocol('pmtiles', protocol.tile)

const map = new maplibregl.Map({
  container: 'map',
  zoom: 5,
  center: [138, 38],
  minZoom: 5,
  maxZoom: 18,
  dragRotate: false,
  hash: true,
  localIdeographFontFamily: ['sans-serif'],
  style: mapStyle,
  attributionControl: {
    compact: false,
  },
})

map.on('load', async () => {
  const legendTargets = {
    'osm-bright-ja-raster': 'OpenStreetMap',
    'gsi-pale-raster': '地理院タイル:淡色地図',
    'admin-boundary': 'admin-boundary',
    'census-boundary': 'census-boundary',
    'town-point': 'town-point',
    'block-point': 'block-point',
  }
  if (location.host.startsWith('localhost')) {
    if (await appendResidentPoint(mapStyle)) {
      map.setStyle(mapStyle)
      legendTargets['resident-point'] = 'resident-point'
    }
  }
  map.addControl(
    new MaplibreLegendControl(legendTargets, {
      title: '凡例',
      showDefault: true,
      onlyRendered: false,
    }),
    'bottom-right',
  )
})

// 参考リンク:
// * https://github.com/office-shirado/Chzuemon/blob/main/js/main_006.js#L225-L263
// * https://github.com/shiwaku/aist-dem-with-csmap-on-maplibre/blob/main/index.html#L280-L320
// * https://github.com/satoshi7190/sd-2024-5-sample/blob/main/src/main.ts#L489-L526
// * https://github.com/maplibre/maplibre-gl-geocoder/blob/v1.5.0/debug/index.js#L32-L69
// ジオコーダー（国土地理院 地名検索・住所取得API）
const geocoderApi = {
  forwardGeocode: async (config) => {
    const features = []
    const textPrefix = config.query.substr(0, 3)
    try {
      const request = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${config.query}`
      const response = await fetch(request)
      const geojson = await response.json()

      for (var i = 0; i < geojson.length; i++) {
        if (geojson[i].properties.title.indexOf(textPrefix) !== -1) {
          const point = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: geojson[i].geometry.coordinates,
            },
            place_name: geojson[i].properties.title,
            properties: geojson[i].properties,
            text: geojson[i].properties.title,
            place_type: ['place'],
            center: geojson[i].geometry.coordinates,
          }
          features.push(point)
        }
      }
    } catch (e) {
      console.error(`Failed to forwardGeocode with error: ${e}`)
    }
    return {
      features: features,
    }
  },
  // 逆ジオコーディング処理を実行
  reverseGeocode: async (config) => {
    // 入力時と逆順で入る
    const lat = config.query[1]
    const lng = config.query[0]

    if (lat < 23.8 || lat > 45.8 || lng < 122.6 || lng > 149.2) {
      alert('日本国内の 緯度,経度 を指定してください')
      return {
        features: [],
      }
    }
    let placeName = `'緯度: ${lat}, 経度: ${lng}`

    try {
      const request = `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`
      const response = await fetch(request)
      const json = await response.json()
      if (json.results && muniCodes[json.results.muniCd]) {
        placeName = `${muniCodes[json.results.muniCd]}${json.results.lv01Nm}`
      }
    } catch (e) {
      console.error(`Failed to get reverse geocode result with error: ${e}`)
    }

    return {
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          place_name: placeName,
          center: [lng, lat],
        },
      ],
    }
  },
}

map.addControl(
  new MaplibreGeocoder(geocoderApi, {
    maplibregl: maplibregl,
    marker: true,
    placeholder: '住所文字列 または 緯度,経度 で検索',
    reverseGeocode: true,
  }),
  'top-right',
)

// ズーム
map.addControl(
  new maplibregl.NavigationControl({
    showCompass: false,
  }),
  'top-right',
)

// インスペクト(マウス位置の属性表示)
map.addControl(
  new MaplibreInspect({
    useInspectStyle: false,
    popup: new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    }),
  }),
)

// 現在位置表示
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    fitBoundsOptions: { maxZoom: 18 },
    trackUserLocation: false,
    showUserLocation: true,
  }),
  'top-right',
)
