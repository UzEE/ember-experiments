import DS from 'ember-data';

export default DS.Model.extend({
    username: DS.attr('string'),
    email: DS.attr('string'),
    createdAt: DS.attr('date'),
    lastModifiedAt: DS.attr('date'),

    membership: DS.belongsTo('organization')
});
