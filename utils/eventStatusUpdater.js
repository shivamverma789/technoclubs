const cron = require("node-cron");
const Event = require("../models/Event");

const updateEventStatus = async () => {
  try {
    const today = new Date();
    await Event.updateMany(
      { eventDate: { $lt: today }, status: "upcoming" }, // Past events but still marked as upcoming
      { $set: { status: "past" } }
    );
    console.log("✅ Event status updated!");
  } catch (error) {
    console.error("❌ Error updating event status:", error);
  }
};

// Schedule job to run every midnight
cron.schedule("0 0 * * *", updateEventStatus);

module.exports = updateEventStatus;
