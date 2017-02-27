import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  //createdBy: belongsTo('user'),
  //memberships: hasMany('memberships')

  membership: belongsTo('organizations')
});
