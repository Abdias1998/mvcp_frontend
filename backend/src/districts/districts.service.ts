import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { District, DistrictDocument } from './schemas/district.schema';
import { Cell, CellDocument } from '../cells/schemas/cell.schema';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';

@Injectable()
export class DistrictsService {
  constructor(
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    @InjectModel(Cell.name) private cellModel: Model<CellDocument>,
  ) {}

  async create(createDistrictDto: CreateDistrictDto): Promise<District> {
    const createdDistrict = new this.districtModel(createDistrictDto);
    return createdDistrict.save();
  }

  async findAll(): Promise<District[]> {
    return this.districtModel.find().sort({ region: 1, group: 1, name: 1 }).exec();
  }

  async update(id: string, updateDistrictDto: UpdateDistrictDto): Promise<District> {
    // Note: Cascading updates for district renames are more complex
    // and are handled in the HierarchyView on the backend for now.
    // A simple update is provided here.
    return this.districtModel.findByIdAndUpdate(id, updateDistrictDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    const districtToDelete = await this.districtModel.findById(id);
    if (!districtToDelete) {
        throw new NotFoundException("District non trouvé.");
    }
    
    const childCells = await this.cellModel.countDocuments({ 
        region: districtToDelete.region,
        group: districtToDelete.group,
        district: districtToDelete.name,
    });

    if (childCells > 0) {
        throw new BadRequestException("Impossible de supprimer ce district car il contient des cellules de maison.");
    }
    
    return this.districtModel.findByIdAndDelete(id).exec();
  }
}
