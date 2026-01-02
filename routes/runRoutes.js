import express from "express";
import RunSession from "../models/RunSession.js";

const router = express.Router();

// Helper to calculate status
const calculateStatus = (session) => {
  const now = new Date();
  const start = new Date(session.startTime);
  const end = new Date(start.getTime() + session.duration * 60000);

  if (now < start) return "scheduled";
  if (now >= start && now < end) return "active";
  return "completed";
};

// Valid activity types
const validActivities = ["run", "gym", "sport", "other"];

// CREATE session
router.post("/create", async (req, res) => {
  try {
    let { startTime, duration, maxParticipants, activityType } = req.body;

    if (!startTime || !duration || !maxParticipants) {
      return res.status(400).json({
        message: "Please provide startTime, duration, and maxParticipants",
      });
    }

    // Force lowercase and validate activityType
    activityType = (activityType || "run").toLowerCase();
    if (!validActivities.includes(activityType)) activityType = "run";

    const session = new RunSession({
      sessionId: Math.random().toString(36).substring(2, 10),
      startTime,
      duration: Number(duration),
      maxParticipants: Number(maxParticipants),
      activityType,
      participants: [],
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error("Error creating session:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all sessions (homepage feed)  ✅ MUST BE BEFORE :sessionId
router.get("/", async (req, res) => {
  try {
    const sessions = await RunSession.find().sort({ startTime: 1 });

    for (const session of sessions) {
      const newStatus = calculateStatus(session);
      if (session.status !== newStatus) {
        session.status = newStatus;
        await session.save();
      }
    }

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET session by ID
router.get("/:sessionId", async (req, res) => {
  try {
    const session = await RunSession.findOne({
      sessionId: req.params.sessionId,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const newStatus = calculateStatus(session);
    if (session.status !== newStatus) {
      session.status = newStatus;
      await session.save();
    }

    res.json(session);
  } catch (err) {
    console.error("Error fetching session by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// JOIN session
router.post("/:sessionId/join", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const session = await RunSession.findOne({
      sessionId: req.params.sessionId,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const status = calculateStatus(session);
    if (status !== "scheduled") {
      return res.status(403).json({ message: "Session already started" });
    }

    if (session.participants.length >= session.maxParticipants) {
      return res.status(403).json({ message: "Participant limit reached" });
    }

    const alreadyJoined = session.participants.some((p) => p.name === name);
    if (alreadyJoined) {
      return res.status(400).json({ message: "Name already joined" });
    }

    session.participants.push({ name });
    await session.save();

    res.json(session);
  } catch (err) {
    console.error("Error joining session:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
