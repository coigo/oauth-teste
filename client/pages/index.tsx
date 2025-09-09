'use client';
import queryString from 'query-string';
import { v4 as uuidv4 } from 'uuid';

const OIDC_URL = 'http://localhost:4000';

export default function Home() {
  const loginPKCE = () => {
    const codeVerifier = uuidv4();
    const codeChallenge = btoa(codeVerifier).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    localStorage.setItem('code_verifier', codeVerifier);

    const params = queryString.stringify({
      client_id: 'pkce-client',
      response_type: 'code',
      scope: 'openid profile email offline_access',
      redirect_uri: 'http://localhost:3000/callback',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
    window.location.href = `${OIDC_URL}/auth?${params}`;
  };

  const loginConfidential = () => {
    const params = queryString.stringify({
      client_id: 'confidential-client',
      response_type: 'code',
      scope: 'openid profile email offline_access',
      redirect_uri: 'http://localhost:3000/callback',
    });
    window.location.href = `${OIDC_URL}/auth?${params}`;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login POC OAuth2/OpenID Connect</h1>
      <button onClick={loginPKCE} style={{ marginRight: '1rem' }}>Login PKCE</button>
      <button onClick={loginConfidential}>Login Confidencial</button>
    </div>
  );
}
