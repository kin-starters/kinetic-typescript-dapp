import { useCallback, useEffect, useState } from 'react';
import { Keypair } from '@mogami/keypair';
import useMogamiClientStore from '../stores/useMogamiClientStore';
import useAccountsStore from '../stores/useAccountsStore';
import { AccountInfo } from 'components/AccountInfo';
import { CreateKinAccount } from 'components/CreateKinAccount';

interface AccountHistory {
  account: Keypair;
}
const AccountHistory = ({ account }) => {
  const { mogami } = useMogamiClientStore();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  const getHistory = useCallback(async () => {
    setLoading(true);
    setHistory(null);
    const hstry = await mogami.getHistory(account.publicKey);
    setHistory(hstry);
    setLoading(false);
  }, [account?.publicKey]);

  useEffect(() => {
    if (account?.publicKey) {
      getHistory();
    }
  }, [account?.publicKey]);

  return (
    <div>
      {history?.data.length || loading ? (
        <div
          style={{
            width: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading ? (
            <div style={{ width: '100%' }}>Loading...</div>
          ) : (
            history.data.map((historyEvent) => {
              return (
                <div>
                  {historyEvent.history.map((hstry) => {
                    return (
                      <div
                        style={{ width: '608px' }}
                        className="p-5 my-5 text-left whitespace-pre-wrap break-words block absolute -inset-1 rounded border border-sky-500 relative"
                      >
                        <p>
                          Signature:{' '}
                          <span>
                            <a
                              href={
                                'https://explorer.solana.com/tx/' +
                                hstry.signature +
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
                          </span>
                          {hstry.signature}
                        </p>

                        <p>Status: {hstry.confirmationStatus}</p>
                        <p>Time: {hstry.blockTime}</p>
                        {hstry.memo && <p>Memo: {hstry.memo}</p>}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div
          style={{
            width: '608px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          No History
        </div>
      )}
    </div>
  );
};

export const History = () => {
  const { mogami } = useMogamiClientStore();
  const { accounts, balances } = useAccountsStore();
  const [selectedAccount, setSelectedAccount] = useState(accounts[0] || null);

  useEffect(() => {
    if (accounts.length === 1) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts]);

  return (
    <div className="md:w-full text-center text-slate-300 my-2">
      {mogami ? (
        <>
          {accounts.length > 0 ? (
            <>
              <div className="accounts">
                {accounts.map((account) => {
                  return (
                    <AccountInfo
                      key={account.publicKey}
                      publicKey={account.publicKey}
                      balance={balances[account.publicKey]}
                      select={() => setSelectedAccount(account)}
                      selected={
                        selectedAccount?.publicKey === account.publicKey
                      }
                    />
                  );
                })}
                <AccountHistory account={selectedAccount} />
              </div>
            </>
          ) : (
            <CreateKinAccount />
          )}
        </>
      ) : (
        <span>Not connected to Kin client...</span>
      )}
    </div>
  );
};
