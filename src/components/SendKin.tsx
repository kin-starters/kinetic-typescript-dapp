import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';

import {
    generateKreTransactionInstructions,
    TransactionType,
} from '@kin-tools/kin-transaction';
import { FC, useCallback, useState } from 'react';
import { notify } from "../utils/notifications";

export const SendKin: FC = () => {
    const { connection } = useConnection();

    const { publicKey, sendTransaction } = useWallet();
    console.log("🚀 ~ publicKey", publicKey ? publicKey.toBase58() : 'No Public Key')
    const [appIndex, setAppIndex] = useState('')
    console.log("🚀 ~ appIndex", appIndex)
    const [address, setAddress] = useState('')
    console.log("🚀 ~ address", address)
    const [amount, setAmount] = useState('')
    console.log("🚀 ~ address", address)
    
    const onClick = useCallback(async () => {
        console.log("🚀 ~ publicKey", publicKey.toBase58())
        console.log("🚀 ~ address", address)
        console.log("🚀 ~ appIndex", appIndex)
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        let signature: TransactionSignature = '';
        try {
            const mint = new PublicKey('KinDesK3dYWo3R2wDk6Ucaf31tvQCCSYyL8Fuqp33GX')
            // from tokenAccount ******************************************************
            const fromTokenAccounts = await connection.getParsedTokenAccountsByOwner(
                publicKey,
                { mint }
            );
            console.log("🚀 ~ fromTokenAccounts", fromTokenAccounts)
            // Here we are going to assume the first tokenAccount is the one we want
            // You could implement a check to make sure it has sufficient balance
            const fromTokenAccount = fromTokenAccounts?.value[0]?.pubkey;
            if (!fromTokenAccount) throw new Error('No From Token Account!');
            console.log('🚀 ~ fromTokenAccount', fromTokenAccount.toBase58());

            // to tokenAccount ********************************************************
            const toPublicKey = new PublicKey(address);
            console.log("🚀 ~ toPublicKey", toPublicKey)
            const toTokenAccounts = await connection.getParsedTokenAccountsByOwner(
                toPublicKey,
                { mint }
            );
            console.log("🚀 ~ toTokenAccounts", toTokenAccounts)

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
            console.log("🚀 ~ instructionsWithKRE", instructionsWithKRE)

            // Transaction ************************************************************
            const transaction = new Transaction().add(
                ...instructionsWithKRE // Must be the first two instructions in order
            );

            signature = await sendTransaction(transaction, connection);

            await connection.confirmTransaction(signature, 'confirmed');
            notify({ type: 'success', message: 'Transaction successful!', txid: signature });
        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
            return;
        }
    }, [publicKey, notify, sendTransaction, address, appIndex]);

    const divStyle = {width: '600px', display: 'flex', justifyContent: 'space-between'}
    const inputStyle = { color: 'black', paddingLeft: '5px', width: '500px' }

    return (
        <div>
            {publicKey ?
                (<>
                    <div style={divStyle}><span>Address: </span><input style={inputStyle} type="text" value={address} onChange={(event) => {

                        console.log("🚀 ~ event", event.target.value)
                        setAddress(event.target.value)
                    }} /></div>
                    <br />
                    <div style={divStyle}><span>Kin Amount: </span><input style={inputStyle} type="number" value={amount} onChange={(event) => setAmount(event.target.value.toString())} /></div>
                    <br />
                    <div style={divStyle}><span>App Index: </span><input style={inputStyle} type="number" value={appIndex} onChange={(event) => setAppIndex(event.target.value.toString())} /></div>
                    <br />
                </>) : null}
            <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={onClick} disabled={!publicKey || !Number(amount) || !address}
            >
                {publicKey ? (<div className="hidden group-disabled:block">
                    Can't Send...
                </div>) : (<div className="hidden group-disabled:block">
                    Not Connected
                </div>)}
                
                <span className="block group-disabled:hidden" >
                    Send Kin
                </span>
            </button>
        </div>
    );
};
