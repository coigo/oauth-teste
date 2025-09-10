'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Callback() {
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          console.error('No access token found in localStorage');
          return;
        }

        // chama API protegida direto
        const apiResp = await axios.get('http://localhost:4000/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setApiData(apiResp.data);
      } catch (err) {
        console.error('Error calling API', err);
      }
    };

    run();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>DATA POC</h1>
      <div style={{ marginTop: '1rem' }}>
        <strong>API Response:</strong>
        <pre>{JSON.stringify(apiData, null, 2)}</pre>
      </div>
    </div>
  );
}
