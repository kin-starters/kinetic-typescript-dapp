import type { NextPage } from 'next';
import Head from 'next/head';
import { HomeView } from '../views';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Kinetic DApp Demo</title>
        <meta name="description" content="Kinetic DApp Demo" />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
