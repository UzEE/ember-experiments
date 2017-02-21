import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
    username: faker.internet.userName.bind(faker.internet, faker.name.first, faker.name.last),
    email: faker.internet.email,
    createdAt: faker.date.past,
    lastModifiedAt: faker.date.recent
});
