import mongoose, { Schema, Document } from 'mongoose';

export type NoteCategory =
  | 'meter-manual'
  | 'equipment-manual'
  | 'instruction'
  | 'document'
  | 'application-form'
  | 'general-data'
  | 'online-data';

export type NoteStatus = 'pending' | 'approved' | 'rejected';

export interface IContributor {
  username: string;
  full_name: string;
  designation: string;
  profile_pic_url: string;
  facebook: string;
}

export interface ISpecRow {
  name: string;
  details: string;
  value: string[];
}

export interface IDisplayRow {
  sl_no: number;
  id_number: string;
  display_unit: string;
  parameter_name: string;
  parameter_details: string;
  remarks: string;
}

export interface IManualSection {
  section_type: 'display-list' | 'html' | 'image' | 'pdf' | 'table' | 'text-post' | 'file-link';
  content: string; // JSON stringified or HTML or URL
  title: string;
  display_rows?: IDisplayRow[];
  likes: string[]; // usernames
  contributors: IContributor[];
  status: NoteStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id?: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  text: string;
  likes: string[];
  createdAt: Date;
}

export interface IPhoto {
  url: string;
  caption: string;
  uploadedBy: IContributor;
  status: NoteStatus;
  createdAt: Date;
}

export interface IDataNote extends Document {
  slug: string;
  category: NoteCategory;
  title: string;
  icon: string;
  item: string;
  type: string;
  details: string;
  status: NoteStatus;
  likes: string[];
  createdBy: IContributor;
  specifications: {
    rows: ISpecRow[];
    contributors: IContributor[];
    status: NoteStatus;
    pendingRows?: ISpecRow[];
    pendingContributors?: IContributor[];
  };
  manualSections: IManualSection[];
  comments: IComment[];
  photos: IPhoto[];
  // Extra fields per category
  imageUrl?: string;
  fileUrl?: string;
  htmlContent?: string;
  pendingImageUrl?: string;
  pendingFileUrl?: string;
  pendingHtmlContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContributorSchema = new Schema<IContributor>({
  username: String,
  full_name: String,
  designation: String,
  profile_pic_url: String,
  facebook: String,
});

const SpecRowSchema = new Schema<ISpecRow>({
  name: String,
  details: String,
  value: [String],
});

const DisplayRowSchema = new Schema<IDisplayRow>({
  sl_no: Number,
  id_number: String,
  display_unit: String,
  parameter_name: String,
  parameter_details: String,
  remarks: String,
});

const ManualSectionSchema = new Schema<IManualSection>(
  {
    section_type: {
      type: String,
      enum: ['display-list', 'html', 'image', 'pdf', 'table', 'text-post', 'file-link'],
    },
    content: { type: String, default: '' },
    title: { type: String, default: '' },
    display_rows: [DisplayRowSchema],
    likes: [String],
    contributors: [ContributorSchema],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

const CommentSchema = new Schema<IComment>({
  username: String,
  full_name: String,
  profile_pic_url: String,
  text: String,
  likes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const PhotoSchema = new Schema<IPhoto>({
  url: String,
  caption: String,
  uploadedBy: ContributorSchema,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const DataNoteSchema = new Schema<IDataNote>(
  {
    slug: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: [
        'meter-manual',
        'equipment-manual',
        'instruction',
        'document',
        'application-form',
        'general-data',
        'online-data',
      ],
      required: true,
    },
    title: { type: String, required: true },
    icon: { type: String, default: '📄' },
    item: { type: String, default: '' },
    type: { type: String, default: '' },
    details: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    likes: [String],
    createdBy: ContributorSchema,
    specifications: {
      rows: [SpecRowSchema],
      contributors: [ContributorSchema],
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
      pendingRows: [SpecRowSchema],
      pendingContributors: [ContributorSchema],
    },
    manualSections: [ManualSectionSchema],
    comments: [CommentSchema],
    photos: [PhotoSchema],
    imageUrl: String,
    fileUrl: String,
    htmlContent: String,
    pendingImageUrl: String,
    pendingFileUrl: String,
    pendingHtmlContent: String,
  },
  { timestamps: true }
);

// Text index for search
DataNoteSchema.index({
  title: 'text',
  item: 'text',
  type: 'text',
  details: 'text',
});

// Regular indexes
DataNoteSchema.index({ category: 1, status: 1 });
DataNoteSchema.index({ slug: 1 });

if (mongoose.models && mongoose.models.DataNote) {
  delete mongoose.models.DataNote;
}

export const DataNote =
  mongoose.models.DataNote || mongoose.model<IDataNote>('DataNote', DataNoteSchema);
