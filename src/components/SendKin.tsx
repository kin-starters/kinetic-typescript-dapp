import { FC, useEffect, useState } from 'react';
import {
  MakeTransferBatchOptions,
  TransferDestination,
} from '@kin-kinetic/sdk';
import { TransactionType } from '@kin-tools/kin-memo';
import { Commitment } from '@kin-kinetic/solana';

import useKineticClientStore from '../stores/useKineticClientStore';
import useAccountsStore from '../stores/useAccountsStore';
import { AccountInfo } from 'components/AccountInfo';
import { CreateKinAccount } from 'components/CreateKinAccount';

import { useStatus } from 'hooks/useStatus';

import { notify } from '../utils/notifications';

export const SendKin: FC = () => {
  const { kinetic } = useKineticClientStore();
  const { accounts, balances, updateBalance, signatures } = useAccountsStore();
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

  const [signature, setSignature] = useState('');
  const [balancesToUpdate, setBalancesToUpdate] = useState([]);
  const [confirmations, finalized] = useStatus({ signature });

  const reset = () => {
    setSelectedFromAccount(null);
    setSelectedToAccount(null);
    setAppIndex('');
    setAddress('');
    setAmount('');
    setSending(false);
    setBatch([]);
    setSignature('');
    setBalancesToUpdate([]);
  };

  const updateBalances = (accs: string[]) => {
    try {
      const promises = accs.map((acc) => {
        return async () => {
          const balance = await kinetic.getBalance({ account: acc });
          const balanceInKin = (Number(balance.balance) / 100000).toString();
          const account = accounts.find((ac) => ac.publicKey === acc);
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

  useEffect(() => {
    if (finalized && sending && balancesToUpdate.length) {
      notify({
        type: 'success',
        message: 'Transaction successful!',
        txid: signature,
      });
      updateBalances(balancesToUpdate);
      reset();
    }
  }, [confirmations, finalized, sending, balancesToUpdate]);

  const addToBatch = () => {
    const newTransaction: TransferDestination = {
      amount,
      destination: selectedToAccount.publicKey || address,
    };
    setBatch([...batch, newTransaction]);
  };

  const completeBatchPayment = async () => {
    if (!kinetic) {
      notify({ type: 'error', message: `Kin Client not connected!` });
      console.log('error', `Send Transaction: Kin Client not connected!`);
    }

    try {
      setSending(true);
      notify({
        type: 'info',
        message: 'Transaction on its way!',
      });

      const batchOptions: MakeTransferBatchOptions = {
        commitment: Commitment.Confirmed,
        owner: selectedFromAccount,
        type: TransactionType.P2P,
        destinations: batch,
      };

      const transaction = await kinetic.makeTransferBatch(batchOptions);

      if (!transaction.signature) {
        notify({
          type: 'success',
          message:
            'Transaction confirmed. Check your balance in a minute once its finalized',
          txid: signature,
        });
      } else {
        setSignature(transaction.signature);
      }
      console.log('🚀 ~ transaction', transaction);
    } catch (error: any) {
      error.message &&
        notify({
          type: 'error',
          message: `Transaction failed!`,
          description: error?.message,
        });
      console.log('error', `Transaction failed! ${error?.message}`);
      setSending(false);
    }

    const toUpdate = [
      ...new Set([
        selectedFromAccount.publicKey,
        ...batch.map((send) => send.destination),
      ]),
    ];

    setBalancesToUpdate(toUpdate);
  };

  const completePayment = async () => {
    if (!kinetic) {
      notify({ type: 'error', message: `Kin Client not connected!` });
      console.log('error', `Send Transaction: Kin Client not connected!`);
    }

    try {
      setSending(true);
      notify({
        type: 'info',
        message: 'Transaction on its way!',
      });
      const transaction = await kinetic.makeTransfer({
        amount,
        commitment: Commitment.Confirmed,
        destination: address || selectedToAccount.publicKey,
        owner: selectedFromAccount,
        type: TransactionType.P2P,
      });
      console.log('🚀 ~ transaction', transaction);
      setSignature(transaction.signature);
    } catch (error: any) {
      error.message &&
        notify({
          type: 'error',
          message: `Transaction failed!`,
          description: error?.message,
        });
      console.log('error', `Transaction failed! ${error?.message}`);
      setSending(false);
    }

    const toUpdate = [selectedFromAccount.publicKey];
    if (selectedToAccount) {
      toUpdate.push(selectedToAccount.publicKey);
    }
    setBalancesToUpdate(toUpdate);
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
        if (!kinetic) {
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
                        signature={signatures[account.publicKey]}
                        select={(reset) =>
                          reset
                            ? setSelectedFromAccount(null)
                            : setSelectedFromAccount(selected ? null : account)
                        }
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
                        signature={signatures[account.publicKey]}
                        select={(reset) =>
                          reset
                            ? setSelectedToAccount(null)
                            : setSelectedToAccount(selected ? null : account)
                        }
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
                    `${
                      process.env.KINETIC_LOCAL_SOLANA
                        ? `?cluster=custom&customUrl=${process.env.KINETIC_LOCAL_SOLANA}`
                        : '?cluster=devnet'
                    }`
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
                  !kinetic ||
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
                  !kinetic ||
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
              {confirmations ? <div>Confirmations: {confirmations}</div> : null}
            </div>
          );
        }
      })()}
    </div>
  );
};
