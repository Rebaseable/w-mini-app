import { NextResponse } from "next/server";
import { ethers } from "ethers";
import Safe from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { MetaTransactionData, OperationType } from "@safe-global/types-kit";
import { RPC_PROVIDER, SAFE_ADDRESS } from "@/app/constants";

export async function POST(request: Request) {
  try {
    const { recipient, amount } = await request.json();

    // Create Safe instance with private key from backend environment
    const safeSdk = await Safe.init({
      provider: RPC_PROVIDER,
      signer: process.env.PRIVATE_KEY,
      safeAddress: SAFE_ADDRESS,
    });

    // Create transaction
    const safeTransactionData: MetaTransactionData = {
      to: recipient,
      data: "0x",
      value: ethers.parseEther(amount).toString(),
      operation: OperationType.Call,
    };

    const safeTransaction = await safeSdk.createTransaction({
      transactions: [safeTransactionData],
    });

    // Sign transaction
    const signedSafeTransaction = await safeSdk.signTransaction(
      safeTransaction
    );

    // Execute transaction
    const executeTxResponse = await safeSdk.executeTransaction(
      signedSafeTransaction
    );
    await executeTxResponse.transactionResponse;

    return NextResponse.json({
      success: true,
      txHash: executeTxResponse.hash,
      response: executeTxResponse.transactionResponse,
    });
  } catch (error) {
    console.error("Transaction failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transaction failed" },
      { status: 500 }
    );
  }
}
