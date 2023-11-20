const Sprint = require("../../models/Sprint");
const Issue = require("../../models/Issue");
const IssueAssignment = require("../../models/IssueAssignment");
const { Op } = require("sequelize");
const Journal = require("../../models/Journal");
const JournalDetail = require("../../models/JournalDetail");

module.exports = async (_, { startDate, endDate, storyId }, context) => {
  try {
    // Fetch sprints that are open within the given date range
    const sprints = await Sprint.findAll({
      where: {
        start_date: {
          [Op.lte]: endDate,
        },
        end_date: {
          [Op.gte]: startDate,
        },
      },
    });

    const sprintIds = sprints.map((sprint) => sprint.id);

    // Fetch issues that are either part of the fetched sprints or have a parent_id corresponding to a 'User Story' in the current sprints
    const issues = await Issue.findAll({
      where: {
        parent_id: { [Op.in]: [storyId] },
      },
      include: [
        {
          model: IssueAssignment,
          as: "assignments",
        },
        {
          model: Journal, // Include the associated journals
          as: "journals",
          include: [
            // Nest inclusion for JournalDetails within Journal
            {
              model: JournalDetail,
              as: "details",
            },
          ],
        },
      ],
      order: [["position", "ASC"]],
    });

    return {
      storyId,
      issues,
    };
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};
