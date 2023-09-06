import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ versionKey: false })
export class RefreshToken {
  _id: string;

  id?: string;

  @Prop()
  createdAt: number;

  @Prop({ required: true })
  userId: string;
}

export const RefreshTokenShema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenShema.set('toObject', { virtuals: true });
