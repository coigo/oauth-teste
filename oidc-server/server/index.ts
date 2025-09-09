import express from 'express';
import 'dotenv/config';
import oidcConfig from './oidc.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

  function setNoCache(req, res, next) {
    res.set('cache-control', 'no-store');
    next();
  }

const oidc = await oidcConfig()
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => res.send('OIDC Provider (Prisma + Redis cache POC)'));

app.get('/interaction/:uid', setNoCache, async (req, res) => {
  const { uid } = req.params;

  const { prompt, params } = await oidc.interactionDetails(req, res)
  const renderSwitch = {
    'login': loginForm(req),
    'consent': consentForm({
      client: params.client_id,
      details: prompt.details,
      params,
      uid
    }),
  }
  res.send(renderSwitch[prompt.name] || 'nao deu certo viu :(');
});


app.post('/interaction/:uid/login', setNoCache, express.urlencoded({ extended: true }), async (req, res, next) => {
  try {
    const { uid } = req.params;

    // Busca os detalhes da interação
    const interaction = await oidc.interactionDetails(req, res);

    const result = {
      login: { accountId: req.body.username },
    };
    console.log('oioi', req.body.username)
    await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: false });

  } catch (err) {
    console.log('Error integractino', err)
  }
});

app.post('/interaction/:uid/confirm', setNoCache, async (req, res) => {
  const { uid } = req.params;
  const interaction = await oidc.interactionDetails(req, res);
  const { prompt, params, grantId } = interaction;

  if (prompt.name !== 'consent') throw new Error('prompt must be consent');

  console.log('AccontId recebido', params)

  let grant;
  if (grantId) {
    grant = await oidc.Grant.find(grantId);
  } else {
    grant = new oidc.Grant({
      accountId: params.accountId as string,
      clientId: params.client_id as string
    });
  }

  // Adiciona scopes e claims faltantes
  grant.addOIDCScope(prompt.details.missingOIDCScope || []);
  grant.addOIDCClaims(prompt.details.missingOIDCClaims || []);
  Object.entries(prompt.details.missingResourceScopes || {}).forEach(([indicator, scopes]) => {
    grant.addResourceScope(indicator, scopes);
  });

  const newGrantId = await grant.save();
  const result = { consent: { grantId: newGrantId } };
  console.log(result)
  await oidc.interactionFinished(req, res, result, { mergeWithLastSubmission: true });
});


import('./api.js').then(mod => app.use('/api', mod.default));
app.use(oidc.callback());
app.set('trust proxy', true);


app.listen(PORT, () => console.log(`OIDC provider running at http://localhost:${PORT}`));


const loginForm = (req) => `
      <h2>Login (POC)</h2>
      <form method="post" action="/interaction/${req.params.uid}/login">
        <input name="username" placeholder="usuario" required />
        <button type="submit">Login</button>
      </form>`

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
}