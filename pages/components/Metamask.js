import styles from '../../styles/Home.module.css'

import React, { useState, useEffect } from 'react';

import { ethers } from 'ethers'

import { formatMessage, fetchSettings } from '../../utils/eth-login';

export default function MetaMask(props) {
    const session = props.session;
      
    const [metamask, setMetamask] = useState();
    const [requestId, setRequestId] = useState(1);
    
    const requestAccount = async () => {
      await metamask.request({ method: 'eth_requestAccounts' });
    }
    
    const loginWithMetaMask = async () => {
      await requestAccount();
      
      const now = new Date();
  
      setRequestId(requestId  + 1);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
  
      const address = await signer.getAddress();
      const chainId = await signer.getChainId();
      
      const settings = await fetchSettings();
  
      const allSettings = {
        ...settings, 
        chainId: chainId,
        address: address,
        issuedAt: now.toISOString(),
        expirationTime: new Date(now + settings.notAfter * 60000).toISOString(),
        notBefore: new Date(now - settings.notBefore * 60000).toISOString(),
        requestId: requestId
      };
  
      const message = formatMessage(allSettings);
  
      const signature = await signer.signMessage(message);
  
      props.signIn('credentials',
        {
          address: allSettings.address,
          issuedAt: allSettings.issuedAt,
          requestId: allSettings.requestId,
          chainId: allSettings.chainId,
          signature: signature,
          callbackUrl: `${window.location.origin}/`
        }
      )
    }
  
    useEffect(() => {
      setMetamask(window.ethereum);
    }, []);
  
    return (
        <div>
          
          {!metamask && <p className={styles.description}>This sample requires Metamask</p>}
  
          {!session && metamask && <button onClick={loginWithMetaMask} className={styles.button}><img src="/metamask.png" className={styles.buttonImage}></img> Login with Metamask</button>}
  
        </div>
    )
  }