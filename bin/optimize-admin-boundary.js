import * as readline from 'readline'

const reader = readline.createInterface({
  input: process.stdin,
})

const optimise = (f) => {
  for (const key in f.properties) {
    if (
      null === f.properties[key] ||
      '所属未定地' === f.properties[key] ||
      f.properties[key].match(/支庁$/)
    ) {
      f.properties[key] = ''
    }
  }

  f.id = Number(f.properties.N03_007)
  const props = {
    pref_name: f.properties.N03_001,
    city_name: `${f.properties.N03_003}${f.properties.N03_004}${f.properties.N03_005}`,
    city_code: f.properties.N03_007,
  }
  f.properties = props
  return f
}

reader.on('line', (chunk) => {
  const f = JSON.parse(chunk)
  process.stdout.write(`\x1e${JSON.stringify(optimise(f))}\n`)
})
