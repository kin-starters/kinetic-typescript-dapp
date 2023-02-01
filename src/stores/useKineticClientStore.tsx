import create, { State } from 'zustand';
import { KineticSdk, KineticSdkConfig } from '@kin-kinetic/sdk';
import { Commitment } from '@kin-kinetic/solana';

interface KineticClientStore extends State {
  kinetic: KineticSdk | null;
  setupKinetic: () => void;
}

const useKineticClientStore = create<KineticClientStore>((set, _get) => ({
  kinetic: null,
  setupKinetic: () => {
    const config: KineticSdkConfig = {
      environment: 'devnet',
      endpoint: 'https://sandbox.kinetic.host/',
      index: 1,
      commitment: Commitment.Confirmed,
    };

    if (process.env.KINETIC_LOCAL_API) {
      config.endpoint = process.env.KINETIC_LOCAL_API;
    }

    KineticSdk.setup(config)
      .then((newSdk) => set({ kinetic: newSdk }))
      .then(() => console.log(`configureSdk for devnet`))
      .catch((error) => {
        console.log('🚀 ~ error', error);
      });
  },
}));

export default useKineticClientStore;
