import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { District, DistrictSchema } from './schemas/district.schema';
import { Cell, CellSchema } from '../cells/schemas/cell.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: District.name, schema: DistrictSchema },
      { name: Cell.name, schema: CellSchema },
    ]),
  ],
  controllers: [DistrictsController],
  providers: [DistrictsService],
})
export class DistrictsModule {}
