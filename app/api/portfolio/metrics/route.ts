import { SAFE_ADDRESS } from "@/app/constants";
import { NextResponse } from "next/server";

const ONE_INCH_API_URL = "https://api.1inch.dev/portfolio/portfolio/v4";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    // Fetch both general current value and profit/loss data in parallel
    const [currentValueRes, profitLossRes] = await Promise.all([
      fetch(
        `${ONE_INCH_API_URL}/general/current_value?addresses=${SAFE_ADDRESS}&use_cache=true`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
            Accept: "application/json",
          },
        }
      ),
      fetch(
        `${ONE_INCH_API_URL}/general/profit_and_loss?addresses=${SAFE_ADDRESS}&timerange=1year&use_cache=true`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
            Accept: "application/json",
          },
        }
      ),
    ]);

    if (!currentValueRes.ok || !profitLossRes.ok) {
      throw new Error("Failed to fetch data from 1inch API");
    }

    const [currentValue, profitLoss] = await Promise.all([
      currentValueRes.json(),
      profitLossRes.json(),
    ]);

    console.log(currentValue, profitLoss);

    return NextResponse.json(
      {
        currentValue: currentValue.result,
        profitLoss: profitLoss.result,
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
