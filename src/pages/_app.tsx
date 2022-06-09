import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, useState } from 'react';
// import { ContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification';
import useMogamiClientStore from '../stores/useMogamiClientStore';

require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const { setupMogami, mogami } = useMogamiClientStore();
  const [settingUp, setSettingUp] = useState(false);
  if (!mogami && !settingUp) {
    setupMogami();
    setSettingUp(true);
  }

  return (
    <>
      <Head>
        <title>Kin Mogami Demo DApp</title>
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
