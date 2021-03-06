import { configure } from '@storybook/react'
import { setDefaults } from '@storybook/addon-info'
import { withKnobs } from '@storybook/addon-knobs/react'
import { addDecorator } from '@storybook/react'
import ThemeProvider from './theme'
import React from 'react'

addDecorator(withKnobs)

addDecorator(story => <ThemeProvider>{story()}</ThemeProvider>)

setDefaults({
  inline: true,
  header: false
})

function loadStories() {
  require('../stories/text.js')
  require('../stories/layout.js')
  require('../stories/forms.js')
  require('../stories/buttons.js')
  require('../stories/icons.js')
  require('../stories/modals.js')

  // You can require as many stories as you need.
}

configure(loadStories, module)
