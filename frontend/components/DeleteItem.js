import React, { Component } from 'react'
import { Mutation, Query } from 'react-apollo'
import gql from 'graphql-tag'
import {ALL_ITEMS_QUERY} from './Items'

const DELETE_ITEM_MUTATION = gql`
  mutation DELETE_ITEM_MUTATION($id: ID!) {
    deleteItem(id: $id) {
      id
      title
      description
      price
    }
  }
`

class DeleteItem extends Component {
  update = (cache, payload) => {
    const data = cache.readQuery({query: ALL_ITEMS_QUERY})
    console.log(data, payload)
    data.items = data.items.filter( item => item.id !== payload.data.deleteItem.id)
    cache.writeQuery({query: ALL_ITEMS_QUERY, data})
  }
  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
        >
        {(deleteItem, { loading, error }) => (
          <button onClick={() => {
            if(confirm('Sure you want to delete this?')){
              deleteItem()
            }
          }}>{this.props.children}</button>
        )}
      </Mutation>
    )
  }
}

export default DeleteItem
