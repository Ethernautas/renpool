import { theme as rimbleTheme } from 'rimble-ui'

export const theme = Object.assign({}, rimbleTheme, {
  colors: {
    ...rimbleTheme.colors, // keeps existing colors
    primary: '#3385ff' // sets primary color
  },
})

export const linkTheme = {
  fontWeight: 400,
  fontSize: 16,
}
