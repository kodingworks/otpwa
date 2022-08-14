export function replaceMessage(str: string, o: any) {
  const regexp = /{([^{]+)}/g

  return str.replace(regexp, function (ignore, key) {
    return (key = o[key]) == null ? '' : key
  })
}
