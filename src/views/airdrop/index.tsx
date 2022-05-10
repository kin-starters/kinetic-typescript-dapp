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
  const { connection } = useConnection();

  const balanceSOL = useUserSOLBalanceStore((s) => s.balance);
  const { getUserSOLBalance } = useUserSOLBalanceStore();

  const balanceKIN = useUserKINBalanceStore((s) => s.balance);

  const { getUserKINBalance } = useUserKINBalanceStore();

  const kinTokenAccounts = useTokenAccounts({
    publicKey: wallet.publicKey,
    connection,
  });

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
              <hr />
              <br />
              <div>SOL</div>
              <RequestAirdrop />
              {wallet.wallet ? (
                <p>SOL Balance: {(balanceSOL || 0).toLocaleString()}</p>
              ) : null}
              <br />

              <hr />
              <br />
              <div>KIN</div>
              <CreateKinTokenAccount disabled={kinTokenAccounts?.length > 0} />
              <RequestAirdropKin disabled={kinTokenAccounts?.length === 0} />

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
