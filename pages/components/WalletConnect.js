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
    
    const connector = wc;
        
    if(connector) {
      console.log(`connector session ${connector.connected}`);
      // check if already connected
      if (connector.connected) {
        console.log('trying to sign data');
        await signData(connector);

        return;
      }
    }
    
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });
    
    console.log(`creating session on Connect`);
        
    // create new session
    await connector.createSession();

    // subscribe to events
    await subscribeToEvents(connector);

    setwc(connector);
  };

  const signData = async (connector) => {
    
    const { chainId, accounts } = connector;
    const address = accounts[0];

    console.log(`address ${address}`);

    const hexMsg = convertUtf8ToHex('hello world');

    // eth_sign params
    const msgParams = [hexMsg, address];

    console.log('sending sign');

    // send message
    const signature = await connector.signPersonalMessage(msgParams);
  }

  const onConnect = async (connector, payload) => {
    //signMessage(connector);

    console.log(`On Connect. Signing data.`);
    console.log('connector instance');
    console.log(connector);

    await signData(connector);
  };

  const subscribeToEvents = (connector) => {
    console.log('subscribing to events');


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

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      //const { chainId, accounts } = payload.params[0];
      
      //await signData();

    });


    if (connector.connected) {
      
      const { chainId, accounts } = connector;
      const address = accounts[0];
      
      console.log('events subscribed. Connection open');
      
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

      

      </div>
  )
}
