export const ROUTES = {
    HOME: '/',
    OPPOSITION: '/opposition',
    PLAYER: '/player',
    SQUAD: '/squad',
    PROGRESS: '/progress'
  } as const
  
  export const ROUTE_LABELS = {
    [ROUTES.OPPOSITION]: 'Opposition',
    [ROUTES.PLAYER]: 'Player', 
    [ROUTES.SQUAD]: 'Squad',
    [ROUTES.PROGRESS]: 'Progress'
  } as const
  
  export type RouteKey = keyof typeof ROUTES