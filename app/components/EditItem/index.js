import { gql, graphql, compose } from 'react-apollo'
import EditItem from './EditItem'

const pageData = gql`
  query pageData (
    $itemId: ID!
    $userId: ID
    $orgSub: String
  ) {
    item (id: $itemId) {
      id
      title
      artist
      medium
      artist
      dated
      accessionNumber
      currentLocation
      creditLine
      text
      mainImage {
        id
      }
      details {
        id
      }
    }
    user (id: $userId) {
      id
      email
    }
    organization (
      subdomain: $orgSub
    ) {
      id
      images {
        id
      }
    }
  }
`

const editItem = gql`
  mutation editOrCreateItem (
    $itemId: ID
    $title: String
    $artist: String
    $medium: String
    $dated: String
    $accessionNumber: String
    $currentLocation: String
    $creditLine: String
    $text: String
    $mainImageId: ID
  ) {
    editOrCreateItem (
      item: {
        id: $itemId
        title: $title
        artist: $artist
        medium: $medium
        dated: $dated
        accessionNumber: $accessionNumber
        currentLocation: $currentLocation
        creditLine: $creditLine
        text: $text
      }
      mainImageId: $mainImageId
    ) {
      id
      title
      artist
      medium
      artist
      dated
      accessionNumber
      currentLocation
      creditLine
      text
      mainImage {
        id
      }
    }
  }
`

const editOrCreateDetail = gql`
  mutation editOrCreateDetail (
    $detailId: ID
    $itemId: ID
    $title: String
  ) {
    editOrCreateDetail (
      id: $detailId
      itemId: $itemId
      title: $title
    ) {
      id
      title
    }
  }
`

export default compose(
  graphql(pageData, {
    options: ({userId, orgSub, itemId}) => ({
      variables: {
        itemId,
        userId,
        orgSub
      }
    })
  }),
  graphql(editItem, {
    name: "editItem",
  }),
  graphql(editOrCreateDetail, {
    name: "editOrCreateDetail",
  })
)(
  EditItem
)
