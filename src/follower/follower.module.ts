import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Follower } from './entities/follower.entity';
import { FollowerController } from './follower.controller';
import { FollowerService } from './follower.service';

@Module({
  providers: [FollowerService, AuthService],
  imports: [TypeOrmModule.forFeature([Follower]), AuthModule],
  controllers: [FollowerController],
  exports: [TypeOrmModule],
})
export class FollowerModule {}