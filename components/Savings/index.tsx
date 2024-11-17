"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { Order } from "@/components/Order";
import {
  EURE_ADDRESS,
  SAFE_ADDRESS,
  SAFE_DELAY_MODULE_ADDRESS,
  SDAI_ADDRESS,
} from "@/app/constants";

interface Token {
  symbol: string;
  balance: string;
  apy: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-white hover:opacity-80">
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Savings() {
  const router = useRouter();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokens, setTokens] = useState<Token[]>([
    { symbol: "sDAI", balance: "0.00", apy: "7.5%" },
    { symbol: "stETH", balance: "0.00", apy: "3.0%" },
  ]);

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-white hover:opacity-80"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      {/* Everyday Account Section */}
      <div className="mb-6 p-6 rounded-xl bg-neutral-800">
        <h2 className="text-xl font-bold text-white mb-2">Everyday Account</h2>
        <p className="text-gray-300">0.00 EURe</p>
      </div>

      {/* Savings Section */}
      <div className="p-6 rounded-xl bg-neutral-800">
        <h2 className="text-xl font-bold text-white mb-4">Savings</h2>

        {tokens.map((token) => (
          <div
            key={token.symbol}
            className="mb-4 flex justify-between items-center"
          >
            <div>
              <p className="text-white">
                {token.balance} {token.symbol}
              </p>
            </div>
            <div className="px-4 py-2 rounded-full bg-neutral-700">
              <p className="text-sm text-white">{token.apy} APY</p>
            </div>
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="flex-1 p-4 rounded-lg bg-gradient-to-r from-[#9C44FF] to-[#FF44EC] text-white font-medium hover:opacity-90"
          >
            Deposit EURe
          </button>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex-1 p-4 rounded-lg border border-[#9C44FF] text-white font-medium hover:bg-neutral-700"
          >
            Withdraw EURe
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Deposit EURe to sDAI"
      >
        <Order
          safeAddress={SAFE_ADDRESS}
          delayModuleAddress={SAFE_DELAY_MODULE_ADDRESS}
          sellToken={EURE_ADDRESS}
          buyToken={SDAI_ADDRESS}
          onClose={() => setIsDepositModalOpen(false)}
        />
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw sDAI to EURe"
      >
        <Order
          safeAddress={SAFE_ADDRESS}
          delayModuleAddress={SAFE_DELAY_MODULE_ADDRESS}
          sellToken={SDAI_ADDRESS}
          buyToken={EURE_ADDRESS}
          onClose={() => setIsWithdrawModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
