import { FC, useState } from 'react';
import { TransactionType } from '@kin-tools/kin-memo';
import { Commitment } from '@mogami/solana';

import useMogamiClientStore from '../stores/useMogamiClientStore';
import useAccountsStore from '../stores/useAccountsStore';
import { AccountInfo } from 'components/AccountInfo';
import { CreateKinAccount } from 'components/CreateKinAccount';

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

  const [batch, setBatch] = useState([]);

  const addToBatch = () => {
    setBatch([
      ...batch,
      { amount, destination: selectedToAccount.publicKey || address },
    ]);
  };

  const completeBatchPayment = async () => {
    if (!mogami) {
      notify({ type: 'error', message: `Kin Client not connected!` });
      console.log('error', `Send Transaction: Kin Client not connected!`);
    }

    try {
      setSending(true);
      notify({
        type: 'info',
        message: 'Transaction on its way!',
      });
      const transaction = await mogami.makeTransferBatch({
        commitment: Commitment.Finalized,
        owner: selectedFromAccount,
        type: TransactionType.P2P,
        payments: batch,
      });
      setBatch([]);
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
      const balanceFromInKin = (Number(balanceFrom.value) / 100000).toString();
      updateBalance(selectedFromAccount, balanceFromInKin);

      const promises = batch.map((send) => {
        return async () => {
          const balance = await mogami.balance(send.destination);
          const balanceInKin = (Number(balance.value) / 100000).toString();
          const account = accounts.find(
            (acc) => acc.publicKey === send.destination
          );
          if (account) {
            updateBalance(account, balanceInKin);
          }
        };
      });

      let promiseExecution = async () => {
        for (let promise of promises) {
          try {
            await promise();
          } catch (error) {
            console.log(error.message);
          }
        }
      };
      promiseExecution();
    } catch (error) {
      console.log('🚀 ~ error', error);
    }
  };

  const completePayment = async () => {
    if (!mogami) {
      notify({ type: 'error', message: `Kin Client not connected!` });
      console.log('error', `Send Transaction: Kin Client not connected!`);
    }

    try {
      setSending(true);
      notify({
        type: 'info',
        message: 'Transaction on its way!',
      });
      const transaction = await mogami.makeTransfer({
        amount,
        commitment: Commitment.Finalized,
        destination: address || selectedToAccount.publicKey,
        owner: selectedFromAccount,
        type: TransactionType.P2P,
      });
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
      const balanceFromInKin = (Number(balanceFrom.value) / 100000).toString();
      updateBalance(selectedFromAccount, balanceFromInKin);

      if (selectedToAccount) {
        const balanceTo = await mogami.balance(selectedToAccount.publicKey);
        const balanceInKin = (Number(balanceTo.value) / 100000).toString();
        updateBalance(selectedToAccount, balanceInKin);
      }
    } catch (error) {
      console.log('🚀 ~ error', error);
    }
  };

  const divStyle = {
    width: '700px',
    display: 'flex',
    justifyContent: 'space-between',
  };
  const inputStyle = {
    color: 'black',
    paddingLeft: '5px',
    width: '550px',
  };
  const labelStyle = { width: '700px', display: 'flex', marginLeft: '150px' };
  const linkStyle = { textDecoration: 'underline' };

  return (
    <div
      className="md:w-full text-center text-slate-300 my-2 fade-in"
      style={{ width: '700px' }}
    >
      {(() => {
        if (!mogami) {
          return <span>Not connected to Kin Client</span>;
        }

        if (!accounts.length) {
          return <CreateKinAccount />;
        }

        if (accounts.length) {
          return (
            <div>
              <div style={divStyle}>
                <span>From: </span>
              </div>

              <div
                className="accounts"
                style={{ width: '700px', margin: 'auto' }}
              >
                {accounts.map((account) => {
                  const selected =
                    selectedFromAccount?.publicKey === account.publicKey;

                  return (
                    <div key={account.publicKey}>
                      <AccountInfo
                        publicKey={account.publicKey}
                        balance={balances[account.publicKey]}
                        select={() => {
                          setSelectedFromAccount(selected ? null : account);
                        }}
                        disabled={!!batch.length}
                        selected={selected}
                        disabledSelected={selected && !!batch.length}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={divStyle}>
                <span>To: </span>
              </div>

              <div
                className="accounts"
                style={{ width: '700px', margin: 'auto' }}
              >
                {accounts.map((account) => {
                  const selected =
                    selectedToAccount?.publicKey === account.publicKey;

                  const selectedFrom =
                    selectedFromAccount?.publicKey === account.publicKey;

                  if (selectedFrom && selected) {
                    setSelectedToAccount(null);
                  }

                  return (
                    <div key={account.publicKey}>
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
                    </div>
                  );
                })}
              </div>

              <div
                className={`my-4 py-3 px-5 ${
                  address && !selectedToAccount
                    ? 'bg-pink-500 rounded'
                    : 'border border-sky-500 rounded'
                } `}
                style={{ margin: 'auto', width: '700px' }}
              >
                <input
                  style={{ ...inputStyle, padding: 'auto 4px', width: '600px' }}
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

              <div style={divStyle}>
                <span>Amount: </span>
                <input
                  style={inputStyle}
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.toString())}
                />
              </div>

              <br />
              <div style={divStyle}>
                <span>App Index: </span>
                <input
                  style={inputStyle}
                  type="number"
                  value={appIndex}
                  onChange={(event) =>
                    setAppIndex(event.target.value.toString())
                  }
                />
              </div>
              <p
                className="md:w-full text-center text-slate-300 my-2"
                style={labelStyle}
              >
                The App Index of the that will be credited with this
                transaction.
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
                onClick={
                  !!batch.length
                    ? () => completeBatchPayment()
                    : () => completePayment()
                }
                disabled={
                  sending ||
                  !mogami ||
                  (!batch.length &&
                    (!Number(amount) ||
                      !selectedFromAccount ||
                      (!selectedToAccount && !address)))
                }
              >
                {sending ? (
                  <div className="hidden group-disabled:block">Waiting...</div>
                ) : null}

                {(!sending && !appIndex) ||
                (!batch.length &&
                  (!Number(amount) ||
                    !selectedFromAccount ||
                    (!selectedToAccount && !address))) ? (
                  <span className="hidden group-disabled:block">
                    Can't Complete Payment
                  </span>
                ) : null}

                {batch.length ? (
                  <span className="block group-disabled:hidden">
                    Complete Batch Payment ({`${batch.length}`})
                  </span>
                ) : (
                  <span className="block group-disabled:hidden">
                    Complete Payment
                  </span>
                )}
              </button>

              <button
                className="group w-60 m-2 btn animate-pulse disabled:animate-none bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ... "
                onClick={addToBatch}
                disabled={
                  sending ||
                  !mogami ||
                  !appIndex ||
                  !Number(amount) ||
                  !selectedFromAccount ||
                  (!selectedToAccount && !address)
                }
              >
                {sending ? (
                  <div className="hidden group-disabled:block">Waiting...</div>
                ) : null}

                {(!sending && !appIndex) ||
                !Number(amount) ||
                !selectedFromAccount ||
                (!selectedToAccount && !address) ? (
                  <span className="hidden group-disabled:block">
                    Can't Add to Batch
                  </span>
                ) : null}

                <span className="block group-disabled:hidden">
                  Add to Batch
                </span>
              </button>
            </div>
          );
        }
      })()}
    </div>
  );
};
