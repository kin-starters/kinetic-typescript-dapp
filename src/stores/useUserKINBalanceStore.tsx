import create, { State } from 'zustand'
import { Connection, PublicKey } from '@solana/web3.js'

interface UserKINBalanceStore extends State {
  balance: string;
  getUserKINBalance: (kinTokenAccounts: PublicKey[], connection: Connection) => void
}

const useUserKINBalanceStore = create<UserKINBalanceStore>((set, _get) => ({
  balance: '',
  getUserKINBalance: async ( kinTokenAccounts, connection) => {
    let balances = '';
    console.log("🚀 ~ balances", balances)
    try {
      const balancesArray = await Promise.all(
      kinTokenAccounts.map(async (tokenAccount) => {
        const tokenAmount = await connection.getTokenAccountBalance(
          tokenAccount
        );

        return {[tokenAccount.toBase58()]: Number(tokenAmount.value.amount) / 10000}
      })
    );
      console.log("🚀 ~ balancesArray", balancesArray)
      if(kinTokenAccounts.length === 1){
        balances = Object.values(balancesArray[0])[0].toString()
      } else {
        balances = balancesArray.length ?  JSON.stringify(balancesArray) : '0'
      }

    console.log('🚀 ~ balances', balances);
    } catch (e) {
      console.log(`error getting balance: `, e);
    }
    set((s) => {
      s.balance = balances;
      console.log(`balance updated, `, balances);
    })
  },
}));

export default useUserKINBalanceStore;