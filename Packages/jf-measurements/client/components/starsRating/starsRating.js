import { JF } from 'meteor/jf:core';

Template.starsRatingForm.onCreated(() => {
  const instance = Template.instance();
  instance.data.confirmCallback = () => {
    const rating = instance.$('#reportRating').data('userrating');
    return { rating };
  }
});
