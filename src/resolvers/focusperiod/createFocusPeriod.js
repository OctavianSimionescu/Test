const FocusPeriod = require('../../models/FocusPeriod');

module.exports = async (_, { startDate, endDate }, context) => {
    try {
        const newFocusPeriod = await FocusPeriod.create({startDate, endDate})
        return newFocusPeriod;
    } catch (error) {
        console.error('Error creating focus period:', error);
        throw error;
    }
}