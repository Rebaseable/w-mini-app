interface ChainData {
  chain_id: number;
  currentValue: {
    total_value_usd: number;
  };
  profitLoss: {
    abs_profit_usd: number;
  }[];
}

export const mapChainIdToName = (chainId: number | null) => {
  if (!chainId) return null;
  switch (chainId) {
    case 1:
      return "Ethereum";
    case 100:
      return "Gnosis";
    default:
      return "Ethereum";
  }
};

export const getTotalValue = (chainData: ChainData[]) => {
  return chainData.reduce((total, chain) => {
    return total + (chain.currentValue?.total_value_usd || 0);
  }, 0);
};

export const getTotalProfitLoss = (chainData: ChainData[]) => {
  return chainData.reduce((total, chain) => {
    const chainProfitLoss = chain.profitLoss?.[0]?.abs_profit_usd || 0;
    return total + chainProfitLoss;
  }, 0);
};

export const getChainName = (chainId: number) => {
  switch (chainId) {
    case 1:
      return "Ethereum";
    case 100:
      return "Gnosis";
    case 534352:
      return "Scroll";
    default:
      return `Chain ${chainId}`;
  }
};
