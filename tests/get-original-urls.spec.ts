import {expect} from "chai";
import express, {Request, Response, Router} from "express";
import {getOriginalUrls} from "../src/get-original-urls";

describe('getRoutes', function () {
  it('should be able to get the original url from a single route', function () {
    // Given
    const router = Router().get(
      '/:customer/:userId/profiles/:hello/:world',
      dummyRoute
    )

    // When
    const originalUrls = getOriginalUrls(router)

    // Then
    expect(originalUrls).to.deep.equal([
      '/:customer/:userId/profiles/:hello/:world',
    ])
  })

  it('should be able to get the original url from a nested route', function () {
    // Given
    const router = Router().use(
      '/:customer',
      Router().get('/:userId', dummyRoute)
    )

    // When
    const originalUrls = getOriginalUrls(router)

    // Then
    expect(originalUrls).to.deep.equal(['/:customer/:userId'])
  })

  it('should be able to get the original url from a nested route when using `Router.use`', function () {
    // Given
    const userRouter = Router().use('/:userId', dummyRoute)
    const router = Router().use('/:customer', userRouter)

    // When
    const originalUrls = getOriginalUrls(router)

    // Then
    expect(originalUrls).to.deep.equal(['/:customer/:userId'])
  })

  it('should be able to get the original url from a simple app', function () {
    // Given
    const app = express()

    app.get('/:app/:customer/world', dummyRoute)

    // When
    const originalUrls = getOriginalUrls(app._router)

    // Then
    expect(originalUrls).to.deep.equal(['/:app/:customer/world'])
  })

  it('should be able to get the original url from a nested route in an app', function () {
    // Given
    const app = express()

    app.use(
      '/:app/:customer/world',
      Router().use('/:hello', Router().use('/:foo', dummyRoute))
    )

    // When
    const originalUrls = getOriginalUrls(app._router)

    // Then
    expect(originalUrls).to.deep.equal(['/:app/:customer/world/:hello/:foo'])
  })

  it('should be able to get the original url from multiple nested routes', function () {
    // Given
    const app = express()

    app.get('/hello/:world', dummyRoute)
    const r = Router().post('/:foo', dummyRoute)

    app.use('/v1/:customer/', r)
    app.use('/v2/:customer/', r)

    const r1 = Router().use('/my-routes', r)

    app.use('/V3', r1)

    // When
    const originalUrls = getOriginalUrls(app._router)

    // Then
    expect(originalUrls).to.deep.equal([
      '/hello/:world',
      '/v1/:customer/:foo',
      '/v2/:customer/:foo',
      '/V3/my-routes/:foo',
    ])
  })

  it('should be able to get the original urls of `app.route`', function () {
    // Given
    const app = express()

    app.route('/:foo').get(dummyRoute)

    // When
    const originalUrls = getOriginalUrls(app._router)

    // Then
    expect(originalUrls).to.deep.equal(['/:foo'])
  })
})

function dummyRoute(req: Request, res: Response): void {
  res.json()
}