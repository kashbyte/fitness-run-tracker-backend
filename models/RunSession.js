import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  name: String,
  joinedAt: { type: Date, default: Date.now },
});

const runSessionSchema = new mongoose.Schema({
  sessionId: String,
  activityType: {
    type: String,
    enum: ["run", "gym", "sport", "other"],
    default: "run",
  },
  startTime: Date,
  duration: Number, // in minutes
  maxParticipants: Number,
  participants: [participantSchema],
  status: {
    type: String,
    enum: ["scheduled", "active", "completed"],
    default: "scheduled",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("RunSession", runSessionSchema);
