import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto } from './dto/create-report.dto';
import { User, UserRole } from 'src/shared/types';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const newReport = new this.reportModel({
      ...createReportDto,
      submittedAt: new Date().toISOString(),
    });
    return newReport.save();
  }

  async findAll(user: User, dateRange: { start: string; end: string }): Promise<Report[]> {
    const query: any = {
      cellDate: {
        $gte: dateRange.start,
        $lte: dateRange.end,
      },
    };

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
      case UserRole.NATIONAL_COORDINATOR:
      default:
        // No additional filters
        break;
    }

    return this.reportModel
      .find(query)
      .sort({ submittedAt: -1 })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.reportModel.findByIdAndDelete(id).exec();
  }
}
