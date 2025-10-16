import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group, GroupSchema } from './schemas/group.schema';
// Import dependent schemas for cascade updates
import { District, DistrictSchema } from '../districts/schemas/district.schema';
import { Cell, CellSchema } from '../cells/schemas/cell.schema';
import { Report, ReportSchema } from '../reports/schemas/report.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: District.name, schema: DistrictSchema },
      { name: Cell.name, schema: CellSchema },
      { name: Report.name, schema: ReportSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
