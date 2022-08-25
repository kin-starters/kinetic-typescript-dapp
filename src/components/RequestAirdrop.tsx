import { useCallback, useState } from 'react';
import { notify } from '../utils/notifications';

import useKineticClientStore from '../stores/useKineticClientStore';
import useAccountsStore from '../stores/useAccountsStore';

export const RequestAirdrop = ({ account, disabled, address }) => {
  const { kinetic } = useKineticClientStore();
  const { updateBalance } = useAccountsStore();

  const [sending, setSending] = useState(false);

  const onClick = useCallback(async () => {
    if (!account?.publicKey && !address) {
      console.log('error', 'No Address!');
      notify({
        type: 'error',
        message: 'error',
        description: 'No Address!',
      });
      return;
    }

    try {
      setSending(true);
      const airdrop = await kinetic.requestAirdrop({
        account: account?.publicKey || address,
        amount: '1000',
      });
      console.log('🚀 ~ airdrop', airdrop);

      notify({
        type: 'success',
        message: 'KIN Airdrop successful!',
        txid: airdrop.signature,
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
      if (account.publicKey) {
        const balance = await kinetic.getBalance({
          account: account.publicKey,
        });
        const balanceInKin = (Number(balance.balance) / 100000).toString();
        updateBalance(account, balanceInKin);
      }
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
