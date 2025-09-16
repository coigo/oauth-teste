'use client';
import queryString from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import axios from 'axios';

const OIDC_URL = 'http://localhost:4000';

export default function Home() {

  const generateChallange = async (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);

    const hashArray = Array.from(new Uint8Array(digest));
    const base64 = btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return base64;
  }

  const loginPKCE = async () => {
    const codeVerifier = randomBytes(45).toString('hex');

    const codeChallenge = await generateChallange(codeVerifier)
    localStorage.setItem('code_verifier', codeVerifier);

    const params = queryString.stringify({
      client_id: 'pkce-client',
      response_type: 'code',
      scope: 'openid profile email offline_access',
      redirect_uri: 'http://localhost:3000/callback',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      grant_type: 'authorization_code'
    });
    window.location.href = `${OIDC_URL}/auth?${params}`;
  };

  const loginConfidential = () => {
    const params = queryString.stringify({
      client_id: 'confidential-client',
      response_type: 'code',
      scope: 'openid profile email offline_access',
      redirect_uri: 'http://localhost:3000/callback',
      grant_type: 'authorization_code',
      prompt:'consent'
    });
    window.location.href = `${OIDC_URL}/auth?${params}`;
  };

  const refresh = async () => {
    try {
      const refreshToken = window.localStorage.getItem('refresh_token')
       const response = await axios.post(`${OIDC_URL}/token`, new URLSearchParams({
           grant_type: 'refresh_token',
            refresh_token: refreshToken,
          }), {
            auth: { username: 'confidential-client', password: 'supersecret' }
          })
               localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('id_token', response.data.id_token);
    }
    catch (err) {
      console.log(err)
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login POC OAuth2/OpenID Connect</h1>
      <button onClick={loginPKCE} style={{ marginRight: '1rem' }}>Login PKCE</button>
      <button onClick={loginConfidential}>Login Confidencial</button>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
