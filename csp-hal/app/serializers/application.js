import DS from 'ember-data';
import Ember from 'ember';

let halReservedKeys = ['_embedded', '_links', '_identity', '_relations', '_page'];
let reservedKeys = halReservedKeys.concat(['meta'])

const COLLECTION_PAYLOAD_REQUEST_TYPES = [
  'findHasMany',
  'findMany',
  'query',
  'findAll'
];

function arrayFlatten(array) {
  let flattened = [];
  return flattened.concat.apply(flattened, array);
}

function halToJSONAPILink(link) {

  let converted;
  let linkKeys = Object.keys(link);

  if (linkKeys.length === 1) {

    converted = link.href;

  } else {

    converted = { href: link.href, meta: {} };

    linkKeys.forEach(key => {

      if (key !== 'href') {
        converted.meta[key] = link[key];
      }
    });
  }

  return converted;
}

export default DS.JSONAPISerializer.extend({

  keyForAttribute(attributeName/*, attributeMeta */) {
    return attributeName;
  },

  isSinglePayload(payload, requestType) {
    return COLLECTION_PAYLOAD_REQUEST_TYPES.indexOf(requestType) === -1;
  },

  extractAttributes(primaryModelClass, payload) {

    let payloadKey;
    let attributes = {};

    primaryModelClass.eachAttribute((attributeName, attributeMeta) => {

      payloadKey = this.keyForAttribute(attributeName, attributeMeta);

      if (!payload.hasOwnProperty(payloadKey)) {
        return;
      }

      attributes[attributeName] = payload[payloadKey];
      delete payload[payloadKey];
    });

    if (payload._links) {
      attributes.links = this.extractLinks(primaryModelClass, payload);
    }

    return attributes;
  },

  extractId(primaryModelClass, payload) {

    let id;

    if (payload.hasOwnProperty('_identity')) {
      id = payload._identity.id; 
    }

    return id === null || id === undefined || id === '' ? null : id + '';
  },

  extractLinks(primaryModelClass, payload) {

    let links;

    if (payload._links) {

      links = {};

      Object.keys(payload._links).forEach(link => {
        links[link] = halToJSONAPILink(payload._links[link]);
      });
    }

    return links;
  },

  extractMeta(store, requestType, payload, primaryModelClass) {

    const meta = payload.meta || {};
    const isSingle = this.isSinglePayload(payload, requestType);

    if (!isSingle) {

      Object.keys(payload).forEach(key => {

        if (reservedKeys.indexOf(key) > -1) {
          return;
        }

        meta[key] = payload[key];
        delete payload[key];

      });

      if (payload._links) {
        meta.links = this.extractLinks(primaryModelClass, payload);
      }
    }

    return meta;
  },

  extractRelationship(relationshipModelClass, payload, included) {

    if (Ember.isNone(payload)) {
      return undefined;
    }

    let relationshipModelName = relationshipModelClass.modelName;
    let relationship;

    if (Ember.typeOf(payload) === 'object') {

      relationship = {
        id: coerceId(this.extractId({}, payload))
      };

      if (relationshipModelName) {

        relationship.type = this.modelNameFromPayloadKey(relationshipModelName);
        included.push(this.normalize(relationshipModelClass, payload, included));
      }

    } else {

      relationship = {

        id: coerceId(payload),
        type: relationshipModelName
      };
    }

    return relationship;
  },

  extractRelationships(primaryModelClass, payload, included) {

    let relationships = {};
    let embedded = payload._embedded;
    let keyForRelationship = this.keyForRelationship;
    let keyForLink = this.keyForLink;
    let extractLink = this.extractLink;
    let links = payload._links;

    if (embedded || links) {

      primaryModelClass.eachRelationship((key, relationshipMeta) => {
        
        let relationship;
        let relationshipKey = keyForRelationship(key, relationshipMeta);
        let linkKey = keyForLink(key, relationshipMeta);

        if (embedded && embedded.hasOwnProperty(relationshipKey)) {
          
          let data;
          let relationModelClass = this.store.modelFor(relationshipMeta.type);

          if (relationshipMeta.kind === 'belongsTo') {
            
            data = this.extractRelationship(relationModelClass, embedded[relationshipKey], included);
          
          } else if (relationshipMeta.kind === 'hasMany') {
            
            data = embedded[relationshipKey].map(item => {
              return this.extractRelationship(relationModelClass, item, included);
            });
          }

          relationship = { data };
        }

        if (links && links.hasOwnProperty(linkKey)) {

          relationship = relationship || {};

          const link = links[linkKey];
          const useRelated = !relationship.data;

          relationship.links = {
            [useRelated ? 'related' : 'self']: extractLink(link)
          };
        }

        if (relationship) {
          relationships[key] = relationship;
        }
      }, this);
    }

    return relationships;
  },

  // This block was being used when we were using the JSONSerializer
  normalizeJSON(typeClass, hash) {

    let fields = Ember.get(typeClass, 'fields');
    let result = {};

    fields.forEach(function (field, key) {

      if (hash.hasOwnProperty(key)) {
        result[key] = hash[key];
      }
    });

    if (hash.hasOwnProperty('_identity')) {
      result['id'] = hash['_identity']['id'];
    }

    return this._super(typeClass, result);
  },

  normalize(primaryModelClass, payload, included) {

    let data;

    if (payload) {

      const attributes = this.extractAttributes(primaryModelClass, payload);
      const relationships = this.extractRelationships(primaryModelClass, payload, included);

      data = {
        id: this.extractId(primaryModelClass, payload),
        type: primaryModelClass.modelName
      };

      if (Object.keys(attributes).length > 0) {
        data.attributes = attributes;
      }

      if (Object.keys(relationships).length > 0) {
        data.relationships = relationships;
      }

      if (data.attributes) {
        this.applyTransforms(primaryModelClass, data.attributes);
      }
    }

    return data;
  },

  normalizeResponse(store, primaryModelClass, payload, id, requestType) {

    const documentHash = {}, included = [];
    const isSingle = this.isSinglePayload(payload, requestType);
    const meta = this.extractMeta(store, requestType, payload, primaryModelClass);

    if (meta) {
      documentHash.meta = meta;
    }

    if (isSingle) {

      documentHash.data = this.normalize(primaryModelClass, payload, included);

    } else {

      documentHash.data = [];
      payload._embedded = payload._embedded || {};

      const normalizedEmbedded = Object.keys(payload._embedded)
        .map(embeddedKey => {
          return payload._embedded[embeddedKey].map(embeddedPayload => {
            return this.normalize(primaryModelClass, embeddedPayload, included)
          })
        });

      documentHash.data = arrayFlatten(normalizedEmbedded);
    }

    documentHash.included = included;
    return documentHash;
  }
});
