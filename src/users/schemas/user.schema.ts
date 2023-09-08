import { Exclude, Transform } from 'class-transformer';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User {
  @Transform(({ value }) => value.toString())
  _id: string;

  @Prop()
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  @Exclude()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
