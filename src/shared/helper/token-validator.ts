export function validateToken(token: string) {
  let isValidToken = true

  if (!token) {
    isValidToken = false
  }

  if (token) {
    isValidToken = token && token?.replace('Bearer ', '') === process.env.TOKEN
  }

  return isValidToken
}
