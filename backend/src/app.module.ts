import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { CellsModule } from './cells/cells.module';
import { GroupsModule } from './groups/groups.module';
import { DistrictsModule } from './districts/districts.module';
// import { EventsModule } from './events/events.module';
// import { ResourcesModule } from './resources/resources.module';
// import { CommunicationsModule } from './communications/communications.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // --- Configuration ---
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available globally
      envFilePath: '.env.local', // 👈 charge ton fichier .env.local
    }),
    // --- Database ---
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    
    // --- Feature Modules ---
    AuthModule,
    UsersModule,
    ReportsModule,
    CellsModule,
    GroupsModule,
    DistrictsModule,
    // EventsModule,
    // ResourcesModule,
    // CommunicationsModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
