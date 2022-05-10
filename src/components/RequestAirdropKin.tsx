import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TransactionSignature } from '@solana/web3.js';
import { useCallback, useState, useEffect } from 'react';
import { notify } from '../utils/notifications';

import useUserKINBalanceStore from '../stores/useUserKINBalanceStore';
import useTokenAccounts from 'hooks/useTokenAccounts';

export const RequestAirdropKin = ({ disabled }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [sending, setSending] = useState(false);
  const kinTokenAccounts = useTokenAccounts({
    publicKey: publicKey,
    connection,
  });

  const { getUserKINBalance } = useUserKINBalanceStore();

  useEffect(() => {
    getUserKINBalance(kinTokenAccounts, connection);
  }, [publicKey]);

  const onClick = useCallback(async () => {
    if (!publicKey) {
      console.log('error', 'Wallet not connected!');
      notify({
        type: 'error',
        message: 'error',
        description: 'Wallet not connected!',
      });
      return;
    }

    let signature: TransactionSignature = '';

    try {
      setSending(true);
      const response = await fetch(
        'https://devnet.mogami.kin.org/api/airdrop',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            account: publicKey.toBase58(),
            amount: 1000,
          }),
        }
      );
      const data = await response.json();
      signature = data.signature;

      notify({
        type: 'success',
        message: 'KIN Airdrop successful!',
        txid: signature,
      });

      getUserKINBalance(kinTokenAccounts, connection);
    } catch (error: any) {
      notify({
        type: 'error',
        message: `KIN Airdrop failed!`,
        description: error?.message,
        txid: signature,
      });
      console.log('error', `Airdrop failed! ${error?.message}`, signature);
    }
    setSending(false);
  }, [publicKey, connection, getUserKINBalance, kinTokenAccounts]);

  return (
    <div>
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={onClick}
        disabled={disabled || sending}
      >
        {sending ? <span>Airdropping...</span> : <span>Airdrop 1000 Kin </span>}
      </button>
    </div>
  );
};
