import React from 'react';

interface AccountInfoProps {
  publicKey: string;
  balance: string;
  selected?: boolean;
  select?: () => void;
}

export const AccountInfo = ({ publicKey, balance, selected, select }) => {
  return (
    <div
      className={`m-1 p-1 ${
        selected
          ? 'before:block before:absolute before:-inset-1  before:bg-pink-500 relative inline-block'
          : ''
      } ${select && !selected ? 'cursor-pointer' : ''}`}
      onClick={select && select}
    >
      <span className="relative text-white">{publicKey}</span>
      <span className="relative text-white">{` - `}</span>
      <span className="relative text-white">{balance} KIN</span>
    </div>
  );
};
