import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, useState } from 'react';
// import { ContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification';
import useKineticClientStore from '../stores/useKineticClientStore';

require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const { setupKinetic, kinetic } = useKineticClientStore();
  const [settingUp, setSettingUp] = useState(false);
  if (!kinetic && !settingUp) {
    setupKinetic();
    setSettingUp(true);
  }

  return (
    <>
      <Head>
        <title>Kinetic DApp Demo</title>
      </Head>

      <div className="flex flex-col h-screen">
        <Notifications />
        <AppBar />
        <ContentContainer>
          <Component {...pageProps} />
        </ContentContainer>
        <Footer />
      </div>
    </>
  );
};

export default App;
