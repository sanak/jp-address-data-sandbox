export const getDataUrl = (key, path) => {
  if (key && window[key]) {
    return window[key]
  } else {
    return `${location.protocol}//${location.host}${location.pathname}${path}`
  }
}
