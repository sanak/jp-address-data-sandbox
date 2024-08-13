import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    publicDir: '../data',
    appType: 'mpa', // devモードで存在しないpmtilesファイルアクセスを404にする
    build: {
      outDir: '../dist',
      copyPublicDir: false,
    },
    // prettier-ignore
    define: {
      ADMIN_BOUNDARY_PMTILES_URL: JSON.stringify(env.ADMIN_BOUNDARY_PMTILES_URL),
      CENSUS_BOUNDARY_PMTILES_URL: JSON.stringify(env.CENSUS_BOUNDARY_PMTILES_URL),
      TOWN_POINT_PMTILES_URL: JSON.stringify(env.TOWN_POINT_PMTILES_URL),
      BLOCK_POINT_PMTILES_URL: JSON.stringify(env.BLOCK_POINT_PMTILES_URL),
      RESIDENT_POINT_PMTILES_URL: JSON.stringify(env.RESIDENT_POINT_PMTILES_URL),
    },
    base: '/jp-address-data-sandbox/',
  }
})
