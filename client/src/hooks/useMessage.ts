import { useState } from 'react'

export interface MessageApi {
  errorMsg: string,
  successMsg: string,
  setErrorMessage: (msg: string) => void,
  setSuccessMessage: (msg: string) => void,
  clearMessages: () => void,
}

export const useMessage = (): MessageApi => {
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  const setErrorMessage = (msg: string) => {
    setErrorMsg(msg)
  }

  const setSuccessMessage = (msg: string) => {
    setSuccessMsg(msg)
  }

  const clearMessages = () => {
    setErrorMsg('')
    setSuccessMsg('')
  }

  return {
    errorMsg,
    successMsg,
    setErrorMessage,
    setSuccessMessage,
    clearMessages,
  }
}
