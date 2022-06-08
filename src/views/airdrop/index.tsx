// Next, React
import { FC, useState } from 'react';

// Components
import { RequestAirdrop } from 'components/RequestAirdrop';
import { CreateKinAccount } from 'components/CreateKinAccount';
import { AccountInfo } from 'components/AccountInfo';

// Kin
import useMogamiClientStore from '../../stores/useMogamiClientStore';
import useAccountsStore from '../../stores/useAccountsStore';

export const AirdropView: FC = () => {
  const { mogami } = useMogamiClientStore();
  const { accounts, balances } = useAccountsStore();
  const [selectedAccount, setSelectedAccount] = useState(accounts[0] || null);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center pb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Airdrop
        </h1>
        <div className="md:w-full text-center text-slate-300 my-2 fade-in">
          {mogami ? (
            <>
              {accounts.length > 0 ? (
                <>
                  <RequestAirdrop
                    disabled={!selectedAccount}
                    account={selectedAccount}
                  />

                  <div className="accounts">
                    {accounts.map((account) => {
                      console.log('🚀 ~ account', account);

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
