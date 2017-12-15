import gql from 'graphql-tag'

const fragment = gql`
  fragment ContentFragment on content {
    id
    type
    index
    title
    description
    image0{
      id
    }
  }
`

export default fragment
