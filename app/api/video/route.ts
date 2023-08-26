import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.NEXT_PUBLIC_REPLICATE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!prompt) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    console.log(freeTrial);
    if (!freeTrial)
      return new NextResponse("Your trial period has expired.", {
        status: 403,
      });

    const response = await replicate.run(
      "wcarle/text2video-zero:41f6928e5932de07e2b8c3b8c89feed58c3e3827e8a52567473d477fb36d2f25",
      {
        input: {
          prompt: prompt,
        },
      }
    );
    await increaseApiLimit();
    return NextResponse.json(response);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
