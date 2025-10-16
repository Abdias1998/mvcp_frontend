import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { InvitedPerson, Visit, PrayerRequest } from 'src/shared/types';

export type ReportDocument = Report & Document;

@Schema({ _id: false })
class InvitedPersonSchema {
    @Prop() id: string;
    @Prop() name: string;
    @Prop() contact: string;
    @Prop() address: string;
}

@Schema({ _id: false })
class VisitSchema {
    @Prop() id: string;
    @Prop() name: string;
    @Prop() subject: string;
    @Prop() need: string;
}

@Schema({ _id: false })
class PrayerRequestSchema {
    @Prop() id: string;
    @Prop() subject: string;
    @Prop() isAnonymous: boolean;
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    // FIX: Explicitly type 'ret' as 'any' to resolve property access errors.
    transform: (doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Report {
  @Prop() id: string;
  @Prop({ required: true }) cellDate: string;
  @Prop({ required: true }) region: string;
  @Prop({ required: true }) group: string;
  @Prop({ required: true }) district: string;
  @Prop({ required: true }) cellName: string;
  @Prop({ required: true }) cellCategory: string;
  @Prop({ required: true }) leaderName: string;
  @Prop() leaderContact: string;
  @Prop({ required: true, default: 0 }) registeredMen: number;
  @Prop({ required: true, default: 0 }) registeredWomen: number;
  @Prop({ required: true, default: 0 }) registeredChildren: number;
  @Prop({ required: true, default: 0 }) attendees: number;
  @Prop({ required: true, default: 0 }) absentees: number;
  @Prop({ type: [InvitedPersonSchema], default: [] }) invitedPeople: InvitedPerson[];
  @Prop({ required: true, default: 0 }) totalPresent: number;
  @Prop() visitSchedule: string;
  @Prop({ type: [VisitSchema], default: [] }) visitsMade: Visit[];
  @Prop({ required: true, default: 0 }) bibleStudy: number;
  @Prop({ required: true, default: 0 }) miracleHour: number;
  @Prop({ required: true, default: 0 }) sundayServiceAttendance: number;
  @Prop() evangelismOuting: string;
  @Prop() poignantTestimony?: string;
  @Prop({ type: [PrayerRequestSchema], default: [] }) prayerRequests?: PrayerRequest[];
  @Prop() message: string;
  @Prop({ required: true }) submittedAt: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);