import React, { FC }  from 'react'
import { Box, Heading } from 'rimble-ui'

export interface Props {
  title: string
}

export const SectionLayout: FC<Props> = ({ title, children }): JSX.Element =>  (
  <Box>
    <Box px={3}>
      <Heading.h4>{title}</Heading.h4>
    </Box>
    <Box p={3} py={1}>
      {children}
    </Box>
  </Box>
)
