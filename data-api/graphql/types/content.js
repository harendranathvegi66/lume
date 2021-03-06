import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList
} from 'graphql'
import { ContentTypeEnum } from './enums'
import featureCollectionType, { FeatureCollectionInput } from './geometry'
import imageType from './image'
import mediaType from './media'

import objType from './obj'
import objResolve from '../resolvers/obj'

const contentType = new GraphQLObjectType({
  name: 'content',
  fields: () => ({
    id: {
      type: GraphQLID
    },
    type: {
      type: ContentTypeEnum
    },
    index: {
      type: GraphQLInt
    },
    title: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    image0: {
      type: imageType,
      async resolve(src) {
        try {
          return await src.getImage0()
        } catch (ex) {
          console.error(ex)
        }
      }
    },
    image1: {
      type: imageType,
      async resolve(src) {
        try {
          return await src.getImage1()
        } catch (ex) {
          console.error(ex)
        }
      }
    },
    videoUrl: {
      type: GraphQLString
    },
    geoJSON: {
      type: featureCollectionType
    },
    obj: {
      type: objType,
      resolve: objResolve
    },
    additionalImages: {
      type: new GraphQLList(imageType),
      async resolve(src) {
        try {
          return await src.getAdditionalImages()
        } catch (ex) {
          console.error(ex)
        }
      }
    },
    additionalMedias: {
      type: new GraphQLList(mediaType),
      async resolve(src) {
        try {
          return await src.getAdditionalMedias()
        } catch (ex) {
          console.error(ex)
        }
      }
    },
    mapUrl: {
      type: GraphQLString
    },
    mapKey: {
      type: GraphQLString
    }
  })
})

export default contentType
