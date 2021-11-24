import Head from 'next/head'
import styles from '../../styles/Home.module.css'

import React, { useState } from 'react';

import { formatMessage, fetchSettings } from '../../utils/eth-login';

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { convertUtf8ToHex } from "@walletconnect/utils";

export default function WalletConnectLogin(props) {
  const [requestId, setRequestId] = useState(1);
  const [wc, setwc] = useState();

  const connect = async () => {
    
    connector = wc;

    if(connector) {
      //return signMessage(connector);
    }
    
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
    
    // check if already connected
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }

    // subscribe to events
    await subscribeToEvents(connector);

    setwc(connector);
  };

  const signData = async () => {
    const { chainId, accounts } = wc;
    const address = accounts[0];

    const hexMsg = convertUtf8ToHex('hello world');

    // eth_sign params
    const msgParams = [hexMsg, address];

    // send message
    const signature = await wc.signPersonalMessage(msgParams);
  }

  const onConnect = async (connector, payload) => {
    //signMessage(connector);
  };

  const subscribeToEvents = (connector) => {
    if (!connector) {
      return;
    }

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      onConnect(connector, payload);
    });

    if (connector.connected) {
      
      const { chainId, accounts } = connector;
      const address = accounts[0];
      
      //signMessage(connector);
    }

  };

  const signMessage = async (connector) => {
    const now = new Date();
  
    setRequestId(requestId  + 1);

    const settings = await fetchSettings();
  
    const { chainId, accounts } = connector;
    const address = accounts[0];
    
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
    
    const hexMsg = convertUtf8ToHex(message);

    // eth_sign params
    const msgParams = [hexMsg, address];

    // send message
    const signature = await connector.signPersonalMessage(msgParams);
    
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

  return (
      <div>

        {!props.session && <button onClick={connect} className={styles.button}><img src="/walletconnect.png" className={styles.buttonImage}></img>Login with WalletConnect</button>}

        <button onClick={signData} className={styles.button}><img src="/walletconnect.png" className={styles.buttonImage}></img>Sign data with WalletConnect</button>

      </div>
  )
}
