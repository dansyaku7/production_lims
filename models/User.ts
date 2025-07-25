import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'analyst', 'guest'], 
      default: 'guest', // Role default saat user baru mendaftar
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);