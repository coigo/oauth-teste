import express, { Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwks = createRemoteJWKSet(new URL('http://localhost:4000/jwks'));

async function verifyToken(token) {
  const { payload } = await jwtVerify(token, jwks, { issuer: 'http://localhost:4000' });
  return payload;
}

// router.use(async (req, res, next) => {
//   try {
//     const auth = req.headers.authorization;
//     if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
//     const parts = auth.split(' ');
//     if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization' });
//     const token = parts[1];
//     const payload = await verifyToken(token);
//     req.user = payload;
//     next();
//   } catch (e) {
//     console.error('token verify error', e);
//     res.status(401).json({ error: 'Invalid token' });
//   }
// });

// router.get('/data', (req, res) => {
//    try {
//     const auth = req.headers.authorization;
//     if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
//     const parts = auth.split(' ');
//     if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization' });
//     const token = parts[1];
//     const payload = await verifyToken(token);
//     req.user = payload;
//     next();
//   } catch (e) {
//     console.error('token verify error', e);
//     res.status(401).json({ error: 'Invalid token' });
//   }
//   res.json({ message: 'Dados protegidos pela API'});

// });

const apiData = async (req: Request, res: Response) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'Invalid Authorization' });
    const token = parts[1];
    // console.log('oi', token)
    const payload = await verifyToken(token);
      req.user = payload;
  
    res.send({message: 'oi', user: req.user})
    return

  }
  catch (err) {
    console.log(err)
    res.send(err)
  }
}

export { apiData }
