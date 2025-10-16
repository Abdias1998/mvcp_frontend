import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../shared/types';

export type UserDocument = User & Document;

@Schema({
  // Add timestamps to automatically manage createdAt and updatedAt
  timestamps: true,
  // Use a transform to match the frontend `uid` property with MongoDB's `_id`
  toJSON: {
    virtuals: true,
    // FIX: Explicitly type 'ret' as 'any' to resolve property access errors.
    transform: (doc, ret: any) => {
      ret.uid = ret._id; // Map _id to uid
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Never send password back
    },
  },
})
export class User {
  @Prop()
  uid: string; // This is a virtual property, but we define it for type safety

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: UserRole;

  @Prop()
  region?: string;

  @Prop()
  group?: string;

  @Prop()
  district?: string;

  @Prop({ default: 'pending' })
  status?: 'pending' | 'approved';

  @Prop({ required: true })
  password?: string;
  
  @Prop()
  contact?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);