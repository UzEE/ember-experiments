import { Factory, faker } from 'ember-cli-mirage';

export default Factory.extend({
  name: faker.company.companyName,
  createdAt: faker.date.past,
  lastModifiedAt: faker.date.recent
});
