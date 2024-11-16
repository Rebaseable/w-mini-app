"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SAFE_ADDRESS } from "@/app/constants";

export function Receive() {
  const router = useRouter();

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-white hover:opacity-80"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      <div className="space-y-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold text-white">Receive Funds</h2>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={SAFE_ADDRESS} size={200} />
        </div>

        {/* Address Display */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Your Address
          </label>
          <div className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 break-all">
            {SAFE_ADDRESS}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(SAFE_ADDRESS);
          }}
          className="w-full p-4 rounded-lg bg-gradient-to-r from-[#9C44FF] to-[#FF44EC] text-white font-medium"
        >
          Copy Address
        </button>
      </div>
    </div>
  );
}
