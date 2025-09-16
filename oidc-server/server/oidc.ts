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
            response_types: c.responseTypes as ResponseType[],
            scope: 'openid email profile offline_access'
        }));
    console.log(clients)
    const configuration: Configuration = {
        issueRefreshToken: async (ctx, client, code) => {
            console.log('weeee', client.grantTypeAllowed('refresh_token')
                , code.scopes)
            return (
                client.grantTypeAllowed('refresh_token')
                && code.scopes.has('offline_access')
            );
        },
        loadExistingGrant: async (ctx) => {
            console.log('client', ctx.oidc.params?.client_id);
            console.log('sessao', ctx.oidc.session?.accountId);
            const grant = await prisma.grant.findFirst({
                where: {
                    accountId: ctx.oidc.session?.accountId,
                    clientId: ctx.oidc.params?.client_id,
                }
            })
            if (grant) {
                console.log('GRANT', await ctx.oidc.provider.Grant.find(grant.id))
                return await ctx.oidc.provider.Grant.find(grant.id);
            }
            return undefined;

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
        claims: { openid: ['sub'], email: ['email'], profile: ['name']},
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
            AccessToken: 60000,
            RefreshToken: 60 * 60 * 24 * 30
        }
    };

    const oidc = new Provider('http://localhost:4000', configuration)


    oidc.on('server_error', (ctx, err) => {
        console.error('OIDC server error:', err);
    });

    oidc.on('authorization.error', (ctx, error) => {
        console.error('Authorization error:', error.message);
        console.error('Authorization error:', error.message);
        console.error('Client:', ctx.oidc.client?.client_id);
        console.error('Params:', ctx.oidc.params);
    });



    oidc.on('grant.error', (ctx, err) => {
        console.error('Grant error:', err);
    });



    return oidc
}
