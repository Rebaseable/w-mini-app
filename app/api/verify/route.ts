import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.APP_ID as `app_${string}`;

    if (!app_id) {
      return NextResponse.json(
        {
          success: false,
          error: "APP_ID not configured",
        },
        { status: 500 }
      );
    }

    const verifyRes = await verifyCloudProof(payload, app_id, action, signal);

    if (verifyRes.success) {
      // Store verification in your database here
      return NextResponse.json(
        {
          success: true,
          verification: verifyRes,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: verifyRes,
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
