import express, { request } from 'express';
import 'dotenv/config';
import oidcConfig from './oidc.js';
import { apiData } from './api.js';
import cors from 'cors';
import { SessionNotFound } from 'oidc-provider/lib/helpers/errors.js';
import prisma from '../prisma/index.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

function setNoCache(req, res, next) {
  res.set('cache-control', 'no-store');
  next();
}

// helper pra capturar throw em rotas async
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const oidc = await oidcConfig();
const app = express();

app.use((req, res, next) => {
  if ( req.url.includes('/auth')) {
    console.log('/AUTH PARAMS: ', req.query )
  }
  next()
})

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'],
  }),
);

app.get('/', (req, res) =>
  res.send('OIDC Provider (Prisma + Redis cache POC)'),
);

app.get(
  '/interaction/:uid',
  setNoCache,
  asyncHandler(async (req, res) => {
    // se cair aqui, vai pro middleware de erro
    // console.log('caiu aqui no interaction ')
    const { uid } = req.params;
    const { prompt, params } = await oidc.interactionDetails(req, res);
    // console.log('passou do interactionDetails')
    console.log("Interaction REQUEST", req.query)
    console.log("Interaction PARAMS", params)
    const renderSwitch = {
      login: loginForm(req),
      consent: consentForm({
        client: params.client_id,
        details: prompt.details,
        params,
        uid,
      }),
    };
    res.send(renderSwitch[prompt.name] || 'nao deu certo viu :(');
  }),
);

app.post(
  '/interaction/:uid/login',
  setNoCache,
  express.urlencoded({ extended: true }),
  asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const { params } = await oidc.interactionDetails(req, res);

    const result = {
      login: { accountId: req.body.username },
    };
    await oidc.interactionFinished(req, res, result, {
      mergeWithLastSubmission: false,
    });
  }),
);

app.post(
  '/interaction/:uid/confirm',
  setNoCache,
  asyncHandler(async (req, res, next) => {
     try {
    const { uid } = req.params;
    const {session, params, grantId, } = await oidc.interactionDetails(req, res);
    const { accountId } = session!;
    const clientId = params.client_id as string;


    const grant = grantId
      ? await oidc.Grant.find(grantId)
      : new oidc.Grant({ accountId, clientId });

    console.log('PARAMETROS CHEGADOS', req.params)
    console.log('PARAMETROS CHEGADOS', params.scope)
    grant.addOIDCScope(params.scope as string);
    
    const NovograntId = await grant.save();
    
    await prisma.grant.upsert({
      where: { accountId_clientId: { accountId, clientId } },
      update: {
        scopes: JSON.stringify(params.scope),
      },
      create: {
        id: NovograntId,
        accountId,
        clientId,
        scopes: JSON.stringify(params.scope),
      },
    });

    // Finaliza a interação
    await oidc.interactionFinished(req, res, { consent: { grantId, scope: 'openid email profile offline_access' } });
  } catch (err) {
    next(err);
  }
  }),
);

app.use('/api/data', (req, res) => apiData(req, res));

// registra o callback do oidc (ele também usa middlewares internos)
app.use(oidc.callback());
// middleware de erro vem **depois de tudo**
app.use((err, req, res, next) => {
  if (err instanceof SessionNotFound) {
    // console.log('chegou aqui')

    // console.log(req.query)
    return res.redirect('/auth')
  }
  console.error('Erro capturado pelo middleware:', err);
  res.status(500).json({ error: 'Deu ruim' });
});

app.set('trust proxy', true);

app.listen(PORT, () =>
  console.log(`OIDC provider running at http://localhost:${PORT}`),
);

const loginForm = req => `
  <h2>Login (POC)</h2>
  <form method="post" action="/interaction/${req.params.uid}/login">
    <input name="username" placeholder="usuario" required />
    <button type="submit">Login</button>
  </form>`;

const consentForm = ({ client, details, params, uid }) => {
    let html = '';

  // div do logo do cliente
  html += `<div class="login-client-image">`;
  if (client.logoUri) {
    html += `<img src="${client.logoUri}">`;
  }
  html += `</div>`;

  html += `<ul>`;

  // Caso não tenha nada faltando
  if (!details.missingOIDCScope?.length &&
    !details.missingOIDCClaims?.length &&
    !details.missingResourceScopes &&
    !details.rar) {
    html += `<li>the client is asking you to confirm previously given authorization</li>`;
  }

  // Missing OIDC Scopes
  let missingOIDCScope = new Set(details.missingOIDCScope || []);
  missingOIDCScope.delete('openid');
  missingOIDCScope.delete('offline_access');
  if (missingOIDCScope.size > 0) {
    html += `<li>scopes:</li><ul>`;
    missingOIDCScope.forEach(scope => {
      html += `<li>${scope}</li>`;
    });
    html += `</ul>`;
  }

  // Missing OIDC Claims
  let missingOIDCClaims = new Set(details.missingOIDCClaims || []);
  ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach(k => missingOIDCClaims.delete(k));
  if (missingOIDCClaims.size > 0) {
    html += `<li>claims:</li><ul>`;
    missingOIDCClaims.forEach(claim => {
      html += `<li>${claim}</li>`;
    });
    html += `</ul>`;
  }

  // Missing Resource Scopes
  const missingResourceScopes = details.missingResourceScopes || {};
  for (const [indicator, scopes] of Object.entries(missingResourceScopes)) {
    html += `<li>${indicator}:</li><ul>`;
    scopes.forEach(scope => {
      html += `<li>${scope}</li>`;
    });
    html += `</ul>`;
  }

  // RAR (authorization_details)
  const rar = details.rar || [];
  if (rar.length > 0) {
    html += `<li>authorization_details:</li><ul>`;
    rar.forEach(({ type, ...detail }) => {
      html += `<li><pre>${JSON.stringify({ type, ...detail }, null, 4)}</pre></li>`;
    });
    html += `</ul>`;
  }

  // Offline access
  if (params.scope?.includes('offline_access')) {
    html += `<li>the client is asking to have offline access to this authorization`;
    if (!(details.missingOIDCScope || []).includes('offline_access')) {
      html += ` (which you've previously granted)`;
    }
    html += `</li>`;
  }

  html += `</ul>`;

  // Form
  html += `
    <form autocomplete="off" action="/interaction/${uid}/confirm" method="post">
      <button autofocus type="submit" class="login login-submit">Continue</button>
    </form>
  `;

  return html;
};
