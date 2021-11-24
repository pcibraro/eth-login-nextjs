import Head from 'next/head'
import styles from '../../styles/Home.module.css'

import React, { useState } from 'react';

import { formatMessage, fetchSettings } from '../../utils/eth-login';
import WalletConnect from '@walletconnect/web3-provider';
import { ethers } from 'ethers';


//import WalletConnect from "@walletconnect/client";
//import QRCodeModal from "@walletconnect/qrcode-modal";

//import { convertUtf8ToHex } from "@walletconnect/utils";

export default function WalletConnectLogin(props) {
  
  
  const connect = async () => {
    
  
    const walletconnect = new WalletConnect({
      infuraId: props.infura,
    });
  
    walletconnect.enable();
    const provider = new ethers.providers.Web3Provider(walletconnect);
  
    const [address] = await provider.listAccounts();
    if (!address) {
      throw new Error('Address not found.');
    }
  
    const signature = await provider.getSigner().signMessage("hello world");
   console.log(signature);

  }
  
  

return (
  <div>

    {!props.session && <button onClick={connect} className={styles.button}><img src="/walletconnect.png" className={styles.buttonImage}></img>Login with WalletConnect</button>}



  </div>
)
};
