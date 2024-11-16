"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import Safe from "@safe-global/protocol-kit";
import { ArrowLeft } from "lucide-react";

export function Send() {
  const router = useRouter();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send transaction");
      }

      console.log("Transaction successful:", data.txHash);
      router.push("/");
    } catch (err) {
      console.error("Transaction failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to send transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-white hover:opacity-80"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-[#9C44FF]"
            placeholder="0x..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Amount (xDAI)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-[#9C44FF]"
            placeholder="0.0"
            step="0.000000000000000001"
          />
        </div>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

        <button
          onClick={handleSend}
          disabled={loading || !recipient || !amount}
          className="w-full p-4 rounded-lg bg-gradient-to-r from-[#9C44FF] to-[#FF44EC] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
