import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeadNote {
  text: string;
  outcome?: string;
  createdAt: Date;
}

export interface ILead extends Document {
  userId?: string;
  fullName: string;
  workEmail?: string;
  phoneNumber?: string;
  company?: string;
  teamSize?: string;
  industry?: string;
  currentTools?: string;
  type?: "waitlist" | "demo" | "crm";
  status: "new" | "interested" | "callback" | "no_answer" | "busy" | "not_interested" | "closed";
  priority: "high" | "medium" | "low";
  followUpDate?: Date;
  notes: ILeadNote[];
  tags: string[];
  source?: string;
  callCount: number;
  lastCalledAt?: Date;
  preferredTime?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema(
  {
    text: { type: String, required: true },
    outcome: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const LeadSchema: Schema = new Schema(
  {
    userId: { type: String, index: true },
    fullName: { type: String, required: true, trim: true },
    workEmail: { type: String, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    company: { type: String, trim: true },
    teamSize: { type: String, default: "1-5" },
    industry: { type: String, default: "Sales Outbound" },
    currentTools: { type: String },
    type: { type: String, enum: ["waitlist", "demo", "crm"], default: "crm" },
    status: {
      type: String,
      enum: ["new", "interested", "callback", "no_answer", "busy", "not_interested", "closed"],
      default: "new",
      index: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    followUpDate: { type: Date },
    notes: [LeadNoteSchema],
    tags: [{ type: String, trim: true }],
    source: { type: String, default: "Manual" },
    callCount: { type: Number, default: 0 },
    lastCalledAt: { type: Date },
    preferredTime: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

// Clear model cache in dev so schema changes take effect immediately
if (mongoose.models && mongoose.models.Lead) {
  delete mongoose.models.Lead;
}

export const Lead: Model<ILead> = mongoose.model<ILead>("Lead", LeadSchema);
