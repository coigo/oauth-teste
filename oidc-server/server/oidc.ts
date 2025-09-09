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

    const configuration: Configuration = {
        
        findAccount: async (ctx, id) => {
            console.log('usuarioId', id)
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
        features: { devInteractions: { enabled: false }, rpInitiatedLogout: { enabled: true } },
        cookies: {
            keys: [process.env.COOKIE_KEYS || 'dev-secret-key']
        },
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

    oidc.on('authorization.success', (ctx) => {
        console.log('authorization s log:', ctx);
    });

    oidc.on('authorization.accepted', (ctx) => {
        console.log('authorization a log:', ctx);
    });

    return oidc
}
