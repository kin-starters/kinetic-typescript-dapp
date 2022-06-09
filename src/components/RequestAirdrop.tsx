import { useCallback, useState } from 'react';
import { notify } from '../utils/notifications';

import useMogamiClientStore from '../stores/useMogamiClientStore';
import useAccountsStore from '../stores/useAccountsStore';

export const RequestAirdrop = ({ account, disabled }) => {
  const { mogami } = useMogamiClientStore();
  const { balances, updateBalance } = useAccountsStore();

  const [sending, setSending] = useState(false);

  const onClick = useCallback(async () => {
    if (!account.publicKey) {
      console.log('error', 'Kin Client not connected!');
      notify({
        type: 'error',
        message: 'error',
        description: 'Wallet not connected!',
      });
      return;
    }

    try {
      setSending(true);
      const airdrop = await mogami.requestAirdrop(account.publicKey, '1000');

      notify({
        type: 'success',
        message: 'KIN Airdrop successful!',
        txid: airdrop.data.signature,
      });
    } catch (error: any) {
      notify({
        type: 'error',
        message: `KIN Airdrop failed!`,
        description: error?.message,
      });
      console.log('error', `Airdrop failed! ${error?.message}`);
    }
    setSending(false);

    try {
      const balance = await mogami.balance(account.publicKey);
      const balanceInKin = (Number(balance.value) / 100000).toString();
      updateBalance(account, balanceInKin);
    } catch (error) {
      console.log('🚀 ~ error', error);
    }
  }, [account]);

  return (
    <div>
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={onClick}
        disabled={disabled || sending}
      >
        {sending ? <span>Airdropping...</span> : <span>Airdrop 1000 Kin </span>}
      </button>
    </div>
  );
};
