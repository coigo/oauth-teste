import { ClaimsParameterMember, ClientAuthMethod, ClientMetadata, Configuration, Provider, ResponseType } from 'oidc-provider';
import prisma from '../prisma';
import { PrismaAdapter } from './prisma-adapter';

export default async () => {


    const clients: ClientMetadata[] = (await prisma.client.findMany())
        .map(c => ({
            client_id: c.clientId,
            client_secret: c.clientSecret ?? undefined,
            redirect_uris: c.redirectUris,
            grant_types: c.grantTypes,
            token_endpoint_auth_method: c.tokenEndpointAuthMethod as ClientAuthMethod,
            response_types: c.responseTypes as ResponseType[]
        }));
    console.log(clients)
    const configuration: Configuration = {

        renderError: async (ctx, out, error) => {
            console.log(error)
            console.log(out)
            ctx.type = 'html',
                ctx.body = 'algo deu ruim'
        },

        clientBasedCORS(ctx, origin, client) {
            if (!origin) return false
            if (clients.map(c => c.client_id).includes(client.clientId)) {
                return [
                    'http://localhost:3000',
                ].includes(origin)
            }
            return false
        },
        findAccount: async (ctx, id) => {
            // console.log('usuarioId', id)
            return {
                accountId: id,
                claims: (use, scope, claims, rejected) => {
                    return {
                        sub: id,
                        email: "user@example.com", // se quiser outros claims
                    };
                },
            };
        },
        adapter: PrismaAdapter,
        clients,
        pkce: {
            required: (ctx, client) => {
                try { return client && client.token_endpoint_auth_method === 'none'; } catch { return false; }
            }
        },

        scopes: ['openid', 'profile', 'email', 'offline_access'],
        claims: { openid: ['sub'], email: ['email'], profile: ['name'] },
        interactions: {
            url(ctx, interaction) {
                return `/interaction/${interaction.uid}`;
            }
        },
        features: {
            devInteractions: {
                enabled: false
            },
            rpInitiatedLogout: {
                enabled: true
            },

        },
        cookies: {
            keys: [process.env.COOKIE_KEYS || 'dev-secret-key']
        },
        ttl: {
            AccessToken: 60000
        }
    };

    const oidc = new Provider('http://localhost:4000', {
        ...configuration,
        async loadExistingGrant(ctx) {
  const { accountId } = ctx.oidc.session ?? {};
  const clientId = ctx.oidc.client?.clientId;

  if (!accountId || !clientId) return;

  const grant = await prisma.grant.findUnique({
    where: { accountId_clientId: { accountId, clientId } },
  });

  if (!grant) return;

  const oidcGrant = new ctx.oidc.provider.Grant({ accountId, clientId });

  // Reconstrói escopos e resources
  if (grant.scopes?.length) {
    oidcGrant.addOIDCScope(grant.scopes.join(' '));
  }

  if (grant.resources?.length) {
    for (const resource of grant.resources) {
      oidcGrant.addResourceScope(resource, 'default');
    }
  }

  return oidcGrant
}
})


oidc.on('server_error', (ctx, err) => {
    console.error('OIDC server error:', err);
});

oidc.on('authorization.error', (ctx, error) => {
    console.error('Authorization error:', error);
    console.error('Client:', ctx);
});



oidc.on('grant.error', (ctx, err) => {
    console.error('Grant error:', err);
});



return oidc
}
