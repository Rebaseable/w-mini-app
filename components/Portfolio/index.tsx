"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { SAFE_ADDRESS } from "@/app/constants";
import { mapChainIdToName } from "@/app/helper";

interface ChainMetrics {
  chain_id: number | null;
  abs_profit_usd: number;
  roi: number;
}

export function Portfolio() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<{
    currentValue: number;
    totalProfitLoss: number;
    chainMetrics: ChainMetrics[];
  }>({
    currentValue: 0,
    totalProfitLoss: 0,
    chainMetrics: [],
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(
          `/api/portfolio/metrics?address=${SAFE_ADDRESS}`
        );
        const { currentValue, profitLoss } = await response.json();

        if (!response.ok) throw new Error(error);

        const totalProfitLoss = profitLoss.reduce(
          (sum: number, item: ChainMetrics) => sum + (item.abs_profit_usd || 0),
          0
        );

        setMetrics({
          currentValue: currentValue[0]?.value_usd || 0,
          totalProfitLoss,
          chainMetrics: profitLoss,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-white hover:opacity-80"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back
      </button>

      {loading ? (
        <div className="text-center text-white">Loading portfolio data...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Portfolio Summary Card */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-[#9C44FF] to-[#FF44EC]">
            <h2 className="text-xl font-bold text-white mb-4">
              Portfolio Value
            </h2>
            <div className="text-3xl font-bold text-white">
              ${metrics.currentValue.toFixed(2)}
            </div>
            <div className="flex items-center mt-2">
              {metrics.totalProfitLoss >= 0 ? (
                <TrendingUp className="text-green-400 mr-2" />
              ) : (
                <TrendingDown className="text-red-400 mr-2" />
              )}
              <span
                className={`${
                  metrics.totalProfitLoss >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ${Math.abs(metrics.totalProfitLoss).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Chain Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Chain Breakdown
            </h3>
            {metrics.chainMetrics.map((chain, index) => {
              if (!chain.chain_id) return null;
              return (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-neutral-800 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white">
                      {mapChainIdToName(chain.chain_id)}
                    </p>
                    <p
                      className={`text-sm ${
                        chain.abs_profit_usd >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      ROI: {(chain.roi * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div
                    className={`text-right ${
                      chain.abs_profit_usd >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    ${chain.abs_profit_usd.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
