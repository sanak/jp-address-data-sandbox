export const fetchMuniCodes = async (muniCodes) => {
  const response = await fetch('https://maps.gsi.go.jp/js/muni.js')
  if (response.ok) {
    const text = await response.text()
    return parseMuniJs(muniCodes, text)
  }
}

const parseMuniJs = (muniCodes, text) => {
  const lines = text.split('\n')
  const regex = /GSI\.MUNI_ARRAY\["(\d{4,5})"\]\s*=\s*'([^']+)'/
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(regex)
    if (match) {
      const key = ('0' + match[1]).slice(-5)
      // pref_code,pref_name,city_code,city_name
      const parts = match[2].split(',')
      muniCodes[key] = `${parts[1]}${parts[3]}`.replace('　', '')
    }
  }
  return muniCodes
}
