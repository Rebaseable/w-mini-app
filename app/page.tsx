"use client";
import { useState } from "react";
import { WalletView } from "@/components/WalletView";
import { SignIn } from "@/components/SignIn";
import { VerifyBlock } from "@/components/Verify";
import { PayBlock } from "@/components/Pay";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full shadow-2xl rounded-[24px] overflow-hidden">
        <div className="p-8">
          <SignIn />
          {status === "authenticated" && <WalletView />}
          {/* <VerifyBlock /> */}
          {/* <PayBlock /> */}
        </div>
      </div>
    </div>
  );
}
