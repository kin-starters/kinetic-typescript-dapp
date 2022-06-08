import { FC } from 'react';
import { SendKin } from '../../components/SendKin';

export const SendKinView: FC = () => {
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center pb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-[#9945FF] to-[#14F195]">
          Send Kin
        </h1>
        <div className="text-center fade-in">
          <SendKin />
        </div>
      </div>
    </div>
  );
};
