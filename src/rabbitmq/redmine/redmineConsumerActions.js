const {
  ISSUE_STATUS: ISSUE_STATUSES,
  put,
  SERVER_EVENT_TYPES,
  ISSUE_TRACKERS,
} = require("../../utils/utils");

const cruProject = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received project %s", msg.content.toString());
      const project = JSON.parse(msg.content.toString());
      if (project) {
        await adapter.updateProject(project);
        await adapter.updateFrontendProjectsRealTime(project);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const deleteProject = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received deleted project %s", msg.content.toString());
      const project = JSON.parse(msg.content.toString());
      if (project) {
        await adapter.deleteProject(project);
        await adapter.updateFrontendProjectsRealTime(project);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const cruIssue = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received issue %s", msg.content.toString());
      const issue = await JSON.parse(msg.content.toString());
      const acceptedFormatIssue = {
        id: issue.id,
        spent_hours: issue.spent_hours,
        project: { id: issue.project_id },
        tracker: { id: issue.tracker_id },
        status: { id: issue.status_id },
        priority: { id: issue.priority_id },
        author: { id: issue.author_id },
        assigned_to: { id: issue.assigned_to_id },
        subject: issue.subject,
        description: issue.description,
        sprint_id: issue.sprint_id,
        start_date: issue.start_date,
        due_date: issue.due_date,
        done_ratio: issue.done_ratio,
        estimated_hours: issue.estimated_hours,
        created_on: issue.created_on,
        updated_on: issue.updated_on,
        closed_on: issue.closed_on,
        parent: { id: issue.parent_id },
        root_id: issue.root_id,
      };

      if (issue && issue.status_id === ISSUE_STATUSES["IN_PROGRESS"]) {
        const inProgressIssuesForUser = await adapter.getInProgressIssues(
          issue.assigned_to_id,
          issue.id
        );
        if (inProgressIssuesForUser.length === 0) {
          await adapter.updateIssue(acceptedFormatIssue);
        } else {
          const existingIssue = await adapter.getIssue(issue.id);
          let newStatus = ISSUE_STATUSES["ON_HOLD"];
          if (existingIssue) {
            newStatus = existingIssue.status_id;
          }
          if (existingIssue.issue_type_id !== ISSUE_TRACKERS.USER_STORY) {
            await put(
              `${process.env.REDMINE_HOST}/issues/${issue.id}.json`,
              {
                issue: {
                  status_id: newStatus,
                },
              },
              {
                "X-Redmine-API-Key": process.env.REDMINE_API_KEY,
                "Content-Type": "application/json",
              }
            );
          }
          if (existingIssue) {
            acceptedFormatIssue.status = {
              id: existingIssue.status_id,
            };
          }
          await adapter.updateIssue(acceptedFormatIssue);
        }
      } else {
        if (issue) {
          await adapter.updateIssue(acceptedFormatIssue);
        }
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const deleteIssue = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received deleted issue %s", msg.content.toString());
      const issue = JSON.parse(msg.content.toString());
      if (issue) {
        await adapter.deleteIssue(issue);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const cruSprints = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received sprint %s", msg.content.toString());
      const sprint = JSON.parse(msg.content.toString());
      if (sprint) {
        await adapter.updateSprint(sprint);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const deleteSprint = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received deleted sprint %s", msg.content.toString());
      const sprint = JSON.parse(msg.content.toString());
      if (sprint) {
        await adapter.deleteSprint(sprint);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const cruJournal = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received sprint %s", msg.content.toString());
      const journal = JSON.parse(msg.content.toString());
      if (journal) {
        await adapter.updateJournal(journal);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const cruMember = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received member %s", msg.content.toString());
      const member = JSON.parse(msg.content.toString());
      if (member) {
        await adapter.updateMember(member);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const deleteMember = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(" [x] Received deleted member %s", msg.content.toString());
      const member = JSON.parse(msg.content.toString());
      if (member) {
        await adapter.deleteMember(member);
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

const cruUserStories = (msg, adapter) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(
        " [x] Received updated user stories position %s",
        msg.content.toString()
      );
      const newUserStoriesPositionArray = JSON.parse(msg.content.toString());
      if (
        newUserStoriesPositionArray &&
        newUserStoriesPositionArray.length > 0
      ) {
        await adapter.updateUserStoriesPositionFromArray(
          newUserStoriesPositionArray
        );
      }
      resolve();
    } catch (err) {
      resolve(err);
      console.log(err);
    }
  });
};

module.exports = {
  cruProject,
  deleteProject,
  cruIssue,
  deleteIssue,
  cruSprints,
  deleteSprint,
  cruMember,
  deleteMember,
  cruUserStories,
  cruJournal,
};
