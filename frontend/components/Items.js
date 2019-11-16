import React, { Component } from 'react';
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Item from './Item'
import Pagination from './Pagination'
import { perPage } from '../config'

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int = 0, $first: Int = ${perPage}) {
    items(first: $first, skip: $skip, orderBy: id_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${props => props.theme.maxWidth};
  margin: 0 auto;
`;

export default class Items extends Component {
  render() {
    return (
      <Center>
        <Pagination page={this.props.page}/>
        <Query query ={ALL_ITEMS_QUERY} variables={{skip:perPage * (this.props.page - 1)}}>
        {({data, loading, error}) => {
          console.log(data)
          if (loading) return <p className="">Loading ...</p>
          if (error) return <p className="">Error!</p>
          return (
            <ItemsList>
              {data.items.map(item => <Item item={item} key={item.id}/>)}
            </ItemsList>
          )
        }}
        </Query>
        <Pagination  page={this.props.page}/>
      </Center>
    );
  }
}

export { ALL_ITEMS_QUERY }