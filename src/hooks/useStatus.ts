import React, { useState, useEffect } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export const useStatus = ({ signature }) => {
  const connection = new Connection(clusterApiUrl('devnet'));
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const getStatus = async () => {
      try {
        const currentStatus = await connection.getSignatureStatus(signature, {
          searchTransactionHistory: true,
        });
        setStatus(currentStatus.value);
        if (currentStatus?.value?.confirmationStatus != 'finalized') {
          setTimeout(() => {
            getStatus();
          }, 1000);
        }
      } catch (error) {}
    };

    if (signature) {
      getStatus();
    } else {
      setStatus(null);
    }
  }, [signature]);
  return [
    status?.confirmations || 0,
    status?.confirmationStatus === 'finalized',
  ];
};
