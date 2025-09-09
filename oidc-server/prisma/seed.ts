import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.client.deleteMany();

  await prisma.client.createMany({
    data: [
      {
        clientId: 'pkce-client',
        clientSecret: 'supersecret',
        redirectUris: ['http://localhost:3000/callback'],
        responseTypes: ['code'],
        grantTypes: ['authorization_code'],
        tokenEndpointAuthMethod: 'none'
      },
      {
        clientId: 'confidential-client',
        clientSecret: 'supersecret',
        redirectUris: ['http://localhost:3000/callback'],
        responseTypes: ['code'],
        grantTypes: ['authorization_code','refresh_token'],
        tokenEndpointAuthMethod: 'client_secret_basic'
      },
      {
        clientId: 'machine-client',
        clientSecret: 'machinesecret',
        redirectUris: [],
        responseTypes: [],
        grantTypes: ['client_credentials'],
        tokenEndpointAuthMethod: 'client_secret_basic'
      }
    ]
  });

  console.log('Clients seeded');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => await prisma.$disconnect());
