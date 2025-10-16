import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cell, CellDocument } from './schemas/cell.schema';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';
import { User, UserRole } from 'src/shared/types';

@Injectable()
export class CellsService {
  constructor(@InjectModel(Cell.name) private cellModel: Model<CellDocument>) {}

  async create(createCellDto: CreateCellDto): Promise<Cell> {
    const createdCell = new this.cellModel(createCellDto);
    return createdCell.save();
  }

  async findAllForUser(user: User): Promise<Cell[]> {
    const query: any = {};
    switch (user.role) {
      case UserRole.REGIONAL_PASTOR:
        query.region = user.region;
        break;
      case UserRole.GROUP_PASTOR:
        query.region = user.region;
        query.group = user.group;
        break;
      case UserRole.DISTRICT_PASTOR:
        query.region = user.region;
        query.group = user.group;
        query.district = user.district;
        break;
    }
    return this.cellModel.find(query).exec();
  }

  async update(id: string, updateCellDto: UpdateCellDto): Promise<Cell> {
    return this.cellModel.findByIdAndUpdate(id, updateCellDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.cellModel.findByIdAndDelete(id).exec();
  }
}
