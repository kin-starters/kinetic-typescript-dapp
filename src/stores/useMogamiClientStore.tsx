import create, { State } from 'zustand';
import { MogamiSdk } from '@mogami/sdk';

interface MogamiClientStore extends State {
  mogami: MogamiSdk | null;
  setupMogami: () => void;
}

const useMogamiClientStore = create<MogamiClientStore>((set, _get) => ({
  mogami: null,
  setupMogami: () => {
    MogamiSdk.setup({ environment: 'devnet', index: 1 })
      .then((newSdk) => set({ mogami: newSdk }))
      .then(() => console.log(`configureSdk for devnet`));
  },
}));

export default useMogamiClientStore;
