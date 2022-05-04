// Next, React
import { FC, useEffect } from 'react';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { RequestAirdropKin } from '../../components/RequestAirdropKin';
import { CreateKinTokenAccount } from '../../components/CreateKinTokenAccount';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

// Kin
import useUserKINBalanceStore from '../../stores/useUserKINBalanceStore';
import useTokenAccounts from 'hooks/useTokenAccounts';

export const AirdropView: FC = () => {
  const wallet = useWallet();
  console.log('🚀 ~ wallet', wallet?.publicKey?.toBase58());
  const { connection } = useConnection();

  const balanceSOL = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  const balanceKIN = useUserKINBalanceStore((s) => s.balance);
  console.log('🚀 ~ balanceKIN', balanceKIN);

  const { getUserKINBalance } = useUserKINBalanceStore();

  const kinTokenAccounts = useTokenAccounts({
    publicKey: wallet.publicKey,
    connection,
  });
  console.log('🚀 ~ kinTokenAccounts', kinTokenAccounts);

  useEffect(() => {
    if (wallet.publicKey) {
      getUserSOLBalance(wallet.publicKey, connection);
    }
  }, [wallet.publicKey, connection, getUserSOLBalance]);

  useEffect(() => {
    getUserKINBalance(kinTokenAccounts, connection);
  }, [kinTokenAccounts, getUserKINBalance, wallet.publicKey]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Airdrop
        </h1>
        <div className="md:w-full text-center text-slate-300 my-2 fade-in">
          {wallet?.publicKey ? (
            <>
              <RequestAirdrop />
              {wallet.wallet ? (
                <p>SOL Balance: {(balanceSOL || 0).toLocaleString()}</p>
              ) : null}
              {kinTokenAccounts.length ? (
                <RequestAirdropKin />
              ) : (
                <CreateKinTokenAccount />
              )}
              {wallet.wallet && kinTokenAccounts.length ? (
                <p>KIN Balance: {(balanceKIN || 0).toLocaleString()}</p>
              ) : null}
            </>
          ) : (
            <span>Not connected to wallet</span>
          )}
        </div>
      </div>
    </div>
  );
};
