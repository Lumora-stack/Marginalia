export function preloadRoute(path: string) {
  const load = path === '/'
    ? import('../pages/PublicationHome')
    : path === '/creative'
      ? import('../pages/Creative')
      : path.startsWith('/creative/') || path.startsWith('/section/')
        ? import('../pages/Section')
        : path.startsWith('/tech')
          ? import('../pages/Tech')
          : path.startsWith('/places')
            ? import('../pages/Places')
            : path.startsWith('/watched')
              ? import('../pages/Watched')
              : path === '/settings'
                ? import('../pages/Settings')
                : path === '/settings/about' || path === '/about'
                  ? import('../pages/About')
                  : path.startsWith('/admin')
                    ? import('../pages/Admin')
                    : Promise.resolve();
  void load.catch((error: unknown) => {
    console.error(`Could not preload route "${path}":`, error);
  });
}
