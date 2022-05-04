import { useState, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { KIN_MINT_DEVNET } from '../constants';

interface UseTokenAccounts {
  publicKey: PublicKey;
  connection: Connection;
}
export default function useTokenAccounts({
  publicKey,
  connection,
}: UseTokenAccounts): PublicKey[] {
  const [tokenAccounts, setTokenAccounts] = useState<PublicKey[]>([]);

  useEffect(() => {
    async function getTokenAccounts() {
      const mint = new PublicKey(KIN_MINT_DEVNET);
      const { value } = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint }
      );
      if (value.length) {
        setTokenAccounts(value.map((account) => account.pubkey));
      } else {
        setTokenAccounts([]);
      }
    }

    if (publicKey) {
      getTokenAccounts();
    }
  }, [publicKey]);

  return tokenAccounts;
}
