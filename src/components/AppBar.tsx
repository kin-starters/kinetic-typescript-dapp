import { FC } from 'react';
import Link from 'next/link';

import Logo from '../assets/svg/kin.svg';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const AppBar: FC = (props) => {
  return (
    <div>
      {/* NavBar / Header */}
      <div className="navbar flex flex-row md:mb-2 shadow-lg bg-neutral text-neutral-content">
        <div className="navbar-start">
          <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
            <svg
              className="inline-block w-6 h-6 stroke-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>

          <div className="hidden sm:inline w-22 h-22 md:p-2">
            <Logo className="Logo" />
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:inline md:navbar-center">
          <div className="flex items-stretch">
            <Link href="/">
              <a className="btn btn-ghost btn-sm rounded-btn">Home</a>
            </Link>

            <Link href="/account">
              <a className="btn btn-ghost btn-sm rounded-btn">Accounts</a>
            </Link>
            <Link href="/airdrop">
              <a className="btn btn-ghost btn-sm rounded-btn">Airdrop</a>
            </Link>
            <Link href="/transaction">
              <a className="btn btn-ghost btn-sm rounded-btn">Send Kin</a>
            </Link>
            <Link href="/history">
              <a className="btn btn-ghost btn-sm rounded-btn">History</a>
            </Link>
          </div>
        </div>

        {/* Wallet & Settings */}
        <div className="navbar-end"></div>
      </div>
      {props.children}
    </div>
  );
};
