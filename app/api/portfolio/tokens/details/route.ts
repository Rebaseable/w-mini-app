import { NextResponse } from "next/server";

const ONE_INCH_API_URL = `${process.env.ONE_INCH_API_URL}/portfolio/portfolio/v4`;
const SUPPORTED_CHAINS = [100]; // Gnosis Chain

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address =
    searchParams.get("address") || "0x595ec62736bf19445d7f00d66072b3a3c7aea0f5";

  try {
    // Fetch token details for all supported chains in parallel
    const detailsPromises = SUPPORTED_CHAINS.map((chainId) =>
      fetch(
        `${ONE_INCH_API_URL}/overview/erc20/details?addresses=${address}&chain_id=${chainId}&use_cache=true`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
            Accept: "application/json",
          },
        }
      )
    );

    const responses = await Promise.all(detailsPromises);
    const results = await Promise.all(responses.map((res) => res.json()));

    // Combine results from all chains
    const combinedTokens = results.flatMap((result) => result.result || []);

    return NextResponse.json(
      { result: combinedTokens },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  } catch (error) {
    console.error("Token details API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch token details" },
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
