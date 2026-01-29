import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.utilisateur.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.motDePasse))) {
      const { motDePasse, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(data: { nom: string; email: string; motDePasse: string; role?: string }) {
    const hashedPassword = await bcrypt.hash(data.motDePasse, 10);
    
    const user = await this.prisma.utilisateur.create({
      data: {
        nom: data.nom,
        email: data.email,
        motDePasse: hashedPassword,
        role: (data.role as any) || 'VENDEUR',
      },
    });

    const { motDePasse, ...result } = user;
    return result;
  }
}
