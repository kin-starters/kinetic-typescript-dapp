import type { NextPage } from 'next';
import Head from 'next/head';
import { HistoryView } from '../views';

const SendKin: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Kinetic DApp Demo</title>
        <meta name="description" content="Basic Functionality" />
      </Head>
      <HistoryView />
    </div>
  );
};

export default SendKin;
