import React, { Component } from 'react'
import styled from 'styled-components'
import { Button } from '../../mia-ui/buttons'
import CreateContentButton from '../CreateContentButton'
import EditStoryThumb from '../EditStoryThumb'
import EditContentThumb from '../EditContentThumb'
import StoryEditor from '../StoryEditor'
import { Select, Option, Input } from '../../mia-ui/forms'
import EditorSwitcher from '../../contents/EditorSwitcher'
import DisplaySwitcher from '../../contents/DisplaySwitcher'
import { Link } from '../../mia-ui/links'
import NextLink from 'next/link'
import StoryPreview from '../../lume/Story/Story.component'
import { Flex, Box } from 'grid-styled'
import { H3, H2 } from '../../mia-ui/text'
import { Break } from '../../mia-ui/layout'
import Head from '../../shared/head'
import Joyride from 'react-joyride'
import { Loading } from '../../mia-ui/loading'
import { CreateContent } from '../../../apollo/mutations/createContent'

export default class Editor extends Component {
  contentTypes = ['comparison', 'detail', 'obj', 'picture', 'movie']

  tips = [
    {
      target: '#save-status',
      content:
        'Your story will be automatically saved after each change. You can see the save status here.',
      placement: 'bottom-end'
    },
    {
      target: '#preview-button',
      content:
        'You can see a preview of your story at anytime by clicking here.',
      placement: 'bottom-start'
    },
    {
      target: '#live-button',
      content:
        "And once you've published your story, you can see it live by clicking here.",
      placement: 'bottom-start'
    },
    {
      target: '#sidebar',
      content:
        'By clicking on the various tiles on the left, you can edit your story and the content items that make up your story.',
      placement: 'auto'
    },
    {
      target: '#story-thumb',
      content:
        'The top tile in the sidebar allows you to edit the details of your story. This is where you can change its title, main image, visibility and more.',
      placement: 'auto'
    },
    {
      target: '#create-content',
      content:
        'Each story is made up of "Contents". To create a new Content, select the content\'s type and then click "Create Content."',
      placement: 'auto'
    }
  ]

