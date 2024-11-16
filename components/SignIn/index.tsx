"use client";
import { signIn, signOut, useSession } from "next-auth/react";

const truncateAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

export const SignIn = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (status === "authenticated" && session) {
    return (
      <div className="flex justify-between items-center mb-2 sm:mb-4">
        <p className="text-lg sm:text-xl font-bold">Welcome back</p>
        <button
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-4 mb-4 sm:mb-6">
      <p className="text-lg sm:text-xl font-bold">Welcome to Your Wallet</p>
      <p className="text-sm sm:text-base text-gray-400">
        Sign in with World ID to access your wallet
      </p>
      <button
        className="w-full py-3 sm:py-4 bg-[#242424] text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
        onClick={() => signIn("worldcoin")}
      >
        Sign In with World ID
      </button>
    </div>
  );
};
