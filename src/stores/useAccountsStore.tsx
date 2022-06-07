import create, { State } from 'zustand';
import { Keypair } from '@mogami/keypair';

interface Balances {
  [key: string]: string;
}

interface KinAccountsStore extends State {
  accounts: Keypair[];
  balances: Balances;
  addAccount: (account: Keypair) => void;
  updateBalance(account: Keypair, amount: string);
}

const useAccountsStore = create<KinAccountsStore>((set, _get) => ({
  accounts: [],
  balances: {},
  addAccount: (account: Keypair) => {
    set((s) => {
      s.accounts = [...s.accounts, account];
      s.balances[account.publicKey] = '0';
      console.log(`Account added, `, account.publicKey);
    });
  },
  updateBalance: (account: Keypair, balance: string) => {
    set((s) => {
      const updatedBalances = { ...s.balances };
      updatedBalances[account.publicKey] = balance;
      s.balances = updatedBalances;
    });
  },
}));

export default useAccountsStore;
