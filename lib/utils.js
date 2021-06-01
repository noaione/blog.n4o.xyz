export const kebabCase = (str) =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.toLowerCase())
    .join('-')

export function isNone(data) {
  return data === null || typeof data === 'undefined'
}

export function mapBoolean(input_data) {
  if (isNone(input_data)) {
    return false
  }
  let fstat = false
  let data
  if (typeof input_data === 'string') {
    data = input_data.toLowerCase()
  } else if (typeof input_data === 'number') {
    data = input_data.toString().toLowerCase()
  } else if (typeof input_data === 'object') {
    data = JSON.stringify(input_data)
  } else if (typeof input_data === 'boolean') {
    return input_data
  } else {
    data = input_data.toString().toLowerCase()
  }
  switch (data) {
    case 'y':
      fstat = true
      break
    case 'enable':
      fstat = true
      break
    case 'true':
      fstat = true
      break
    case '1':
      fstat = true
      break
    case 'yes':
      fstat = true
      break
    default:
      break
  }
  return fstat
}
