import {Router} from "express";
import {kOriginalUri} from "./polyfill";

/**
 * Collect all the urls of the app
 *
 * @param router
 * @param prefix
 */
export function getOriginalUrls(router: Router, prefix: string[] = []): string[] {

  // Internally, express represents routes, routers and middlewares
  // as `Layer`.

  // Usually, the routers have a `stack` property containing the nested
  // middleware, routes and routers.
  // So, this first expression traverse the nested routers registered
  // in the passed router.
  const nestedRoutes: string[] = router.stack
    .filter((layer) => layer?.handle?.stack !== undefined)
    .flatMap((layer) =>
      getOriginalUrls(layer.handle, [...prefix, layer[kOriginalUri]])
    )

  // This statement collect the simple routes urls.
  const routes: string[] = router.stack
    .filter((layer) => layer?.handle?.stack === undefined)
    .filter((layer) => layer[kOriginalUri])
    .map((layer) =>
      [...prefix, layer[kOriginalUri]].join('').replace('//', '/')
    )

  return [...routes, ...nestedRoutes]
}