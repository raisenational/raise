import { DialogOverlay, DialogContent } from '@reach/dialog';
import classNames from 'classnames';
import { XIcon } from '@heroicons/react/outline';

interface Props {
  open: boolean,
  onClose: () => void,
  className?: string,
}

const Modal: React.FC<React.PropsWithChildren<Props>> = ({
  open, onClose, children, className,
}) => (
  <DialogOverlay
    className="fixed inset-0 bg-black bg-opacity-80 z-0 overflow-auto"
    isOpen={open}
    onDismiss={onClose}
  >
    <DialogContent className={classNames(className, 'SectionNoPadding Section bg-white min-h-screen md:min-h-0 p-8 md:my-16 md:rounded shadow relative', { 'pr-8': typeof window !== 'undefined' && document.getElementsByTagName('html')[0].scrollHeight > document.getElementsByTagName('html')[0].clientHeight })} aria-label="Dialog">
      <XIcon onClick={onClose} className="w-8 h-8 sm:w-12 sm:h-12 absolute right-8 cursor-pointer" />
      {children}
    </DialogContent>
  </DialogOverlay>
);

export default Modal;
