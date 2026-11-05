import { useEffect, useState } from 'preact/hooks'

export type Route = {
  path: string
  query: URLSearchParams
}

function parseHash(): Route {
  const raw = window.location.hash.replace(/^#/, '') || '/dashboard'
  const [path, search = ''] = raw.split('?')
  return {
    path: path || '/dashboard',
    query: new URLSearchParams(search),
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash)

  useEffect(() => {
    const onChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

export function navigate(to: string): void {
  window.location.hash = to
}
