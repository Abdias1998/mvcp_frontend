import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CellStatus } from 'src/shared/types';

export type CellDocument = Cell & Document;

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
export class Cell {
  @Prop() id: string;
  @Prop({ required: true }) region: string;
  @Prop({ required: true }) group: string;
  @Prop({ required: true }) district: string;
  @Prop({ required: true }) cellName: string;
  @Prop({ required: true }) cellCategory: string;
  @Prop({ required: true }) leaderName: string;
  @Prop() leaderContact?: string;
  @Prop({ required: true }) status: CellStatus;
}

export const CellSchema = SchemaFactory.createForClass(Cell);