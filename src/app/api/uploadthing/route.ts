import { createRouteHandler } from "uploadthing/next"

import { ourFileRouter } from "./core"

// Export routes for Next App Router
// UPLOADTHING_TOKEN env var is read automatically and handles sea1 region routing
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})
