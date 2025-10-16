import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

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
export class Group {
  @Prop() id: string;
  @Prop({ required: true }) region: string;
  @Prop({ required: true }) name: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);