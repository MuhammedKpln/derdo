import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-errors';
import { ERROR_CODES } from 'src/error_code';
import { AuthService } from './auth.service';
import { User as UserDecorator } from './decorators/user.decorator';
import {
  CreateUserDto,
  RegisterResponse,
  VerifyEmailDto,
} from './dtos/createUser.dto';
import { CreateUserGoogleDto } from './dtos/createUserGoogle.dto';
import { ForgotPasswordDto } from './dtos/forgotPassword.dto';
import { LoginResponse, LoginUserDto } from './dtos/loginUser.dto';
import {
  LoginUserGoogleDto,
  LoginUserGoogleResponse,
} from './dtos/loginUserGoogle.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/auth.guard';
import { ForgotPasswordGuard } from './guards/forgot-password.guard';
import { NotVerifiedGraphqlGuard } from './guards/not-verified-gql.guard';

@Resolver((of) => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation((returns) => LoginResponse)
  async login(@Args('data') login: LoginUserDto) {
    const { email, password } = login;

    const validateUser = await this.authService.validateUser(email, password);

    if (!validateUser) {
      throw new UserInputError('Incorrect username or password', {
        error_code: ERROR_CODES.USERNAME_OR_PASSWORD_INCORRECT,
      });
    }

    return await this.authService.login({
      email,
      password,
    });
  }

  @Mutation((returns) => LoginUserGoogleResponse)
  async loginGoogle(@Args('data') login: LoginUserGoogleDto) {
    const user = await this.authService.loginGoogle(login);

    if (!user) {
      throw new UserInputError('Try again');
    }

    return user;
  }

  @Query((returns) => Boolean)
  async checkIfUserIsRegistered(@Args('email') email: string) {
    const user = await this.authService.findOneWithEmail(email);

    if (user) {
      return true;
    }

    return false;
  }

  @Mutation((returns) => RegisterResponse)
  async register(@Args('data') user: CreateUserDto) {
    const alreadyRegistered = await this.authService.findOneWithEmail(
      user.email,
    );

    if (alreadyRegistered) {
      throw new UserInputError('Could not register', {
        error_code: ERROR_CODES.USER_IS_ALREADY_REGISTERED,
      });
    }

    return await this.authService.register(user);
  }

  @Mutation((returns) => LoginResponse)
  async registerWithGoogle(@Args('data') user: CreateUserGoogleDto) {
    const alreadyRegistered = await this.authService.findOneWithEmail(
      user.email,
    );

    if (alreadyRegistered) {
      throw new UserInputError('Could not register', {
        error_code: ERROR_CODES.USER_IS_ALREADY_REGISTERED,
      });
    }

    return await this.authService.registerGoogle(user);
  }

  @Mutation((returns) => Boolean)
  @UseGuards(NotVerifiedGraphqlGuard)
  async confirmEmail(@Args('data') data: VerifyEmailDto) {
    const verified = await this.authService.verifyEmail(
      data.email,
      data.verificationCode,
    );

    if (verified) {
      return true;
    }

    return false;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(JwtAuthGuard)
  async resendConfirmMail(@UserDecorator() user: User) {
    const verified = await this.authService.resendConfirmMail(user.email);

    if (verified) {
      return true;
    }

    return false;
  }

  @Mutation((returns) => Boolean)
  async sendForgotPasswordCode(@Args('email') email: string) {
    const verified = await this.authService.sendForgotPasswordCode(email);

    if (verified) {
      return true;
    }

    return false;
  }

  @Mutation((returns) => Boolean)
  @UseGuards(ForgotPasswordGuard)
  async changePassword(
    @Args('data') data: ForgotPasswordDto,
    @UserDecorator() user: User,
  ) {
    const verified = await this.authService.changePassword(data);

    if (verified) {
      return true;
    }

    return false;
  }

  @Mutation((returns) => LoginResponse)
  async refreshToken(
    @Args('refreshToken') refreshToken: string,
    @Args('userId') userId: number,
  ) {
    const refreshed = await this.authService.refreshToken(refreshToken, userId);

    if (refreshed) {
      return refreshed;
    }

    return false;
  }
}
