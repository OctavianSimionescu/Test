const Issue = require("../../models/Issue");
const { HttpStatusCodes } = require("../../utils/utils");
const { Op } = require("sequelize");

const GAP_SIZE = 100; // Define a constant for the gap size

module.exports = async (_, { issueId, position }) => {
  try {
    const issue = await Issue.findByPk(issueId);

    if (!issue) {
      return {
        status: HttpStatusCodes.NOT_FOUND,
        message: "Issue not found",
      };
    }

    // Update the issue position
    issue.position = position;
    await issue.save();

    // Check if there's another issue too close to the desired position
    const closeIssue = await Issue.findOne({
      where: {
        position: {
          [Op.between]: [position - 0.0000001, position + 0.0000001],
        },
        id: {
          [Op.ne]: issueId, // Exclude the current issue
        },
      },
    });

    if (closeIssue) {
      // If there's an issue too close, normalize the positions
      await normalizePositions();
    }

    return {
      status: HttpStatusCodes.OK,
      message: "Issue position updated successfully",
    };
  } catch (error) {
    console.error("Error updating issue position:", error);
    return {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      message: "Error updating issue position",
    };
  }
};

async function normalizePositions() {
  return new Promise(async (resolve, reject) => {
    const issues = await Issue.findAll({ order: [["position", "ASC"]] });
    let currentPosition = GAP_SIZE; // Start with the first position

    for (const issue of issues) {
      if (issue.position === currentPosition) {
        currentPosition += GAP_SIZE;
        continue;
      } else {
        issue.position = currentPosition;
      }
      await issue.save();
      currentPosition += GAP_SIZE;
    }
    resolve();
  });
}
