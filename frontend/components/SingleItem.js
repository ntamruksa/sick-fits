import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import styled from 'styled-components'
import Head from 'next/head'

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
      largeImage
    }
  }
`

const Center = styled.div`
  text-align: center;
`

const SingleItemItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`

class SingleItem extends Component {
  render() {
    return (
      <Center>
        <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
          {({ data, loading, error }) => {
            if (loading) return <p className=''>Loading ...</p>
            if (error) return <p className=''>Error!</p>
            if (!data.item) return <p>No Item found</p>
            return (
              <SingleItemItemStyles>
                <Head>
                  <title>Sick Fit | {data.item.title}</title>
                </Head>
                <img src={data.item.largeImage} alt={data.item.title}/>
                <div className="details">
                  <h2>Viewing {data.item.title}</h2>
                  <p>{data.item.description}</p>
                </div>
              </SingleItemItemStyles>
            )
          }}
        </Query>
      </Center>
    )
  }
}

export default SingleItem
