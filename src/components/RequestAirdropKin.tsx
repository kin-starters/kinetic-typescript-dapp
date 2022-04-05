import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, TransactionSignature } from '@solana/web3.js';
import { FC, useCallback } from 'react';
import { notify } from "../utils/notifications";

import useUserKINBalanceStore from '../stores/useUserKINBalanceStore';
import useTokenAccounts from 'hooks/useTokenAccounts';




export const RequestAirdropKin: FC = () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
     const kinTokenAccounts = useTokenAccounts({publicKey: publicKey, connection})
    console.log("🚀 ~ kinTokenAccounts", kinTokenAccounts)

    const { getUserKINBalance } = useUserKINBalanceStore();
    

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        let signature: TransactionSignature = '';

        try {
            
            const response = await fetch('https://devnet.mogami.kin.org/api/airdrop', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    account: publicKey.toBase58(),
                    amount: 1000
                })
            })
            const data = await response.json()
            console.log("🚀 ~ data", data)

            signature = data.signature

            await connection.confirmTransaction(signature, 'confirmed');
            notify({ type: 'success', message: 'Airdrop successful!', txid: signature });

            getUserKINBalance(kinTokenAccounts, connection);
        } catch (error: any) {
            notify({ type: 'error', message: `Airdrop failed!`, description: error?.message, txid: signature });
            console.log('error', `Airdrop failed! ${error?.message}`, signature);
        }
    }, [publicKey, connection, getUserKINBalance]);

    return (
        <div>
            <button
                className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
                onClick={onClick}
            >
                <span>Airdrop 1000 Kin </span>
            </button>
        </div>
    );
};

