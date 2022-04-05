// Next, React
import { FC, useEffect, useState } from 'react';
import Link from 'next/link';

// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Components
import { RequestAirdrop } from '../../components/RequestAirdrop';
import { RequestAirdropKin } from '../../components/RequestAirdropKin';
import pkg from '../../../package.json';

// Store
import useUserSOLBalanceStore from '../../stores/useUserSOLBalanceStore';

// Kin
import useUserKINBalanceStore from '../../stores/useUserKINBalanceStore';
import useTokenAccounts from 'hooks/useTokenAccounts';


export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();

  const balance = useUserSOLBalanceStore((s) => s.balance)
  const { getUserSOLBalance } = useUserSOLBalanceStore()

  const kinTokenAccounts = useTokenAccounts({publicKey: wallet.publicKey, connection})
    console.log("🚀 ~ kinTokenAccounts", kinTokenAccounts)

    console.log(JSON.stringify({
      account: wallet?.publicKey?.toBase58(),
      amount: 1000
    }))
  
  const balanceKIN = useUserKINBalanceStore((s) => s.balance)
  const { getUserKINBalance } = useUserKINBalanceStore()
  console.log("🚀 ~ balanceKIN", balanceKIN)

  useEffect(() => {
    if (wallet.publicKey) {
      console.log(wallet.publicKey.toBase58())
      getUserSOLBalance(wallet.publicKey, connection)
    }
  }, [wallet.publicKey, connection, getUserSOLBalance])
  
  useEffect(() => {
    if (kinTokenAccounts) {
      getUserKINBalance(kinTokenAccounts, connection)
    }
  }, [kinTokenAccounts, getUserKINBalance])

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Kin DApp Demo <span className='text-sm font-normal align-top text-slate-700'>v{pkg.version}</span>
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>The easiest way to get started with Kin.</p>
          Next.js, tailwind, wallet, web3.js, and more.
        </h4>
        <div className="max-w-md mx-auto mockup-code bg-primary p-6 my-2">
          <pre data-prefix=">">
            <code className="truncate">Start building with Kin on Solana  </code>
          </pre>
        </div>        
          <div className="text-center">
          <RequestAirdrop />
          {wallet && <p>SOL Balance: {(balance || 0).toLocaleString()}</p>}
          <RequestAirdropKin />
          {wallet && <p>KIN Balance: {(balanceKIN || '0').toLocaleString()}</p>}
        </div>
      </div>
    </div>
  );
};
