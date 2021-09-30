import * as React from "react"
import { Dialog } from "@headlessui/react"
import classNames from "classnames"

import Section from "./Section"

interface Props {
  open: boolean,
  onClose: () => void,
}

const Modal: React.FC<Props> = ({ open, onClose, children }) => {
  const ref = React.createRef<HTMLElement>()

  // Hack so that HMR works properly
  if ("reactHotLoaderGlobal" in window && !open) return null

  return (
    <Dialog
      as="div"
      className={classNames("fixed inset-0 overflow-y-auto mx-4", { "mr-8": document.getElementsByTagName("html")[0].scrollHeight > document.getElementsByTagName("html")[0].clientHeight })}
      open={open}
      onClose={onClose}
      initialFocus={ref}
    >
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80 z-0" />

      <Section ref={ref} className="p-8 my-16 bg-white rounded shadow relative z-10 overflow-auto">
        {children}
      </Section>
    </Dialog>
  )
}

export default Modal
