import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  full_name: string;
  designation: string;
  profile_pic_url: string;
  facebook: string;
  role: 'owner' | 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    full_name: { type: String, default: '' },
    designation: { type: String, default: '' },
    profile_pic_url: { type: String, default: '' },
    facebook: { type: String, default: '' },
    role: { type: String, enum: ['owner', 'admin', 'user'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
