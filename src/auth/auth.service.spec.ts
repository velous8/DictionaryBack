import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { EmailService } from './email/email.service';
import { TokenService } from './token/token.service';
import * as bcrypt from 'bcrypt';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-activation-link')
}))

describe('AuthService', () => {
    let service: AuthService;

const userRepositoryMock = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findOneBy: jest.fn(),
};

const dataSourceMock = {
  transaction: jest.fn(),
};

const emailServiceMock = {
  sendActivationEmail: jest.fn(),
};

const tokenServiceMock = {
  generateTokens: jest.fn(),
  saveToken: jest.fn(),
  revokedToken: jest.fn(),
  validateRefreshToken: jest.fn(),
  findToken: jest.fn(),
};    

const bcryptMock = {
  compare: jest.fn()
}

const entityManager = {
create: jest.fn(),
save: jest.fn(),
update: jest.fn()
} as unknown as EntityManager;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: TokenService,
          useValue: tokenServiceMock,
        },
        {
          provide: bcrypt,
          useValue: bcryptMock
        }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  it('should register user', async () => {
  dataSourceMock.transaction.mockImplementation(async (callback) => {
    return await callback(entityManager);
  });

  userRepositoryMock.findOne.mockResolvedValue(null);

  (entityManager.create as jest.Mock).mockReturnValue({
    id: 1,
    email: 'test@test.com',
    role: UserRole.USER,
  });

  (entityManager.save as jest.Mock).mockResolvedValue(undefined);

  tokenServiceMock.generateTokens.mockReturnValue({
    accessToken: 'access',
    refreshToken: 'refresh',
  });

  tokenServiceMock.saveToken.mockResolvedValue(undefined);

  emailServiceMock.sendActivationEmail.mockResolvedValue(undefined);

  const result = await service.register({
    email: 'test@mail.com',
    password: '1234567',
  });

  expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);

  expect(entityManager.create).toHaveBeenCalled();

  expect(entityManager.save).toHaveBeenCalled();

  expect(tokenServiceMock.saveToken).toHaveBeenCalled();

  expect(emailServiceMock.sendActivationEmail).toHaveBeenCalled();

  expect(result.accessToken).toBe('access');
});



it('should login user', async() => {
  dataSourceMock.transaction.mockImplementation(async (callback) => {
    return await callback(entityManager);
  });

  userRepositoryMock.findOne.mockResolvedValue({
    id: 1,
    email: 'test@test.com',
    role: UserRole.USER,
  });


})
});
