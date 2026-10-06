import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { TokenService } from './token.service';
import { RefreshToken } from '../entities/token.entity';
import { UserRole } from '../entities/user.entity';

import * as crypto from 'crypto'
import { UnauthorizedException } from '@nestjs/common';

describe('TokenService', () => {
let service: TokenService;

const jwtServiceMock = {
sign: jest.fn(),
verify: jest.fn(),
};

const tokenRepositoryMock = {
findOne: jest.fn(),
delete: jest.fn(),
};

const entityManager = {
insert: jest.fn(),
findOne: jest.fn(),
update: jest.fn()
} as unknown as EntityManager;


beforeEach(async () => {
jest.clearAllMocks();

const module: TestingModule = await Test.createTestingModule({
  providers: [
    TokenService,
    {
      provide: JwtService,
      useValue: jwtServiceMock,
    },
    {
      provide: getRepositoryToken(RefreshToken),
      useValue: tokenRepositoryMock,
    },
  ],
}).compile();

service = module.get<TokenService>(TokenService);

});

it('should be defined', () => {
expect(service).toBeDefined();
});



it('should generate access and refresh tokens', () => {
const payload = {
id: 1,
email: 'test@mail.com',
role: UserRole.USER,
};

jwtServiceMock.sign
  .mockReturnValueOnce('access-token')
  .mockReturnValueOnce('refresh-token');

const tokens = service.generateTokens(payload);

expect(jwtServiceMock.sign).toHaveBeenCalledTimes(2);

expect(jwtServiceMock.sign).toHaveBeenNthCalledWith(
  1,
  payload,
  {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '1h',
  },
);

expect(jwtServiceMock.sign).toHaveBeenNthCalledWith(
  2,
  payload,
  {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '30d',
  },
);

expect(tokens).toEqual({
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
});

});



it('should validate access token and return user data', async () => {
const payload = {
id: 1,
email: 'test@mail.com',
role: UserRole.USER,
};

jwtServiceMock.verify.mockReturnValue(payload);

const result = await service.validateAccessToken('valid-token');

expect(jwtServiceMock.verify).toHaveBeenCalledTimes(1);

expect(jwtServiceMock.verify).toHaveBeenCalledWith(
  'valid-token',
  {
    secret: process.env.JWT_ACCESS_SECRET,
  },
);

expect(result).toEqual(payload);
});

it('should return null when access token is invalid', async () => {
jwtServiceMock.verify.mockImplementation(() => {
throw new Error('Invalid token');
});

const result = await service.validateAccessToken('invalid-token');

expect(jwtServiceMock.verify).toHaveBeenCalledTimes(1);

expect(result).toEqual(null);
});



it('should save token', async () => {
  await service.saveToken(1, 'refresh-token', entityManager)
  
  expect(entityManager.insert).toHaveBeenCalledTimes(1)

  const [entity, data] = (entityManager.insert as jest.Mock).mock.calls[0]


  expect(entity).toBe(RefreshToken)
  
  expect(data.userId).toBe(1)

  const expectHash = crypto
    .createHash('sha256')
    .update('refresh-token')
    .digest('hex')

  expect(data.tokenHash).toBe(expectHash)

  const expectExpiresAt = new Date();
  expectExpiresAt.setDate(expectExpiresAt.getDate() + 30); 

  expect(data.expiresAt.setSeconds(0, 0)).toBe(expectExpiresAt.setSeconds(0, 0))
})



it('should return refresh token from repository', async () => {
  const token = {
    id: 1,
    userId: 10,
    tokenHash: crypto
      .createHash('sha256')
      .update('refresh-token')
      .digest('hex'),
    revoked: false,
    expiresAt: new Date(),
  } as RefreshToken

  tokenRepositoryMock.findOne.mockResolvedValue(token)
  const result = await service.findToken('refresh-token')

  expect(tokenRepositoryMock.findOne).toHaveBeenCalledTimes(1)

  expect(tokenRepositoryMock.findOne).toHaveBeenCalledWith({
    where: {
      tokenHash: token.tokenHash,
      revoked: false
    }
  })
  expect(result).toBe(token)
})

it('should throw UnauthorizedException if token is not found', async () => {
  tokenRepositoryMock.findOne.mockResolvedValue(null);

  await expect(
    service.findToken('invalid-token'),
  ).rejects.toThrow(UnauthorizedException);

  expect(tokenRepositoryMock.findOne).toHaveBeenCalledTimes(1);
});



it('should revoke refresh token', async () => {
  const refreshToken = 'refresh-token';

  const token = {
    id: 5,
    userId: 10,
    tokenHash: crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex'),
    revoked: false,
    expiresAt: new Date(),
  } as RefreshToken;

  (entityManager.findOne as jest.Mock).mockResolvedValue(token);
  (entityManager.update as jest.Mock).mockResolvedValue(undefined);

  await service.revokedToken(refreshToken, entityManager);

  expect(entityManager.findOne).toHaveBeenCalledWith(
    RefreshToken,
    {
      where: {
        tokenHash: token.tokenHash,
        revoked: false,
      },
    },
  );

  expect(entityManager.update).toHaveBeenCalledTimes(1);

  expect(entityManager.update).toHaveBeenCalledWith(
    RefreshToken,
    { id: token.id },
    { revoked: true },
  );
});

it('should throw UnauthorizedException if token for revocation is not found', async () => {
  (entityManager.findOne as jest.Mock).mockResolvedValue(null);

  await expect(
    service.revokedToken('invalid-token', entityManager),
  ).rejects.toThrow(UnauthorizedException);

  expect(entityManager.findOne).toHaveBeenCalledTimes(1);

  expect(entityManager.update).not.toHaveBeenCalled();
});
});