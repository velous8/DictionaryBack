import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager, LessThan, Repository } from 'typeorm';
import { RefreshToken } from '../entities/token.entity';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserData } from '../interfaces/user.interface';


@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(RefreshToken)
        private tokenRepository: Repository<RefreshToken>
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_3AM)
    async cleanup() {
        await this.tokenRepository.delete({expiresAt: LessThan(new Date())})
    }


    private hashToken(token: string): string {
        return crypto
            .createHash('sha256')
            .update(token)
            .digest('hex')
    }


    generateTokens(payload: UserData): { accessToken: string; refreshToken: string } {
        const accessToken = this.jwtService.sign(payload, {secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1h'})
        const refreshToken = this.jwtService.sign(payload, {secret: process.env.JWT_REFRESH_SECRET, expiresIn: '30d'})
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId: number, refreshToken: string, entityManager: EntityManager): Promise<void> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); 
        const tokenHash = await this.hashToken(refreshToken)

        await  entityManager.insert(RefreshToken,
            {
                userId: userId,
                tokenHash: tokenHash,
                expiresAt: expiresAt
            },
        );
   }

    async revokedToken(refreshToken: string, entityManager: EntityManager): Promise<void> {
        const token = await entityManager.findOne(RefreshToken, {where: {
            tokenHash: this.hashToken(refreshToken),
            revoked: false
        }})
        if(!token) {
            throw new UnauthorizedException();
        }

        await entityManager.update(RefreshToken, {id: token.id}, {revoked: true})
    }

    async findToken(refreshToken: string): Promise<RefreshToken> {
        const token = await this.tokenRepository.findOne({where: {
            tokenHash: this.hashToken(refreshToken),
            revoked: false
        }})
        if(!token) {
            throw new UnauthorizedException();
        }

        return token
    }


    async validateAccessToken(token: string): Promise<UserData | null> {
        try {
            return this.jwtService.verify<UserData>(token, {secret: process.env.JWT_ACCESS_SECRET})
        } catch {
            return null
        }
    }

    async validateRefreshToken(token: string): Promise<UserData | null> {
        try {
            return this.jwtService.verify<UserData>(token, {secret: process.env.JWT_REFRESH_SECRET})
        } catch {
            return null
        }
    }
}
