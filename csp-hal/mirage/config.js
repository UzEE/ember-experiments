export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.2.x/shorthands/
  */

  this.get('users', (schema, req) => {

    let page = parseInt(req.queryParams.page) || 0;
    let size = parseInt(req.queryParams.size) || 10;
    let users = schema.users.all();

    let sliced = users.slice(page * size, (page * size) + size);

    sliced.meta = { page, size, count: users.length, pageCount: Math.ceil(users.length / size) };
    return sliced;
  });

  this.get('users/:id', (schema, req) => {

    let user = schema.users.find(req.params.id);

    return user;
  });

  this.get('organizations/:id');
}
