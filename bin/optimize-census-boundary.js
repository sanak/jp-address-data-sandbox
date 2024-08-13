import * as readline from 'readline'

const reader = readline.createInterface({
  input: process.stdin,
})

const optimise = (f) => {
  f.id = Number(f.properties.KEY_CODE)
  const props = {
    city_name: f.properties.CITY_NAME,
    city_code: `${f.properties.PREF}${f.properties.CITY}`,
    town_name: f.properties.S_NAME,
    town_code: f.properties.KEY_CODE,
    water: f.properties.HCODE === 8154,
  }
  f.properties = props
  return f
}

reader.on('line', (chunk) => {
  const f = JSON.parse(chunk)
  process.stdout.write(`\x1e${JSON.stringify(optimise(f))}\n`)
})
