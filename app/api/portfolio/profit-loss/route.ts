import { NextResponse } from "next/server";
import { ONE_INCH_API_URL } from "@/app/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${ONE_INCH_API_URL}/portfolio/v4/overview/erc20/profit_and_loss?timerange=1year&addresses=${address}&use_cache=true`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch profit/loss data");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch profit/loss data",
      },
      { status: 500 }
    );
  }
}