  demoSteps = [
    {
      content: (
        <div>
          <p>Let's dive right in and we learn what everything is on the way.</p>
          <Button
            onClick={() => {
              this.setState(({ demoIndex }) => ({
                storyEditorDemo: true,
                showDemo: false
              }))
            }}
          >
            Next
          </Button>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
      target: 'body'
    },
    {
      content: (
        <div>
          <p>
            We've edited some elements of our story but the real opportunity for
            storytelling comes from a story's content blocks.
          </p>
          <p>
            The bar on the side of our editor allows us to edit a specific
            content block or our story itself. The sidebar is also where we find
            the button that allows us to create new content blocks.
          </p>
          <Button
            onClick={() => {
              this.setState(({ demoIndex }) => ({
                demoIndex: demoIndex + 1
              }))
            }}
          >
            Create a content block
          </Button>
        </div>
      ),
      target: '#sidebar',
      disableBeacon: true,
      placement: 'right'
    },
    {
      content: (
        <div>
          <p>
            There are currently five different types of content: picture, move,
            object, comparison, and detail.
          </p>

          <p>
            We're going to look at Object, Comparison, and Detail in this
            walkthrough.
          </p>

          <p>First let's create an Object content.</p>
          <Button
            onClick={async () => {
              try {
                const {
                  data: {
                    createContent: { content }
                  }
                } = await this.props.client.mutate({
                  mutation: CreateContent,
                  variables: {
                    storyId: this.props.story.id,
                    type: 'obj'
                  }
                })
                this.setState(({ demoIndex }) => ({
                  demoIndex: demoIndex + 1
                }))
              } catch (ex) {
                console.error(ex)
              }
            }}
          >
            Create a content block
          </Button>
        </div>
      ),
      target: '#create-content',
      disableBeacon: true
    }
  ]

  handleStoryEditorDemoFinish = () => {
    this.setState(({ demoIndex }) => ({
      storyEditorDemo: false,
      demoIndex: demoIndex + 1,
      showDemo: true
    }))
  }

  handleDemoChange = async e => {
    try {
      console.log(e)
    } catch (ex) {
      console.error(ex)
    }
  }

  render() {
    console.log(this)

    if (!this.props.story) return <Loading />

    const {
      props: {
        story,
        story: { id: storyId, slug },
        router,
        router: {
          query: { subdomain }
        },
        saveStatus: { synced },
        organization
      },
      state: { editing, selectedContent, contentType, contents, preview },
      handleStorySelection,
      handleContentSelection,
      handleChange,
      renderContentEditor,
      handleReorder,
      contentTypes,
      togglePreview,
      renderSaveStatus
    } = this

    if (preview)
      return (
        <PreviewContainer w={1}>
          <PreviewButtonBox>
            <Button
              onClick={() => this.setState({ preview: false })}
              color={'blue'}
            >
              Return to Editing
            </Button>
            {story.visibility === 'published' ? (
              <Button
                color={'green'}
                a
                href={`${process.env.LUME_URL}/${subdomain}/${slug}`}
              >
                View Live
              </Button>
            ) : (
              <Button disabled color={'green'}>
                Unpublished
              </Button>
            )}
          </PreviewButtonBox>
          <StoryPreview story={story} />
        </PreviewContainer>
      )

    return (
      <FullPage flexDirection={'column'} alignItems={'flex-start'}>
        {story ? <Head title={`Editing: ${story.title}`} /> : null}

        <PreviewButtonBox width={1 / 6}>
          <Button
            onClick={() => this.setState({ preview: true })}
            color={'blue'}
            id={'preview-button'}
          >
            Preview your Story
          </Button>
          {story.visibility === 'published' ? (
            <NextLink
              href={{
                pathname: '/lume/story',
                query: {
                  subdomain,
                  storySlug: slug
                }
              }}
              as={`/${subdomain}/${slug}`}
            >
              <Button color={'green'} a id={'live-button'}>
                View Live
              </Button>
            </NextLink>
          ) : (
            <Button disabled color={'green'} id={'live-button'}>
              Unpublished
            </Button>
          )}
        </PreviewButtonBox>
        <TopBar w={1} p={2} alignItems={'center'} justifyContent={'flex-start'}>
          <Box w={1 / 6}>
            <Link
              href={{
                pathname: '/cms',
                query: {
                  subdomain
                }
              }}
              as={`/${subdomain}`}
            >
              Back to All Stories
            </Link>
          </Box>
          <Box w={1 / 3}>
            <H2>{story.title ? story.title : 'Untitled Story'}</H2>
          </Box>

          <Box w={1 / 3}>{renderSaveStatus()}</Box>
        </TopBar>
        <Workspace w={1}>
          <Sidebar w={1 / 5} id={'sidebar'}>
            <Flex
              flexDirection={'column'}
              p={3}
              justifyContent={'flex-start'}
              alignItems={'center'}
            >
              <EditStoryThumb
                storyId={storyId}
                selected={editing === 'story'}
                onSelect={handleStorySelection}
              />

              <Break />

              {contents
                ? contents.map(({ id, __typename }, index) => (
                    <EditContentThumb
                      key={id}
                      index={index}
                      contentId={id}
                      onSelect={handleContentSelection}
                      onReorder={handleReorder}
                      selected={
                        selectedContent ? selectedContent.id === id : false
                      }
                    />
                  ))
                : null}

              <Break />

              <div id={'create-content'}>
                <Select
                  name={'contentType'}
                  onChange={handleChange}
                  value={contentType}
                  innerRef={ref => {
                    this.contentTypeRef = ref
                  }}
                >
                  {contentTypes.map(type => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
                <CreateContentButton storyId={storyId} type={contentType} />
              </div>
            </Flex>
          </Sidebar>

          <EditingPane width={1}>
            {editing === 'story' ? (
              <StoryEditor
                storyId={storyId}
                onDemoFinish={this.handleStoryEditorDemoFinish}
                showDemo={this.state.storyEditorDemo}
              />
            ) : null}

            {editing === 'content' ? (
              <EditorSwitcher content={selectedContent} />
            ) : null}
          </EditingPane>
        </Workspace>

        <Joyride
          run={this.state.showDemo} //this.props.router.query.demo ?  true : false}
          steps={this.state.demoSteps}
          callback={this.handleDemoChange}
          stepIndex={this.state.demoIndex}
          styles={{
            buttonClose: {
              display: 'none'
            },
            buttonNext: {
              display: 'none'
            },
            buttonBack: {
              display: 'none'
            }
          }}
        />
      </FullPage>
    )
  }

  renderSaveStatus = () => {
    const { synced } = this.props.saveStatus

    if (synced) {
      return <span id={'save-status'}>All Changes Saved</span>
    } else {
      return <span id={'save-status'}>...saving</span>
    }
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.state = {
      demoIndex: 1,
      demoSteps: this.demoSteps,
      showDemo: this.props.router.query.demo ? true : false,
      editing: 'story',
      selectedContent: null,
      contentType: 'comparison',
      contents: [],
      initialized: false,
      preview: false,
      ...this.propsToState(props)
    }
    this.contentTypeRef = React.createRef()
  }

  propsToState = props => {
    if (props.story) {
      let state = {}

      let contents = props.story.contents
        .slice()
        .sort((a, b) => a.index - b.index)

      Object.assign(state, { contents })

      if (this.state.selectedContent) {
        if (
          !props.story.contents.find(
            content => content.id === this.state.selectedContent.id
          )
        ) {
          Object.assign(state, {
            selectedContent: null,
            editing: 'story'
          })
        }
      }

      return state
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      ...this.propsToState(nextProps)
    })
  }

  saveReorder = () => {
    this.props.reorderContents({
      contentIds: this.state.contents.map(content => content.id),
      storyId: this.props.story.id
    })
  }

  togglePreview = () => {
    this.setState(({ preview }) => ({ preview: !preview }))
  }

  handleReorder = (dragIndex, hoverIndex) => {
    this.setState(({ contents: oldContents }) => {
      let contents = oldContents.slice()
      let temporary = contents[hoverIndex]
      contents[hoverIndex] = contents[dragIndex]
      contents[dragIndex] = temporary

      return {
        contents
      }
    }, this.saveReorder)
  }

  handleChange = ({ target: { value, name } }) =>
    this.setState({ [name]: value })

  handleStorySelection = () => {
    this.setState({
      editing: 'story',
      selectedContent: null
    })
  }

  handleContentSelection = selectedContentId => {
    let selectedContent = this.props.story.contents.find(
      content => content.id === selectedContentId
    )
    this.setState({
      editing: 'content',
      selectedContent
    })
  }
}

const FullPage = styled(Flex)`
  height: 100vh;
  max-height: 100vh;
  background-color: white;
`

const TopBar = styled(Flex)`
  height: 65px;
  border-bottom: 1px solid black;
`

const Workspace = styled(Flex)`
  height: 100%;
  max-height: 100%;
`

const Sidebar = styled(Box)`
  height: 100%;
  max-height: 100%;
  border-right: 1px solid black;
  overflow: scroll;
`

const EditingPane = styled(Box)`
  height: 100%;
`

const PreviewContainer = styled.div`
  height: 100vh;
  max-height: 100vh;
`

const PreviewButtonBox = styled.div`
  position: absolute;
  z-index: 1002;
  top: 8px;
  right: 110px;
`
