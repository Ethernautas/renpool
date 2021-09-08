import React, { FC }  from 'react'
import { Box, Heading } from 'rimble-ui'

export interface Props {
  title: string
}

export const ScreenLayout: FC<Props> = ({ title, children }): JSX.Element =>  (
  <Box>
    <Heading.h3 textAlign="center">{title}</Heading.h3>
    <Box p={3}>
      {children}
    </Box>
  </Box>
)
