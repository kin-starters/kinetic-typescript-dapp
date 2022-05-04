import { FC } from 'react';
import { CreateKinTokenAccount } from '../../components/CreateKinTokenAccount';

export const AccountView: FC = () => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Kin Token Account
        </h1>
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <p>
            For an account to receive Kin, they must have a Kin Token Account.
            This costs SOL.
          </p>
        </h4>
        <div className="text-center fade-in">
          <CreateKinTokenAccount withInput />
        </div>
      </div>
    </div>
  );
};
