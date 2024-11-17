import { NextResponse } from "next/server";
import { OrderBookApi, OrderQuoteSideKindSell } from "@cowprotocol/cow-sdk";
import { formatUnits, parseUnits } from "viem";
import { SAFE_ADDRESS } from "@/app/constants";

const chainId = 100;
const orderBookApi = new OrderBookApi({ chainId });

export async function POST(request: Request) {
  try {
    const {
      safeAddress = SAFE_ADDRESS,
      sellToken,
      buyToken,
      sellAmount,
    } = await request.json();

    if (!sellAmount || parseFloat(sellAmount) <= 0) {
      return NextResponse.json({ buyAmount: "0" });
    }

    // Convert the input amount to wei
    const sellAmountWei = parseUnits(sellAmount, 18).toString();

    const { quote } = await orderBookApi.getQuote({
      sellToken,
      buyToken,
      from: safeAddress,
      receiver: safeAddress,
      sellAmountBeforeFee: sellAmountWei,
      kind: OrderQuoteSideKindSell.SELL,
    });

    return NextResponse.json({
      buyAmount: formatUnits(BigInt(quote.buyAmount), 18),
      sellAmount: formatUnits(BigInt(quote.sellAmount), 18),
      feeAmount: formatUnits(BigInt(quote.feeAmount), 18),
    });
  } catch (error) {
    console.error("Quote API Error:", error);
    return NextResponse.json({ error: "Failed to get quote" }, { status: 500 });
  }
}
