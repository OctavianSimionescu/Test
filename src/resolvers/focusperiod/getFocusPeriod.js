const FocusPeriod = require('../../models/FocusPeriod');

module.exports = async (_, { }, context) => {
  try {
    const lastFocusPeriod = await FocusPeriod.findOne({
      order: [['id', 'DESC']],
    });

    return lastFocusPeriod;
  } catch (error) {
    console.error('Error fetching last sprint:', error);
    throw error;
  }
}


