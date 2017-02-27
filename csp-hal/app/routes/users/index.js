import Ember from 'ember';

export default Ember.Route.extend({

  model(params) {
    return this.get('store').query('user', {
      page: params.page - 1,
      size: params.size
    });
  },

  queryParams: {
    
    page: {
      refreshModel: true
    },

    size: {
      refreshModel: true
    }
  }
});
