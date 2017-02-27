import { Factory, faker, association } from 'ember-cli-mirage';

export default Factory.extend({
    createdAt: faker.date.past,
    lastModifiedAt: faker.date.recent,

    createdBy: association('user')
});
