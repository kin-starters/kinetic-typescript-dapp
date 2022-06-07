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
  const { accounts, addAccount, balances } = useAccountsStore();
  console.log('🚀 ~ accounts', accounts);

  const [sending, setSending] = useState(false);
  const [address, setAddress] = useState('');

  const onClick = async () => {
    let account;

    try {
      setSending(true);
      const keypair = Keypair.generate();
      console.log('🚀 ~ keypair', keypair);

      account = await mogami.createAccount(keypair);
      console.log('🚀 ~ account', account);
      addAccount(keypair);

      notify({
        type: 'success',
        message: ' Account Creation successful!',
        txid: account.signature,
      });
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
      disabled={disabled || sending || (withInput && !address)}
    >
      {sending ? <span>Creating...</span> : <span>Create Kin Account</span>}
    </button>
  );

  const inputStyle = { color: 'black', paddingLeft: '5px', width: '500px' };

  return (
    <div className="md:w-full text-center text-slate-300 my-2">
      {mogami ? (
        <>
          {withInput ? (
            <>
              <p style={{ display: 'flex', flexDirection: 'column' }}>
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
            <>{createButton}</>
          )}

          {accounts.length ? (
            <div className="accounts">
              {accounts.map((account) => {
                console.log('🚀 ~ account', account);

                return (
                  <AccountInfo
                    key={account.publicKey}
                    publicKey={account.publicKey}
                    balance={balances[account.publicKey]}
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
