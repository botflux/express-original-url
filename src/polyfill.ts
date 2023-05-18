
export const kOriginalUri = Symbol("kOriginalUri")
export const kIsPatched = Symbol("kIsPatched")

/* eslint-disable */
const express = require('express')

/**
 * This file patches `express` in order to reconstitute
 * the original URL of a request later.
 */

/**
 * Patch an express layer object to add the layer path.
 *
 * @param layer
 * @param layerPath
 */
function patchLayer(layer: any, layerPath?: string): any {
  if (layer[kIsPatched] === true) return true

  layer[kIsPatched] = true
  layer[kOriginalUri] = layerPath

  return layer
}

const oldUse = express.Router.use

express.Router.use = function (this, ...args: Parameters<typeof oldUse>) {
  const useResult = oldUse.apply(this, args)
  const layer = this.stack[this.stack.length - 1]
  patchLayer(layer, typeof args[0] === 'string' ? args[0] : undefined)
  return useResult
}

const oldRoute = express.Router.route

express.Router.route = function (this, ...args: Parameters<typeof oldRoute>) {
  const routeResult = oldRoute.apply(this, args)
  const layer = this.stack[this.stack.length - 1]

  patchLayer(layer, typeof args[0] === 'string' ? args[0] : undefined)

  return routeResult
}

const oldAppUse = express.use

express.use = function (this, ...args: Parameters<typeof oldAppUse>) {
  const route = oldAppUse.apply(this, args)
  const layer = this._router.stack[this._router.stack.length - 1]
  patchLayer(layer, typeof args[0] === 'string' ? args[0] : undefined)
  return route
}