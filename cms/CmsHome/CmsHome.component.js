import React, {Component} from 'react'
import styled from 'styled-components'
import {H2} from '../../ui/h'
import {Spinner} from '../../ui/spinner'
import StoryList from '../StoryList'
import CreateStoryButton from '../CreateStoryButton'
import PropTypes from 'prop-types'

export default class CmsHome extends Component {

  static propTypes = {
    userId: PropTypes.string.isRequired,
    subdomain: PropTypes.string.isRequired
  }


  render() {

    if (!this.props.organization) return <Spinner/>

    const {
      props: {
        subdomain,
        userId,
        organization: {
          name
        }
      }
    } = this

    return (
      <Container>
        <H2>
          {name}
        </H2>

        <CreateStoryButton
          subdomain={subdomain}
          userId={userId}
        />

        <StoryList
          subdomain={subdomain}
        />

      </Container>
    )
  }

}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 100px auto;
  width: 50%;
  align-items: flex-start;
  border: 1px solid black;
  min-height: 100vh;
  padding: 20px;
`
