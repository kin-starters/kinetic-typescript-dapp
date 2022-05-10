import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  Connection,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useCallback, useState } from 'react';
import { notify } from '../utils/notifications';

import useUserKINBalanceStore from '../stores/useUserKINBalanceStore';
import useTokenAccounts from 'hooks/useTokenAccounts';
import { KIN_MINT_DEVNET } from '../constants';

export interface Balance {
  [tokenAccountId: string]: string;
}

interface HandleGetKinBalances {
  connection: Connection;
  address: string;
}

export async function handleGetKinBalances({
  connection,
  address,
}: HandleGetKinBalances) {
  const mintPublicKey = new PublicKey(KIN_MINT_DEVNET);
  const publicKey = new PublicKey(address);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    {
      mint: mintPublicKey,
    }
  );

  const balances = await Promise.all(
    tokenAccounts.value.map(async (tokenAccount) => {
      const tokenAmount = await connection.getTokenAccountBalance(
        tokenAccount.pubkey
      );

      return {
        [tokenAccount.pubkey.toBase58()]: tokenAmount.value.amount,
      };
    })
  );

  return balances;
}

interface HandleCreateTokenAccount {
  connection: Connection;
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>;
  from: PublicKey;
  to: string;
}

export async function handleCreateTokenAccount({
  connection,
  sendTransaction,
  from,
  to,
}: HandleCreateTokenAccount) {
  const balances = await handleGetKinBalances({
    connection,
    address: to,
  });

  if (balances && balances.length > 0)
    throw new Error('Token Account already exists!');

  const mintPublicKey = new PublicKey(KIN_MINT_DEVNET);
  const toPublicKey = new PublicKey(to);
  const tokenAccount = await getAssociatedTokenAddress(
    mintPublicKey,
    toPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  let transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      from,
      tokenAccount,
      toPublicKey,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  // Send Transaction
  const signature = await sendTransaction(transaction, connection);
  console.log('🚀 ~ signature', signature);
  return signature;
}

interface CreateKinTokenAccountProps {
  withInput?: boolean;
  disabled?: boolean;
}

export const CreateKinTokenAccount = ({
  withInput = false,
  disabled = false,
}: CreateKinTokenAccountProps) => {
  const wallet = useWallet();

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [sending, setSending] = useState(false);
  const [address, setAddress] = useState('');

  const kinTokenAccounts = useTokenAccounts({
    publicKey: publicKey,
    connection,
  });

  const { getUserKINBalance } = useUserKINBalanceStore();

  const onClick = async () => {
    let signature: TransactionSignature = '';

    try {
      setSending(true);
      signature = await handleCreateTokenAccount({
        connection,
        sendTransaction,
        to: withInput ? address : publicKey.toBase58(),
        from: publicKey,
      });

      await connection.confirmTransaction(signature, 'confirmed');

      notify({
        type: 'success',
        message: 'Token Account Creation successful!',
        txid: signature,
      });

      getUserKINBalance(kinTokenAccounts, connection);
    } catch (error: any) {
      notify({
        type: 'error',
        message: `Create Token Account failed!`,
        description: error?.message,
        txid: signature,
      });
      console.log(
        'error',
        `Token Account Creation failed! ${error?.message}`,
        signature
      );
    }
    setSending(false);
  };

  const createButton = (
    <button
      className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
      onClick={onClick}
      disabled={disabled || sending || (withInput && !address)}
    >
      {sending ? (
        <span>Creating...</span>
      ) : (
        <span>Create Kin Token Account</span>
      )}
    </button>
  );

  const inputStyle = { color: 'black', paddingLeft: '5px', width: '500px' };

  return (
    <div className="md:w-full text-center text-slate-300 my-2">
      {wallet.publicKey ? (
        <>
          {withInput ? (
            <>
              <p style={{ display: 'flex', flexDirection: 'column' }}>
                Create Kin Token Account for another user's wallet:
                <input
                  style={inputStyle}
                  type="text"
                  value={address}
                  onChange={(event) => {
                    setAddress(event.target.value);
                  }}
                  disabled={disabled}
                />
              </p>
              {createButton}
            </>
          ) : (
            <>
              {!disabled ? (
                <p>
                  Create Kin Token Account for your own wallet. You need to have
                  SOL to do this.
                </p>
              ) : null}
              {createButton}
            </>
          )}
        </>
      ) : (
        <span>Not connected to wallet</span>
      )}
    </div>
  );
};
