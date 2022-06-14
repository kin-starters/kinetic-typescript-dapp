import create, { State } from 'zustand';
import { Keypair } from '@mogami/keypair';

interface Hash {
  [key: string]: string;
}

interface AddAccount {
  account: Keypair;
  mnemonic: string;
  signature?: string;
}
interface KinAccountsStore extends State {
  accounts: Keypair[];
  mnemonics: Hash;
  signatures: Hash;
  balances: Hash;
  addAccount: ({ account, signature, mnemonic }: AddAccount) => void;
  updateBalance: (account: Keypair, amount: string) => void;
  getMnemonic: (publicKey: string) => string;
}

const useAccountsStore = create<KinAccountsStore>((set, _get) => ({
  accounts: [],
  signatures: {},
  mnemonics: {},
  balances: {},
  addAccount: ({ account, signature, mnemonic }: AddAccount) => {
    set((s) => {
      s.accounts = [...s.accounts, account];
      s.mnemonics[account.publicKey] = mnemonic;
      if (signature) s.signatures[account.publicKey] = signature;
      s.balances[account.publicKey] = '0';
      console.log(`Account added, `, account.publicKey);
    });
  },
  updateBalance: (account: Keypair, balance: string) => {
    set((s) => {
      const updatedBalances = { ...s.balances };
      if (updatedBalances[account.publicKey]) {
        updatedBalances[account.publicKey] = balance;
      }
      s.balances = updatedBalances;
    });
  },
  getMnemonic: (publicKey) => {
    const mnemonics = _get().mnemonics;
    return mnemonics[publicKey];
  },
}));

export default useAccountsStore;
