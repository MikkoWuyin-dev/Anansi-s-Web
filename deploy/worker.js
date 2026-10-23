/**
 * The static host's entry point (spec 0013).
 *
 * The product is a static single page with no routes, no API and no server
 * state, so the Worker only hands every request to the asset store. There is
 * nothing to authenticate, nothing to personalise, and nothing to cache by
 * hand: the build's hashed asset names and the font are the whole site.
 */
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request)
  },
}
