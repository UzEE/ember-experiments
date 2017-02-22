import { Serializer } from 'ember-cli-mirage';
import Ember from 'ember';
const { pluralize } = Ember.String;

export default Serializer.extend({

  root: false,
  embed: true,

  /**
   * Generate a HAL HATEOAS like JSON response from our model data
   */
  serialize(obj, req) {

    let json = Serializer.prototype.serialize.apply(this, arguments);
    let output = {};

    console.log(req);
    console.log(obj);

    const buildHref = (entity, id = null, page = null, size = null) => {

      let params = ``;

      if (page !== null) {
        params = `?page=${page}`;

        if (size !== null) {
          params += `&size=${size}`;
        }
      }

      if (id === null) {

        id = ``;
      
      } else {
        id = `/${id}`;
      }

      return {
        href: `http://api.myservice.com/${pluralize(entity)}${id}${params}`
      };
    };

    const buildIdentity = (data) => {

      data['_identity'] = {
        type: obj.modelName,
        id: data.id
      };

      delete data.id;
    };

    if (Array.isArray(json)) {

      json.forEach((item) => {

        buildIdentity(item);

        item['_links'] = {
          self: buildHref(obj.modelName, item._identity.id)
        };
      });

      output['_embedded'] = {
        [pluralize(obj.modelName)]: json
      };

      output[`_page`] = {
        size: obj.meta.size,
        number: obj.meta.page,
        totalElements: obj.meta.count,
        totalPages: obj.meta.pageCount
      };

      output['_links'] = {
        self: buildHref(obj.modelName, null, obj.meta.page, obj.meta.size)
      };

      if (obj.meta.pageCount > 1) {

        output._links.first = buildHref(obj.modelName, null, 0, obj.meta.size);
        output._links.last = buildHref(obj.modelName, null, obj.meta.pageCount - 1, obj.meta.size);

        if (obj.meta.page > 0) {
          output._links.prev = buildHref(obj.modelName, null, obj.meta.page - 1, obj.meta.size);
        }

        if (obj.meta.page < obj.meta.pageCount - 1) {
          output._links.next = buildHref(obj.modelName, null, obj.meta.page + 1, obj.meta.size);
        }
      }

    } else {

      output = json;

      output['_identity'] = {
        type: obj.modelName,
        id: obj.attrs.id
      };

      output['_links'] = {
        self: buildHref(obj.modelName, obj.attrs.id)
      };

      delete output.id;
    }

    return output;
  },
});
