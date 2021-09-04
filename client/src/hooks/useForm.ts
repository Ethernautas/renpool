import { useDisabled } from './useDisabled'
import { useMessage } from './useMessage'

export interface FormApi {
  disabled: boolean,
  errorMsg: string,
  successMsg: string,
  setSuccessMessage: (msg: string) => void,
  clearMessages: () => void,
  handleBefore: (cb?: () => void) => void,
  handleClientCancel: () => void,
  handleClientError: (err?: string) => void,
  handleServerError: (err?: string) => void,
  handleSuccess: (cb?: () => void) => void,
}

export const useForm = (): FormApi => {
  const { disabled, disableBtn, enableBtn } = useDisabled()
  const { errorMsg, successMsg, setErrorMessage, setSuccessMessage, clearMessages } = useMessage()

  const fireCb = (cb?: () => void) => {
    if (cb != null && typeof cb === 'function') { cb() }
  }

  const handleBefore = (cb?: () => void) => {
    disableBtn()
    clearMessages()
    // Allow other components to extend handleBefore default functionality
    fireCb(cb)
  }

  const handleClientCancel = () => {
    enableBtn()
  }

  const handleClientError = (err?: string) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    // console.log(err)
    enableBtn()
  }

  const handleServerError = (err?: string) => {
    // console.log(err)
    setErrorMessage(err)
    enableBtn()
  }

  const handleSuccess = (cb?: () => void) => {
    enableBtn()
    clearMessages()
    // Allow other components to extend handleSuccess default functionality
    fireCb(cb)
  }

  return {
    disabled,
    errorMsg,
    successMsg,
    setSuccessMessage,
    clearMessages,
    handleBefore,
    handleClientCancel,
    handleClientError,
    handleServerError,
    handleSuccess,
  }
}
