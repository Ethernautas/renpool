import React, { FC } from 'react'
import { Link } from 'rimble-ui'
import { linkTheme } from '../../theme'

export interface NavLinkProps {
  disabled?: boolean
  onClick?: () => void
  label?: string
}

export const NavLink: FC<NavLinkProps> = ({
  disabled = false,
  onClick = () => null,
  label = '',
}): JSX.Element => (
  <Link
    href=""
    {...linkTheme}
    disabled={disabled}
    onClick={(e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      onClick()
    }}
  >
    {label}
  </Link>
)

