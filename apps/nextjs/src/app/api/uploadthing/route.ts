import { createRouteHandler } from "uploadthing/next";

import { env } from "~/env";
import { uploadRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    callbackUrl: `${env.NEXT_PUBLIC_URL}/api/uploadthing`,
  },
});
