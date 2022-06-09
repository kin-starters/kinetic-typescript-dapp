import create, { State } from 'zustand';
import { Keypair } from '@mogami/keypair';

interface Hash {
  [key: string]: string;
}

interface KinAccountsStore extends State {
  accounts: Keypair[];
  mnemonics: Hash;
  balances: Hash;
  addAccount: (account: Keypair, mnemonic: string) => void;
  updateBalance: (account: Keypair, amount: string) => void;
  getMnemonic: (publicKey: string) => string;
}

const useAccountsStore = create<KinAccountsStore>((set, _get) => ({
  accounts: [],
  mnemonics: {},
  balances: {},
  addAccount: (account: Keypair, mnemonic: string) => {
    set((s) => {
      s.accounts = [...s.accounts, account];
      s.mnemonics[account.publicKey] = mnemonic;
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
  getMnemonic: (publicKey) => {
    const mnemonics = _get().mnemonics;
    return mnemonics[publicKey];
  },
}));

export default useAccountsStore;
