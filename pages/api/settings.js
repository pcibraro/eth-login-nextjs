// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import crypto from 'crypto';
import { serialize } from 'cookie';
import { getServerSettings } from '../../utils/eth-login';

export default function handler(req, res) {
  if(req.method === "GET") {
    const nonce = crypto.randomBytes(32).toString('base64');

    const response = getServerSettings(nonce);

    res.setHeader('Set-Cookie', serialize('eth-nonce', nonce, { httpOnly: true, sameSite: 'strict', secure: true }));

    return res.status(200).json(response);

  }

  res.status(405);
}
