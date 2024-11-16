import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Store nonce in cookies with secure flag
  cookies().set("siwe", nonce, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });

  return NextResponse.json({ nonce });
}
