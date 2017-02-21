import { Serializer } from 'ember-cli-mirage';
import Ember from 'ember';

export default Serializer.extend({

  root: false,
  embed: true,

  keyForModel(modelName) {
    return Ember.String.classify(modelName);
  },

  serialize(obj, req) {

    let json = Serializer.prototype.serialize.apply(this, arguments);

    console.log(req);
    console.log(obj);

    json['_identity'] = {
      type: Ember.String.classify(obj.modelName),
      id: obj.attrs.id
    };

    return json;
  },
});
