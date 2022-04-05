import { useState, useEffect} from 'react'
import { PublicKey, Connection } from '@solana/web3.js';


const KIN_MINT_MAINNET = 'kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6'
const KIN_MINT_DEVNET = 'KinDesK3dYWo3R2wDk6Ucaf31tvQCCSYyL8Fuqp33GX'
// const KIN_MINT_DEVNET = 'KinD3xAzuqX3LJbxUG13peGnqjpV5dRcHV8tsdsrbeZ'

interface UseTokenAccounts {
  publicKey: PublicKey,
  connection: Connection,
}
export default function useTokenAccounts({publicKey, connection}: UseTokenAccounts): PublicKey[] {
  console.log("🚀 ~ publicKey", publicKey)
  const [tokenAccounts, setTokenAccounts] = useState<PublicKey[]>([])

  useEffect(() => {

    async function getTokenAccounts(){
      const mint = new PublicKey(KIN_MINT_DEVNET)
      const {value} = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { mint }
    );
      console.log("🚀 ~ value", value)

      if(value.length) setTokenAccounts(value.map(account => account.pubkey))

    
    }
    if(publicKey){
      

    getTokenAccounts()
    }
      
  }, [publicKey])
  
  return tokenAccounts
}
