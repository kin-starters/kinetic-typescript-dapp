import { FC, useCallback, useState } from 'react';
import { TransactionType } from '@kin-tools/kin-memo';
import { Commitment } from '@mogami/solana';

import useMogamiClientStore from '../stores/useMogamiClientStore';
import useAccountsStore from '../stores/useAccountsStore';
import { AccountInfo } from 'components/AccountInfo';

import { notify } from '../utils/notifications';

export const SendKin: FC = () => {
  const { mogami } = useMogamiClientStore();
  const { accounts, balances, updateBalance } = useAccountsStore();
  const [selectedFromAccount, setSelectedFromAccount] = useState(
    accounts[0] || null
  );
  const [selectedToAccount, setSelectedToAccount] = useState(
    accounts[1] || null
  );

  const [appIndex, setAppIndex] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const onClick = useCallback(async () => {
    if (!mogami) {
      notify({ type: 'error', message: `Kin Client not connected!` });
      console.log('error', `Send Transaction: Kin Client not connected!`);
    }

    try {
      setSending(true);
      const transaction = await mogami.makeTransfer({
        amount,
        commitment: Commitment.Finalized,
        destination: address || selectedToAccount.publicKey,
        owner: selectedFromAccount,
        type: TransactionType.P2P,
      });
      console.log('🚀 ~ transaction', transaction);
      notify({
        type: 'success',
        message: 'Transaction successful!',
        txid: transaction.signature,
      });
    } catch (error: any) {
      error.message &&
        notify({
          type: 'error',
          message: `Transaction failed!`,
          description: error?.message,
        });
      console.log('error', `Transaction failed! ${error?.message}`);
    }

    setSending(false);

    try {
      const balanceFrom = await mogami.balance(selectedFromAccount.publicKey);
      console.log('🚀 ~ balanceFrom', balanceFrom);
      const balanceFromInKin = (Number(balanceFrom.value) / 100000).toString();
      console.log('🚀 ~ balanceFromInKin', balanceFromInKin);
      updateBalance(selectedFromAccount, balanceFromInKin);

      if (selectedToAccount) {
        const balanceTo = await mogami.balance(selectedToAccount.publicKey);
        console.log('🚀 ~ balanceTo', balanceTo);
        const balanceToInKin = (Number(balanceTo.value) / 100000).toString();
        console.log('🚀 ~ balanceToInKin', balanceToInKin);
        updateBalance(selectedToAccount, balanceToInKin);
      }
    } catch (error) {
      console.log('🚀 ~ error', error);
    }
  }, [mogami, notify, address, appIndex]);

  const divStyle = {
    width: '600px',
    display: 'flex',
    justifyContent: 'space-between',
  };
  const inputStyle = {
    color: 'black',
    paddingLeft: '5px',
    width: '500px',
  };
  const labelStyle = { width: '600px', display: 'flex', marginLeft: '100px' };
  const linkStyle = { textDecoration: 'underline' };

  return (
    <div className="md:w-full text-center text-slate-300 my-2 fade-in">
      {mogami ? (
        <div style={{ position: 'relative' }}>
          <div style={divStyle}>
            <span>From: </span>
          </div>

          <div className="accounts">
            {accounts.map((account) => {
              const selected =
                selectedFromAccount?.publicKey === account.publicKey;

              return (
                <AccountInfo
                  key={account.publicKey}
                  publicKey={account.publicKey}
                  balance={balances[account.publicKey]}
                  select={() => {
                    setSelectedFromAccount(selected ? null : account);
                  }}
                  selected={selected}
                />
              );
            })}
          </div>

          <div style={divStyle}>
            <span>To: </span>
          </div>

          <div className="accounts">
            {accounts.map((account) => {
              const selected =
                selectedToAccount?.publicKey === account.publicKey;

              const selectedFrom =
                selectedFromAccount?.publicKey === account.publicKey;

              if (selectedFrom && selected) {
                setSelectedToAccount(null);
              }

              return (
                <AccountInfo
                  key={account.publicKey}
                  publicKey={account.publicKey}
                  balance={balances[account.publicKey]}
                  select={() => {
                    setSelectedToAccount(selected ? null : account);
                  }}
                  selected={selected}
                  disabled={selectedFrom}
                />
              );
            })}
          </div>

          <div
            className={`my-4 py-4 px-5 ${
              address && !selectedToAccount ? 'bg-pink-500 rounded' : ''
            } `}
          >
            <input
              style={inputStyle}
              className="rounded"
              type="text"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value);
                setSelectedToAccount(null);
              }}
            />

            <a
              href={
                'https://explorer.solana.com/address/' +
                address +
                `?cluster=devnet`
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex link link-accent"
              style={{ position: 'relative', width: '20px' }}
            >
              <svg
                className="flex-shrink-0 h-4 ml-2 text-primary-light w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ position: 'absolute', top: '-14' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                ></path>
              </svg>
            </a>
          </div>

          <br />
          <br />

          <div style={divStyle}>
            <span>Amount: </span>
          </div>
          <br />

          <input
            style={inputStyle}
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value.toString())}
          />

          <br />
          <br />
          <div style={divStyle}>
            <span>App Index: </span>
          </div>
          <br />

          <input
            style={inputStyle}
            type="number"
            value={appIndex}
            onChange={(event) => setAppIndex(event.target.value.toString())}
          />

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
          <br />
          <button
            className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
            onClick={onClick}
            disabled={
              sending ||
              !mogami ||
              !Number(amount) ||
              !selectedFromAccount ||
              (!selectedToAccount && !address)
            }
          >
            {mogami ? (
              <div className="hidden group-disabled:block">Can't Send...</div>
            ) : (
              <div className="hidden group-disabled:block">Not Connected</div>
            )}

            <span className="block group-disabled:hidden">Send Kin</span>
          </button>
        </div>
      ) : (
        <span>Not connected to wallet</span>
      )}
    </div>
  );
};
