import { useState } from 'react'

export interface DisabledApi {
  disabled: boolean,
  disableBtn: () => void,
  enableBtn: () => void,
}

export const useDisabled = (): DisabledApi => {
  const [disabled, setDisabled] = useState<boolean>(false)

  const disableBtn = () => {
    setDisabled(true)
  }

  const enableBtn = () => {
    setDisabled(false)
  }

  return {
    disabled,
    disableBtn,
    enableBtn,
  }
}

