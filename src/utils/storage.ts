const TOKEN_KEY = 'ADMIN_TOKEN'
const USER_INFO_KEY = 'ADMIN_USER_INFO'

export const storage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
  getUserInfo<T = any>(): T | null {
    const data = localStorage.getItem(USER_INFO_KEY)
    return data ? JSON.parse(data) : null
  },
  setUserInfo(userInfo: any): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  },
  removeUserInfo(): void {
    localStorage.removeItem(USER_INFO_KEY)
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  }
}
