import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CellsService } from './cells.service';
import { CellsController } from './cells.controller';
import { Cell, CellSchema } from './schemas/cell.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cell.name, schema: CellSchema }]),
  ],
  controllers: [CellsController],
  providers: [CellsService],
})
export class CellsModule {}
