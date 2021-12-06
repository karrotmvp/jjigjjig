import { HttpModule } from '@nestjs/axios';
import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { LoggerModule } from 'src/logger/logger.module';
import { PostModule } from 'src/post/post.module';
import { RegionModule } from 'src/region/region.module';
import { UserModule } from 'src/user/user.module';
import { NewPlaceRepository } from './newPlace.repository';
import { PlaceController } from './place.controller';
import { PlaceRepository } from './place.repository';
import { PlaceService } from './place.service';
import { RecommendPlaceRepository } from './recommendPlace.repository';
import { SavedPlaceController } from './savedPlace.controller';
import { SavedPlaceRepository } from './savedPlace.repository';

@Module({
  imports: [HttpModule.register({
    timeout: 5000,
  }), ConfigModule, LoggerModule, forwardRef(() => PostModule),
  TypeOrmModule.forFeature([RecommendPlaceRepository, SavedPlaceRepository, NewPlaceRepository]),
  UserModule,
  RegionModule
  ],
  controllers: [PlaceController, SavedPlaceController],
  providers: [PlaceService, PlaceRepository],
  exports: [PlaceService]
})
export class PlaceModule {}
