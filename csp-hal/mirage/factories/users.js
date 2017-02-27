import { Factory, faker, association } from 'ember-cli-mirage';

export default Factory.extend({
  username: faker.internet.userName.bind(faker.internet, faker.name.first, faker.name.last),
  email: faker.internet.email,
  createdAt: faker.date.past,
  lastModifiedAt: faker.date.recent,

  //createdBy: association('user'),

  //membership: association('organization'),

  afterCreate(user, server) {

    // if (!user.createdBy) {

    //   if (user.id == 1) {
        
    //     user.username = 'admin';
    //     user.save();
      
    //   } else {
    //     user.createdBy = server.schema.users.where({ id: 1 });
    //   }
    // }

    //server.create('membership', { createdBy: user });

    let orgs = server.schema.organizations.all().models;

    user.membership = orgs[Math.floor(Math.random() * orgs.length)];
    user.save();
  }
});
