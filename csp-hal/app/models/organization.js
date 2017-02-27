import DS from 'ember-data';

export default DS.Model.extend({
  createdAt: DS.attr('date'),
  lastModifiedAt: DS.attr('date'),

  members: DS.hasMany('user')
});
