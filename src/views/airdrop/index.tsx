// Next, React
import { FC, useState, useEffect } from 'react';

// Components
import { RequestAirdrop } from 'components/RequestAirdrop';
import { CreateKinAccount } from 'components/CreateKinAccount';
import { AccountInfo } from 'components/AccountInfo';

// Kin
import useKineticClientStore from '../../stores/useKineticClientStore';
import useAccountsStore from '../../stores/useAccountsStore';

export const AirdropView: FC = () => {
  const { kinetic } = useKineticClientStore();
  const { accounts, balances, signatures } = useAccountsStore();
  console.log('🚀 ~ signatures', signatures);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0] || null);
  console.log('🚀 ~ selectedAccount', selectedAccount);

  const [address, setAddress] = useState('');

  const divStyle = {
    width: '700px',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  };
  const inputStyle = {
    color: 'black',
    paddingLeft: '5px',
    width: '550px',
  };

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center pb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Airdrop
        </h1>
        <div className="md:w-full text-center text-slate-300 my-2 fade-in">
          {kinetic ? (
            <>
              {
                <>
                  <RequestAirdrop
                    disabled={!selectedAccount && !address}
                    account={selectedAccount}
                    address={address}
                  />
                  <div style={divStyle}>
                    <span>To: </span>
                  </div>
                  <div
                    className={`my-4 py-3 px-5 ${
                      address && !selectedAccount
                        ? 'bg-pink-500 rounded'
                        : 'border border-sky-500 rounded'
                    } `}
                    style={{ margin: 'auto', width: '700px' }}
                  >
                    <input
                      style={{
                        ...inputStyle,
                        padding: 'auto 4px',
                        width: '600px',
                      }}
                      className="rounded"
                      type="text"
                      value={address}
                      onChange={(event) => {
                        setAddress(event.target.value);
                        setSelectedAccount(null);
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
                </>
              }
              {accounts.length > 0 ? (
                <>
                  <div className="accounts" style={{ width: '700px' }}>
                    {accounts.map((account) => {
                      return (
                        <AccountInfo
                          key={account.publicKey}
                          publicKey={account.publicKey}
                          balance={balances[account.publicKey]}
                          signature={signatures[account.publicKey]}
                          select={(reset) => {
                            setAddress('');
                            if (reset) {
                              setSelectedAccount(null);
                            } else {
                              setSelectedAccount(account);
                            }
                          }}
                          selected={
                            selectedAccount?.publicKey === account.publicKey
                          }
                        />
                      );
                    })}
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
      </div>
    </div>
  );
};
