import type { HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { handleUpload } from "@vercel/blob/client";

import { env } from "~/env";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        clientPayload: string | null,
      ) => {
        const validUntil = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
        return {
          allowedContentTypes: [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
          ],
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({}),
          validUntil,
        };
      },
    });
    console.log(jsonResponse);
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
