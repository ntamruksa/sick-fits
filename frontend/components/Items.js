import React, { Component } from 'react';
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY {
    items {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`
export default class Items extends Component {
  render() {
    return (
      <div>
        <Query query ={ALL_ITEMS_QUERY}>
        {({data, loading, error}) => {
          console.log(data)
          if (loading) return <p className="">Loading ...</p>
          if (error) return <p className="">Error!</p>
          return (
            <p className="p">I am in payload</p>
          )
        }}
        </Query>
      </div>
    );
  }
}
