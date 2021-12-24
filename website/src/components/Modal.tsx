import * as React from "react"
import { DialogOverlay, DialogContent } from "@reach/dialog"
import classNames from "classnames"
import { XIcon } from "@heroicons/react/outline"

interface Props {
  open: boolean,
  onClose: () => void,
}

const Modal: React.FC<Props> = ({ open, onClose, children }) => (
  <DialogOverlay
    className="fixed inset-0 bg-black bg-opacity-80 z-0"
    isOpen={open}
    onDismiss={onClose}
  >
    <DialogContent className={classNames("SectionNoPadding Section p-8 my-16 bg-white rounded shadow relative overflow-auto", { "pr-8": typeof window !== "undefined" && document.getElementsByTagName("html")[0].scrollHeight > document.getElementsByTagName("html")[0].clientHeight })}>
      <XIcon onClick={onClose} className="w-8 h-8 sm:w-12 sm:h-12 absolute right-8 cursor-pointer" />
      {children}
    </DialogContent>
  </DialogOverlay>
)

export default Modal
