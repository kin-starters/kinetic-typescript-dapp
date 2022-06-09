import { FC } from 'react';
import { CreateKinAccount } from '../../components/CreateKinAccount';

export const AccountView: FC = () => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center pb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Create Kin Account
        </h1>

        <div className="text-center fade-in" style={{ width: '700px' }}>
          <CreateKinAccount withInput />
        </div>
      </div>
    </div>
  );
};
