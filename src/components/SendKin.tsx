import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';

import {
  generateKreTransactionInstructions,
  TransactionType,
} from '@kin-tools/kin-transaction';
import { FC, useCallback, useState } from 'react';
import { notify } from '../utils/notifications';
import { KIN_MINT_DEVNET } from '../constants';

export const SendKin: FC = () => {
  const { connection } = useConnection();

  const { publicKey, sendTransaction } = useWallet();
  const [appIndex, setAppIndex] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const onClick = useCallback(async () => {
    if (!publicKey) {
      notify({ type: 'error', message: `Wallet not connected!` });
      console.log('error', `Send Transaction: Wallet not connected!`);
      return;
    }

    let signature: TransactionSignature = '';
    try {
      const mint = new PublicKey(KIN_MINT_DEVNET);
      // from tokenAccount ******************************************************
      const fromTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint }
      );
      console.log('🚀 ~ fromTokenAccounts', fromTokenAccounts);
      // Here we are going to assume the first tokenAccount is the one we want
      // You could implement a check to make sure it has sufficient balance
      const fromTokenAccount = fromTokenAccounts?.value[0]?.pubkey;
      if (!fromTokenAccount) throw new Error('No From Token Account!');
      console.log('🚀 ~ fromTokenAccount', fromTokenAccount.toBase58());

      // to tokenAccount ********************************************************
      const toPublicKey = new PublicKey(address);
      console.log('🚀 ~ toPublicKey', toPublicKey);
      const toTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        toPublicKey,
        { mint }
      );
      console.log('🚀 ~ toTokenAccounts', toTokenAccounts);

      // Again, we are going to assume the first one is the one we want.
      // You could do a balance check and choose the one with the largest balance if necessary
      const toTokenAccount = toTokenAccounts?.value[0]?.pubkey;
      if (!toTokenAccount) throw new Error('No destination Token Account!');
      console.log('🚀 ~ toTokenAccount', toTokenAccount.toBase58());

      // Transaction Instructions *********************************************
      // 1 - Memo Program Instruction containing appIndex and transaction type formatted to be picked up by the KRE
      // 2 - Token Program Instruction for transferring Kin
      const instructionsWithKRE = await generateKreTransactionInstructions({
        type: TransactionType.P2P,
        appIndex: Number(appIndex),
        from: publicKey,
        fromTokenAccount,
        toTokenAccount,
        amount,
      });
      console.log('🚀 ~ instructionsWithKRE', instructionsWithKRE);

      // Transaction ************************************************************
      const transaction = new Transaction().add(
        ...instructionsWithKRE // Must be the first two instructions in order
      );

      setSending(true);
      signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(signature, 'confirmed');

      console.log('success', `Transaction sent! ${signature}`);
      notify({
        type: 'success',
        message: 'Transaction successful!',
        txid: signature,
      });
    } catch (error: any) {
      console.log('🚀 ~ error', error);
      error.message &&
        notify({
          type: 'error',
          message: `Transaction failed!`,
          description: error?.message,
          txid: signature,
        });
      console.log('error', `Transaction failed! ${error?.message}`, signature);
      setSending(false);
      return;
    }

    setSending(false);
  }, [publicKey, notify, sendTransaction, address, appIndex]);

  const divStyle = {
    width: '600px',
    display: 'flex',
    justifyContent: 'space-between',
  };
  const inputStyle = { color: 'black', paddingLeft: '5px', width: '500px' };
  const labelStyle = { width: '500px', display: 'flex', marginLeft: '100px' };
  const linkStyle = { textDecoration: 'underline' };

  return (
    <div className="md:w-full text-center text-slate-300 my-2 fade-in">
      {publicKey ? (
        <>
          <div style={divStyle}>
            <span>Address: </span>
            <input
              style={inputStyle}
              type="text"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
              }}
            />
          </div>
          <p
            className="md:w-full text-center text-slate-300 my-2"
            style={labelStyle}
          >
            The wallet address you want to send your Kin to.
          </p>
          <p
            className="md:w-full text-center text-slate-300 my-2"
            style={labelStyle}
          >
            This address must have a Kin token account.
          </p>
          <br />
          <div
            className="md:w-full text-center text-slate-300 my-2"
            style={divStyle}
          >
            <span>Kin Amount: </span>
            <input
              style={inputStyle}
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value.toString())}
            />
          </div>
          <p
            className="md:w-full text-center text-slate-300 my-2"
            style={labelStyle}
          >
            The amount of Kin you want to send.
          </p>
          <br />
          <div
            className="md:w-full text-center text-slate-300 my-2"
            style={divStyle}
          >
            <span>App Index: </span>
            <input
              style={inputStyle}
              type="number"
              value={appIndex}
              onChange={(event) => setAppIndex(event.target.value.toString())}
            />
          </div>
          <p
            className="md:w-full text-center text-slate-300 my-2"
            style={labelStyle}
          >
            The App Index of the that will be credited with this transaction.
          </p>
          <p
            className="md:w-full text-center text-slate-300 my-2"
            style={labelStyle}
          >
            <a
              href="https://developer.kin.org/docs/the-kre-explained/"
              target="_blank"
              style={linkStyle}
            >
              The Kin Rewards Engine
            </a>
          </p>
          <br />
          <button
            className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
            onClick={onClick}
            disabled={sending || !publicKey || !Number(amount) || !address}
          >
            {publicKey ? (
              <div className="hidden group-disabled:block">Can't Send...</div>
            ) : (
              <div className="hidden group-disabled:block">Not Connected</div>
            )}

            <span className="block group-disabled:hidden">Send Kin</span>
          </button>
        </>
      ) : (
        <span>Not connected to wallet</span>
      )}
    </div>
  );
};
