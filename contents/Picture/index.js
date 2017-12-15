

const config = {
  fields: {
    title: {
      database: {
        column: "title",
        type: "String"
      },
      graphql: {
        field: "title",
        type: "String"
      },
      cms: {
        type: "input"
      },
      lume: {
        element: "h2",
        position: "side"
      }
    },
    description: {
      database: {
        column: "description",
        type: "String"
      },
      graphql: {
        field: "description",
        type: "String"
      },
      cms: {
        type: "textarea"
      },
      lume: {
        element: "p",
        position: "side"
      }
    }
  }
}


export default config
