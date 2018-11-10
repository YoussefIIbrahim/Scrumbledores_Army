let trigger = 
{
    updateDates: (next) =>
    {
      var currentDate = new Date();
      trigger.dateUpdated = currentDate;
      if (!trigger.createdAt)
        trigger.dateCreated = currentDate;
      next();
    }
}
module.exports = trigger;