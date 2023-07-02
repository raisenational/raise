import classNames from 'classnames';
import Link from './Link';

interface Props {
  href?: string,
  target?: React.HTMLAttributeAnchorTarget,
  onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>,
  variant?: 'red' | 'purple' | 'outline' | 'blue' | 'gray',
  size?: 'normal' | 'small' | 'large',
  skew?: boolean,
  className?: string,
  disabled?: boolean,
  children?: React.ReactNode,
}

const Button: React.FC<Props> = ({
  children, href, target, onClick, variant = 'outline', size = 'normal', skew = true, className, disabled, ...other
}) => (
  <Link
    href={href}
    target={target}
    onClick={onClick}
    className={classNames('Button', {
      'bg-raise-red border-raise-red hover:bg-raise-red-light hover:border-raise-red-light focus:bg-raise-red-light focus:border-raise-red-light active:bg-raise-red-dark active:border-raise-red-dark hover:text-gray-200': variant === 'red',
      'bg-raise-purple border-raise-purple hover:bg-raise-purple-light hover:border-raise-purple-light focus:bg-raise-purple-light focus:border-raise-purple-light active:bg-raise-purple-dark active:border-raise-purple-dark hover:text-gray-200': variant === 'purple',
      'border-white hover:text-raise-blue hover:bg-white focus:text-raise-blue focus:bg-white active:bg-opacity-80 active:border-opacity-0': variant === 'outline',
      'bg-raise-blue border-raise-blue hover:bg-raise-blue-light hover:border-raise-blue-light focus:bg-raise-blue-light focus:border-raise-blue-light active:bg-raise-blue-dark active:border-raise-blue-dark hover:text-gray-200': variant === 'blue',
      'bg-gray-400 border-gray-400 hover:text-gray-200': variant === 'gray',
      'px-2 py-0': size === 'small',
      'border-4': size === 'normal',
      'border-4 py-2 px-5 text-[130%]': size === 'large',
      '-skew-x-15': skew,
    }, className)}
    disabled={disabled}
    role="button"
    {...other}
  >
    <span className={classNames('inline-block', { 'skew-x-15': skew })}>{children}</span>
  </Link>
);

export default Button;
