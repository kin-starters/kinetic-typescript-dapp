import create, { State } from 'zustand';
import { Connection, PublicKey } from '@solana/web3.js';

interface UserKINBalanceStore extends State {
  balance: string;
  getUserKINBalance: (
    kinTokenAccounts: PublicKey[],
    connection: Connection
  ) => void;
}

const useUserKINBalanceStore = create<UserKINBalanceStore>((set, _get) => ({
  balance: '',
  getUserKINBalance: async (kinTokenAccounts, connection) => {
    let balances = '';
    if (kinTokenAccounts.length === 0) {
      balances = '';
    } else {
      try {
        const balancesArray = await Promise.all(
          kinTokenAccounts.map(async (tokenAccount) => {
            const tokenAmount = await connection.getTokenAccountBalance(
              tokenAccount
            );

            return {
              [tokenAccount.toBase58()]:
                Number(tokenAmount.value.amount) / 100000,
            };
          })
        );
        if (kinTokenAccounts.length === 1) {
          balances = Object.values(balancesArray[0])[0].toString();
        } else {
          balances = balancesArray.length ? JSON.stringify(balancesArray) : '0';
        }
      } catch (e) {
        console.log(`error getting balance: `, e);
      }
    }

    set((s) => {
      s.balance = balances;
      console.log(`balance updated, `, balances);
    });
  },
}));

export default useUserKINBalanceStore;
