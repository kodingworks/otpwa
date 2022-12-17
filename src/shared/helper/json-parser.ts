export function safelyParseJSON(jsonString: string) {
  try {
    return JSON.parse(jsonString)
  } catch (e) {
    return null
  }
}
