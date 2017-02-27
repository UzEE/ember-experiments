export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
  */

  server.createList('organizations', 5);
  server.createList('users', 44);
  server.loadFixtures();
}
