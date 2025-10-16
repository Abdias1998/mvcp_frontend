import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederService } from './seeder.service';
import { SeederController } from './seeder.controller';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import { Cell, CellSchema } from '../cells/schemas/cell.schema';
import { Group, GroupSchema } from '../groups/schemas/group.schema';
import { District, DistrictSchema } from '../districts/schemas/district.schema';
// import { Event, EventSchema } from '../events/schemas/event.schema';
// import { Resource, ResourceSchema } from '../resources/schemas/resource.schema';
// import { Communication, CommunicationSchema } from '../communications/schemas/communication.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Report.name, schema: ReportSchema },
      { name: Cell.name, schema: CellSchema },
      { name: Group.name, schema: GroupSchema },
      { name: District.name, schema: DistrictSchema },
      // { name: Event.name, schema: EventSchema },
      // { name: Resource.name, schema: ResourceSchema },
      // { name: Communication.name, schema: CommunicationSchema },
    ]),
  ],
  providers: [SeederService],
  controllers: [SeederController],
})
export class DatabaseModule {}
