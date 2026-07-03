export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('SW registered', reg.scope)
    }).catch((err) => console.error('SW register failed', err))
  }
}

export function requestBackgroundSync(tag: string) {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(reg => {
      // @ts-ignore
      return reg.sync.register(tag)
    }).catch(e => console.warn('Sync not available', e))
  }
}
