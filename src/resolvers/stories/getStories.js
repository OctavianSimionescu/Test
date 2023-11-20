const Issue = require("../../models/Issue");
const Member = require("../../models/Member");
const Sprint = require("../../models/Sprint");
const { Op } = require("sequelize");
const { ISSUE_TRACKERS } = require("../../utils/utils");
const Journal = require("../../models/Journal");
const JournalDetail = require("../../models/JournalDetail");
const Project = require("../../models/Project");

module.exports = async (_, { projectId, startDate, endDate }, context) => {
  try {
    // Identify sprints based on the provided startDate and endDate
    const sprintsInDateRange = await Sprint.findAll({
      where: {
        start_date: { [Op.lte]: endDate },
        end_date: { [Op.gte]: startDate },
      },
    });
    const sprintIds = sprintsInDateRange.map((sprint) => sprint.id);

    // Fetch 'User Story' issues from the sprints within the date range of projects the user is a member of
    const issues = await Issue.findAll({
      where: {
        project_id: [projectId],
        sprint_id: sprintIds,
        issue_type_id: ISSUE_TRACKERS.USER_STORY,
      },
      include: [
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
      projectId,
      stories: issues,
    };
  } catch (error) {
    console.error("Error fetching stories:", error);
    throw error;
  }
};
