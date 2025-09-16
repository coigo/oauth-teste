'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Callback() {
  const [info, setInfo] = useState(null);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;
    const pkce = !!localStorage.getItem('code_verifier');

    (async () => {
      try {
        let response;
        if (pkce) {
          console.log('foi como pkce')
          const code_verifier = localStorage.getItem('code_verifier');
          response = await axios.post('http://localhost:4000/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:3000/callback',
            client_id: 'pkce-client',
            code_verifier: code_verifier as string
          }));
        } else {
          console.log('foi normal')
          response = await axios.post('http://localhost:4000/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:3000/callback'
          }), {
            auth: { username: 'confidential-client', password: 'supersecret' }
          });
        }
        console.log(response.data)
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('id_token', response.data.id_token);
        // window.location.href = 'data'

      } catch (e) {
        setInfo(e.response?.data || e.message);
      }
    })();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Callback POC</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <div style={{ marginTop: '1rem' }}>
        <strong>API Response:</strong>
        <pre>{JSON.stringify(apiData, null, 2)}</pre>
      </div>
    </div>
  );
}
