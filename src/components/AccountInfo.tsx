import React, { useState } from 'react';

interface AccountInfoProps {
  publicKey: string;
  balance: string;
  selected?: boolean;
  select?: () => void;
  disabled?: boolean;
  disabledSelected?: boolean;
  getMnemonic?: (publicKey: string) => void;
}

export const AccountInfo = ({
  publicKey,
  balance,
  selected,
  select,
  disabled,
  disabledSelected,
  getMnemonic,
}: AccountInfoProps) => {
  const [mnemonic, setMnemonic] = useState(null);
  return (
    <div
      className={`my-4 py-3 px-5 ${
        selected
          ? `rounded bg-pink-500 relative ${
              disabledSelected ? 'opacity-60 pointer-events-none' : ''
            }`
          : `rounded border border-sky-500 relative ${
              disabled ? 'opacity-25 pointer-events-none' : ''
            }`
      } ${select ? 'cursor-pointer' : ''} `}
      onClick={select && select}
    >
      <span className="relative text-white">{publicKey}</span>
      <span className="relative text-white">{` - `}</span>
      <span className="relative text-white">{balance} KIN</span>
      <span>
        <a
          href={
            'https://explorer.solana.com/address/' +
            publicKey +
            `?cluster=devnet`
          }
          target="_blank"
          rel="noreferrer"
          className="inline-flex link link-accent"
          style={{ position: 'relative', width: '20px' }}
        >
          <svg
            className="flex-shrink-0 h-4 ml-2 text-primary-light w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ position: 'absolute', top: '-14' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            ></path>
          </svg>
        </a>
      </span>
      {getMnemonic ? (
        <span
          onClick={() => {
            if (mnemonic) {
              setMnemonic(null);
            } else {
              setMnemonic(getMnemonic(publicKey));
            }
          }}
          className="rounded bg-pink-500 px-2 py-1 ml-5 inline-flex cursor-pointer"
        >
          <span className="m-auto">Secret</span>
        </span>
      ) : null}
      {mnemonic ? (
        <p style={{ width: '80%', margin: '10px auto auto' }}>{mnemonic}</p>
      ) : null}
    </div>
  );
};
