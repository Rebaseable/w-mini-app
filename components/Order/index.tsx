"use client";
import { SAFE_ADDRESS } from "@/app/constants";
import { useState, useEffect } from "react";

interface OrderProps {
  safeAddress: `0x${string}`;
  delayModuleAddress: `0x${string}`;
  sellToken: `0x${string}`;
  buyToken: `0x${string}`;
  onClose?: () => void;
}
export function Order({
  safeAddress = SAFE_ADDRESS,
  delayModuleAddress,
  sellToken,
  buyToken,
  onClose,
}: OrderProps) {
  const [sellAmount, setSellAmount] = useState<string>("");
  const [quote, setQuote] = useState<{
    buyAmount: string;
    sellAmount: string;
    feeAmount: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [orderStatus, setOrderStatus] = useState<{
    status?: string;
    uid?: string;
  }>();

  useEffect(() => {
    const getQuote = async () => {
      if (!sellAmount || parseFloat(sellAmount) <= 0) {
        setQuote(null);
        return;
      }

      try {
        setIsQuoteLoading(true);
        const response = await fetch("/api/orders/quote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            safeAddress,
            sellToken,
            buyToken,
            sellAmount,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch quote");
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setQuote(data);
      } catch (err) {
        console.error("Failed to fetch quote:", err);
        setQuote(null);
        setError(err instanceof Error ? err.message : "Failed to get quote");
      } finally {
        setIsQuoteLoading(false);
      }
    };

    const debounceTimeout = setTimeout(getQuote, 500);
    return () => clearTimeout(debounceTimeout);
  }, [sellAmount, sellToken, buyToken, safeAddress]);

  const handleCreateOrder = async () => {
    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          safeAddress,
          delayModuleAddress,
          sellToken,
          buyToken,
          sellAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      setOrderStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteOrder = async () => {
    if (!orderStatus?.uid) return;

    try {
      setIsLoading(true);
      setError(undefined);

      const response = await fetch("/api/orders/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderStatus.uid,
          safeAddress,
          delayModuleAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute order");
      }

      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Amount"
        value={sellAmount}
        onChange={(event) => setSellAmount(event.target.value)}
        className="w-full p-3 rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:border-[#9C44FF]"
      />

      {isQuoteLoading ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading quote...</p>
      ) : quote ? (
        <div className="text-sm text-gray-400 space-y-1">
          <p>You will receive: {quote.buyAmount}</p>
          <p>Fee: {quote.feeAmount}</p>
        </div>
      ) : null}

      <div className="py-4 space-x-4">
        <button
          onClick={handleCreateOrder}
          disabled={!sellAmount || isLoading}
          className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#9C44FF] to-[#FF44EC] text-white font-medium
            ${(!sellAmount || isLoading) && "opacity-50 cursor-not-allowed"}
            ${isLoading && "animate-pulse"}
          `}
        >
          Create Order
        </button>

        {orderStatus?.uid && (
          <button
            onClick={handleExecuteOrder}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#9C44FF] to-[#FF44EC] text-white font-medium
              ${isLoading && "opacity-50 cursor-not-allowed animate-pulse"}
            `}
          >
            Execute Order
          </button>
        )}
      </div>

      {orderStatus && (
        <div className="space-y-2">
          <div className="text-white">Order status: {orderStatus.status}</div>
          <div>
            <a
              href={`https://explorer.cow.fi/gc/orders/${orderStatus.uid}`}
              target="_blank"
              referrerPolicy="no-referrer"
              className="text-[#9C44FF] hover:text-[#FF44EC] transition-colors"
            >
              Explorer
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
