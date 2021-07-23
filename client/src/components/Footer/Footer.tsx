import React from 'react'
import { Flex, Image } from 'rimble-ui'

export const Footer = (): JSX.Element => (
  <Flex
    justifyContent="center"
    alignItems="center"
    p={3}
    style={{ height: '100%' }}
  >
    <a target="blank" href="https://github.com/Ethernautas/renpool">
      <Image src="./github.png" alt="github logo" />
    </a>
  </Flex>
)


