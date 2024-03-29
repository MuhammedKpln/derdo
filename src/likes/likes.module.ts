import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LikesResolver } from './likes.resolver';
import { LikesService } from './likes.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [LikesService, LikesResolver],
  exports: [LikesService],
})
export class LikesModule {}
