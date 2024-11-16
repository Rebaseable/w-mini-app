"use client";
import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  CreditCard,
  Wallet,
  BarChart3,
  Send,
  Plus,
  Sparkles,
  PiggyBank,
} from "lucide-react";
import { MiniKit } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";

export function WalletView() {
  const router = useRouter();
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [balance, setBalance] = useState("0.00");
  const isWorldApp = MiniKit.isInstalled();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/portfolio/metrics");
        if (!response.ok) throw new Error("Failed to fetch balance");
        const { currentValue } = await response.json();
        const value = currentValue[0]?.value_usd || 0;
        setBalance(value.toFixed(2));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setBalance("0.00");
      }
    };

    fetchBalance();
  }, []);

  const handleAction = (action: string) => {
    switch (action) {
      case "Send":
        router.push("/send");
        break;
      case "Receive":
        router.push("/receive");
        break;
      case "Portfolio":
        router.push("/portfolio");
        break;
    }
  };

  return (
    <div>
      {/* Card Section */}
      <div className="relative mb-4 p-8 min-h-[200px] rounded-3xl bg-gradient-to-r from-[#9C44FF] to-[#FF44EC] text-white shadow-lg">
        {/* Card Icon */}
        <CreditCard className="mb-6" size={32} />
        {/* Balance Display */}
        <p className="text-3xl font-bold mb-4">
          {showCardDetails ? `$${balance} xDAI` : "$****.**"}
        </p>
        {/* Toggle Button */}
        <button
          onClick={() => setShowCardDetails(!showCardDetails)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {showCardDetails ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {/* Username if in World App */}
        {isWorldApp && MiniKit.walletAddress && (
          <p className="text-md mt-2">{MiniKit.user?.username}</p>
        )}
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8">
        {[
          { icon: <Send size={24} />, label: "Send" },
          { icon: <Wallet size={24} />, label: "Receive" },
          { icon: <BarChart3 size={24} />, label: "Portfolio" },
          { icon: <Sparkles size={24} />, label: "Auto Manage" },
          { icon: <PiggyBank size={24} />, label: "Savings" },
          { icon: <Plus size={24} />, label: "More" },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => handleAction(item.label)}
            className="h-20 sm:h-24 flex flex-col items-center justify-center rounded-xl bg-neutral-800 text-white hover:bg-neutral-700 hover:scale-105 transition-all duration-200"
          >
            {item.icon}
            <span className="text-sm mt-2 sm:mt-3">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
