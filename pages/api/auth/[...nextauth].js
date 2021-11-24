import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials';

import { ethers } from 'ethers';
import { formatMessage, getServerSettings } from '../../../utils/eth-login';


const nextAuthOptions = (req, res) => {
  return {
    providers: [
      CredentialsProvider({
        async authorize(credentials) {
          const nonce = req.cookies["eth-nonce"];

          const issuedAt = new Date(credentials.issuedAt);

          const serverSettings = getServerSettings(nonce);
          const allSettings = {
            ...serverSettings,
            address: credentials.address,
            requestId: credentials.requestId,
            chainId: credentials.chainId,
            issuedAt: issuedAt.toISOString(),
            expirationTime: new Date(issuedAt + serverSettings.notAfter * 60000).toISOString(),
            notBefore: new Date(issuedAt - serverSettings.notBefore * 60000).toISOString(),
          };

          const message = formatMessage(allSettings);

          const recoveredAddress = ethers.utils.verifyMessage(message, credentials.signature);

          if (recoveredAddress !== credentials.address) {
            console.log(`authentication failed ${recoveredAddress} != ${credentials.address}`);
            throw new Error("user can not be authenticated");
          }

          const user = { name: recoveredAddress }

          return user;
        }
      })
    ]
  }
}

export default (req, res) => {
  return NextAuth(req, res, nextAuthOptions(req, res))
}