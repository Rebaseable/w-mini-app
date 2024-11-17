import { NextResponse } from "next/server";
import Safe from "@safe-global/protocol-kit";
import {
  BuyTokenDestination,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  OrderBookApi,
  OrderKind,
  OrderQuoteSideKindSell,
  SellTokenSource,
  SigningScheme,
} from "@cowprotocol/cow-sdk";
import { encodeFunctionData, parseUnits } from "viem";
import DelayABI from "@/app/abi/Delay";
import GPv2SettlementABI from "@/app/abi/GPv2Settlement";
import { RPC_PROVIDER, SAFE_DELAY_MODULE_ADDRESS } from "@/app/constants";
import { SAFE_ADDRESS } from "@/app/constants";
import { OperationType } from "@safe-global/types-kit";

const chainId = 100;
const orderBookApi = new OrderBookApi({ chainId });

export async function POST(
  request: Request,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = params;
    const body = await request.json();

    if (action === "create") {
      return handleCreateOrder(body);
    } else if (action === "execute") {
      return handleExecuteOrder(body);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleCreateOrder({
  safeAddress = SAFE_ADDRESS,
  sellToken,
  buyToken,
  sellAmount,
}: {
  safeAddress: `0x${string}`;
  sellToken: `0x${string}`;
  buyToken: `0x${string}`;
  sellAmount: string;
}) {
  // Convert the input amount to wei
  const sellAmountWei = parseUnits(sellAmount, 18).toString();

  // Get quote and create order
  const { quote } = await orderBookApi.getQuote({
    sellToken,
    buyToken,
    from: safeAddress,
    receiver: safeAddress,
    sellAmountBeforeFee: sellAmountWei,
    kind: OrderQuoteSideKindSell.SELL,
  });

  // Create order with pre-sign signature scheme
  const validTo = Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutes from now
  const orderId = await orderBookApi.sendOrder({
    sellToken: quote.sellToken,
    buyToken: quote.buyToken,
    sellAmount: quote.sellAmount,
    buyAmount: quote.buyAmount,
    validTo,
    appData: quote.appData,
    feeAmount: "0", // No fees
    kind: OrderKind.SELL,
    partiallyFillable: false,
    receiver: safeAddress,
    from: safeAddress,
    sellTokenBalance: SellTokenSource.ERC20,
    buyTokenBalance: BuyTokenDestination.ERC20,
    signingScheme: SigningScheme.PRESIGN,
    signature: "0x", // Empty signature for pre-sign orders
  });

  console.log("orderId", orderId);

  // Return order details
  return NextResponse.json({
    uid: orderId,
    status: "created",
  });
}

async function handleExecuteOrder({
  orderId,
  safeAddress = SAFE_ADDRESS,
  delayModuleAddress = SAFE_DELAY_MODULE_ADDRESS,
}: {
  orderId: string;
  safeAddress: `0x${string}`;
  delayModuleAddress: `0x${string}`;
}) {
  // Initialize Safe instance
  const safeSdk = await Safe.init({
    provider: RPC_PROVIDER,
    signer: process.env.PRIVATE_KEY,
    safeAddress,
  });

  // Create the presign transaction data for the settlement contract
  const preSignCalldata = encodeFunctionData({
    abi: GPv2SettlementABI,
    functionName: "setPreSignature",
    args: [orderId as `0x${string}`, true],
  });

  // Queue the transaction through the delay module
  const safeTransactionData = {
    to: delayModuleAddress,
    data: encodeFunctionData({
      abi: DelayABI,
      functionName: "execTransactionFromModule",
      args: [
        COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId] as `0x${string}`,
        BigInt(0),
        preSignCalldata,
        OperationType.Call,
      ],
    }),
    value: "0",
  };

  // Create and sign the transaction
  const safeTransaction = await safeSdk.createTransaction({
    transactions: [safeTransactionData],
  });

  const signedSafeTransaction = await safeSdk.signTransaction(safeTransaction);
  const executeTxResponse = await safeSdk.executeTransaction(
    signedSafeTransaction
  );
  await executeTxResponse.transactionResponse;

  // Get the order status from the API
  const order = await orderBookApi.getOrder(orderId);

  return NextResponse.json({
    success: true,
    txHash: executeTxResponse.hash,
    status: order.status,
    response: executeTxResponse.transactionResponse,
  });
}
