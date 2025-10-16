import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { PastorData, UserRole } from '../shared/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async create(createPastorDto: PastorData): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createPastorDto.password, 10);
    const createdUser = new this.userModel({
      ...createPastorDto,
      password: hashedPassword,
      uid: `user-${Date.now()}` // Match frontend local UID format
    });
    return createdUser.save();
  }

  async getPendingPastors(): Promise<User[]> {
    return this.userModel.find({ status: 'pending' }).exec();
  }

  async getPastors(): Promise<User[]> {
    return this.userModel.find({ 
      status: 'approved',
      role: { $ne: UserRole.NATIONAL_COORDINATOR }
    }).exec();
  }

  async approvePastor(id: string): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, { status: 'approved' }, { new: true }).exec();
  }
  
  async update(id: string, updatePastorDto: Partial<PastorData>): Promise<User> {
    // Do not update the password via this method
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...dataToUpdate } = updatePastorDto;
    return this.userModel.findByIdAndUpdate(id, dataToUpdate, { new: true }).exec();
  }

  async delete(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
