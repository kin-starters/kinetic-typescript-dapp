import type { NextPage } from 'next';
import Head from 'next/head';
import { AccountView } from '../views';

const SendKin: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Kin Mogami Demo DApp</title>
        <meta name="description" content="Basic Functionality" />
      </Head>
      <AccountView />
    </div>
  );
};

export default SendKin;
