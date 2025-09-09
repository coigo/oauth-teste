import { Adapter, AdapterPayload } from 'oidc-provider';
import prisma from '../prisma';

export class PrismaAdapter implements Adapter {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async upsert(id: string, payload: AdapterPayload, expiresIn: number) {
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

    await prisma.tokens.upsert({
      where: { id },
      update: {
        data: JSON.stringify(payload),
        expiresAt,
        tipo: this.name,
      },
      create: {
        id,
        data: JSON.stringify(payload),
        expiresAt,
        tipo: this.name,
        grantId: payload.grantId,
        userCode: payload.userCode,
        uid: payload.uid,
      },
    });
  }

  async find(id: string) {
    const found = await prisma.tokens.findFirst({
      where: { id, tipo: this.name },
    });

    if (!found) return undefined;

    const payload = JSON.parse(found.data as string);
    // log de debug pra ver o que está sendo retornado
    console.log(`[Adapter.find:${this.name}]`, payload);

    return payload;
  }

  async destroy(id: string) {
    await prisma.tokens.deleteMany({ where: { id, tipo: this.name } });
  }

  async consume(id: string) {
    const found = await prisma.tokens.findFirst({ where: { id, tipo: this.name } });
    if (!found) return;

    const payload = JSON.parse(found.data as string);
    payload.consumed = true;

    await prisma.tokens.update({
      where: { id },
      data: { data: JSON.stringify(payload) },
    });
  }

  async findByUid(uid: string) {
    const record = await prisma.tokens.findFirst({
      where: { uid, tipo: this.name, expiresAt: { gte: new Date() } },
    });

    if (!record) return undefined;

    const payload = JSON.parse(record.data as string);
    console.log(`[Adapter.findByUid:${this.name}]`, payload);

    return payload;
  }

  async findByUserCode(userCode: string) {
    const record = await prisma.tokens.findFirst({
      where: { userCode, tipo: this.name, expiresAt: { gte: new Date() } },
    });

    if (!record) return undefined;

    const payload = JSON.parse(record.data as string);
    console.log(`[Adapter.findByUserCode:${this.name}]`, payload);

    return payload;
  }

  async revokeByGrantId(grantId: string) {
    await prisma.tokens.deleteMany({
      where: { grantId, tipo: this.name },
    });
  }
}
