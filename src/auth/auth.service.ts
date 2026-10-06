import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository, DataSource, EntityManager} from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';
import { User } from './entities/user.entity';
import { EmailService } from './email/email.service';
import { TokenService } from './token/token.service';
import {  FullAuthData } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService) {}


  async register( registerDto: RegisterDto): Promise<FullAuthData> {   
    const { email, password} = registerDto;
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    
    if (existingUser) {
      throw new ConflictException();
    }  

    const passwordHash = await bcrypt.hash(password, 10);
    const activationLink = uuid.v4()

    const result = await this.dataSource.transaction(async (entityManager: EntityManager) => {
      const user = await entityManager.create(User, { email, passwordHash, activationLink});
      await entityManager.save(user);

      const tokens = this.tokenService.generateTokens({id: user.id, email: user.email, role: user.role})

      await this.tokenService.saveToken(user.id, tokens.refreshToken, entityManager)

      await this.emailService.sendActivationEmail(email, `${process.env.API_URL}/auth/activate/${activationLink}`)

      return {...tokens, user: {id: user.id, email: user.email, role: user.role}};
    })

    return result
  }

  async login( registerDto: RegisterDto): Promise<FullAuthData> {

    const { email, password} = registerDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    
    if (!user || !user.isActivated) {
      throw new UnauthorizedException();
    }
    
    const isPassEquales = await bcrypt.compare(password, user.passwordHash)
    if (!isPassEquales) {
      throw new UnauthorizedException();
    }

    const tokens = this.tokenService.generateTokens({id: user.id, email: user.email, role: user.role})
    await this.dataSource.transaction(async (entityManager: EntityManager) => {
      await this.tokenService.saveToken(user.id, tokens.refreshToken, entityManager)
    })

    return {...tokens, user: {id: user.id, email: user.email, role: user.role}};
  }

  async logout(refreshToken: string): Promise<void>{
    if(!refreshToken){
      throw new UnauthorizedException();
    }
    await this.dataSource.transaction(async (entityManager: EntityManager) => {
      await this.tokenService.revokedToken(refreshToken, entityManager)
    })
  }


  async activate(activationLink: string): Promise<void> {
    const user = await this.usersRepository.update( { activationLink }, {isActivated: true, activationLink: null});
    if (user.affected === 0) {
      throw new BadRequestException();
    }
  }


  async refresh(refreshToken: string): Promise<FullAuthData> {
    if(!refreshToken) {
      throw new UnauthorizedException();
    }

    const userData = await this.tokenService.validateRefreshToken(refreshToken)
    const tokenFromDb = await this.tokenService.findToken(refreshToken)
    if(!userData || !tokenFromDb) {
      throw new UnauthorizedException();
    }

    const user = await this.usersRepository.findOneBy({id: userData.id}); 
    if (!user) {
      throw new UnauthorizedException();
    }
    const result = await this.dataSource.transaction(async (entityManager: EntityManager) => {
      await this.tokenService.revokedToken(refreshToken, entityManager)

      const tokens = this.tokenService.generateTokens({id: user.id, email: user.email, role: user.role})

      await this.tokenService.saveToken(user.id, tokens.refreshToken, entityManager)

      return tokens
    })

    return {...result, user: {id: user.id, email: user.email, role: user.role}};
  }

}
