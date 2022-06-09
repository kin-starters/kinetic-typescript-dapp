import { useCallback, useState } from 'react';
import { Keypair } from '@mogami/keypair';
import { notify } from '../utils/notifications';
import useMogamiClientStore from '../stores/useMogamiClientStore';
import useAccountsStore from '../stores/useAccountsStore';
import { AccountInfo } from './AccountInfo';

interface CreateKinAccountProps {
  withInput?: boolean;
  disabled?: boolean;
}

export const CreateKinAccount = ({
  withInput = false,
  disabled = false,
}: CreateKinAccountProps) => {
  const { mogami } = useMogamiClientStore();
  const { accounts, addAccount, balances, updateBalance, getMnemonic } =
    useAccountsStore();

  const [sending, setSending] = useState(false);
  const [fromMnemonic, setFromMnemonic] = useState('');

  const onClick = async () => {
    let account;
    let balance;

    try {
      setSending(true);
      const mnemonic = fromMnemonic || Keypair.generateMnemonic();
      const keypair = Keypair.fromMnemonic(mnemonic);

      if (fromMnemonic) {
        if (accounts.find((acc) => acc.publicKey === keypair.publicKey)) {
          setFromMnemonic('');
          throw new Error('Account already exists!');
        }
        try {
          const rawBalance = await mogami.balance(keypair.publicKey);
          balance = (Number(rawBalance.value) / 100000).toString();
          setFromMnemonic('');
        } catch (error) {
          console.log('🚀 ~ error', error);
        }
        try {
          account = await mogami.createAccount(keypair);
          setFromMnemonic('');
        } catch (error) {
          console.log('🚀 ~ error', error);
        }
      } else {
        account = await mogami.createAccount(keypair);
      }

      addAccount(keypair, mnemonic);

      if (account) {
        notify({
          type: 'success',
          message: ' Account Creation successful!',
          txid: account.signature,
        });
      }

      if (balance) {
        updateBalance(keypair, balance);
        notify({
          type: 'success',
          message: ' Account Found!',
        });
      }
    } catch (error: any) {
      notify({
        type: 'error',
        message: `Create  Account failed!`,
        description: error?.message,
      });
      console.log('error', ` Account Creation failed! ${error?.message}`);
    }
    setSending(false);
  };

  const createButton = (
    <button
      className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
      onClick={onClick}
      disabled={disabled || sending}
    >
      {sending ? <span>Creating...</span> : <span>Create Kin Account</span>}
    </button>
  );

  const inputStyle = {
    color: 'black',
    padding: '5px',
    width: '550px',
  };

  return (
    <div className="md:w-full text-center text-slate-300 my-2">
      {mogami ? (
        <>
          {withInput ? (
            <>
              {createButton}
              <p
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginTop: '10px',
                }}
              >
                <span
                  style={{
                    width: '150px',
                    margin: 'auto 0',
                    textAlign: 'left',
                  }}
                >
                  From Mnemonic:{' '}
                </span>
                <input
                  style={inputStyle}
                  type="text"
                  value={fromMnemonic}
                  onChange={(event) => {
                    setFromMnemonic(event.target.value);
                  }}
                />
              </p>
            </>
          ) : (
            <>{createButton}</>
          )}

          {accounts.length ? (
            <div className="accounts">
              {accounts.map((account) => {
                return (
                  <AccountInfo
                    key={account.publicKey}
                    publicKey={account.publicKey}
                    balance={balances[account.publicKey]}
                    getMnemonic={getMnemonic}
                  />
                );
              })}
            </div>
          ) : null}
        </>
      ) : (
        <span>Not connected to Kin client...</span>
      )}
    </div>
  );
};
