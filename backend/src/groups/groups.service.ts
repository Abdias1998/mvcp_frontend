import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { District, DistrictDocument } from '../districts/schemas/district.schema';
import { Cell, CellDocument } from '../cells/schemas/cell.schema';
import { Report, ReportDocument } from '../reports/schemas/report.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(District.name) private districtModel: Model<DistrictDocument>,
    @InjectModel(Cell.name) private cellModel: Model<CellDocument>,
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const existing = await this.groupModel.findOne({ 
      region: createGroupDto.region,
      name: { $regex: new RegExp(`^${createGroupDto.name}$`, 'i') } 
    });
    if (existing) {
      throw new ConflictException("Un groupe avec ce nom existe déjà dans cette région.");
    }
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
  }

  async findAll(region?: string): Promise<Group[]> {
    const query = region ? { region } : {};
    return this.groupModel.find(query).sort({ region: 1, name: 1 }).exec();
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const oldGroup = await this.groupModel.findById(id);
    if (!oldGroup) {
        throw new NotFoundException("Groupe non trouvé.");
    }

    const { name: newGroupName, region: newRegion } = updateGroupDto;
    const { name: oldGroupName, region: oldRegion } = oldGroup;
    
    // If name or region changes, we need to cascade the update
    if (newGroupName && (newGroupName !== oldGroupName || newRegion !== oldRegion)) {
        await this.districtModel.updateMany({ region: oldRegion, group: oldGroupName }, { $set: { group: newGroupName, region: newRegion } });
        await this.cellModel.updateMany({ region: oldRegion, group: oldGroupName }, { $set: { group: newGroupName, region: newRegion } });
        await this.reportModel.updateMany({ region: oldRegion, group: oldGroupName }, { $set: { group: newGroupName, region: newRegion } });
        await this.userModel.updateMany({ region: oldRegion, group: oldGroupName }, { $set: { group: newGroupName, region: newRegion } });
    }

    return this.groupModel.findByIdAndUpdate(id, updateGroupDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    const groupToDelete = await this.groupModel.findById(id);
    if (!groupToDelete) {
        throw new NotFoundException("Groupe non trouvé.");
    }
    
    const childDistricts = await this.districtModel.countDocuments({ region: groupToDelete.region, group: groupToDelete.name });
    if (childDistricts > 0) {
        throw new BadRequestException("Impossible de supprimer ce groupe car il contient des districts.");
    }
    
    return this.groupModel.findByIdAndDelete(id).exec();
  }
}
