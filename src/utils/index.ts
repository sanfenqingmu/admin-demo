export function getQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const search = url.split('?')[1]
  if (search) {
    search.split('&').forEach((item) => {
      const [key, value] = item.split('=')
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || '')
      }
    })
  }
  return params
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}
