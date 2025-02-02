import {Link as GatsbyLink} from 'gatsby';
import classNames from 'classnames';

type Props = {
	href?: string;
	target?: React.HTMLAttributeAnchorTarget;
	onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>;
	className?: string;
	disabled?: boolean;
	children?: React.ReactNode;
} & Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'ref'>;

const Link: React.FC<Props> = ({
	children, href, target, onClick, className, disabled, ...anchorProps
}) => {
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	if (disabled || (href === undefined && onClick === undefined)) {
		return (
			<a href={href} onClick={() => false} className={classNames('opacity-40 pointer-events-none', className)} {...anchorProps}>
				{children}
			</a>
		);
	}

	const isInternal = href && /^(\.?\/(?!\/))|(\.\.)/.test(href);

	// Use Gatsby Link for internal links, and <a> for others
	if (isInternal && href) {
		return (
			<GatsbyLink
				to={href}
				onClick={onClick}
				className={classNames('cursor-pointer', className)}
				{...anchorProps}
			>
				{children}
			</GatsbyLink>
		);
	}

	return (
		<a href={href} target={target} rel='noreferrer' onClick={onClick} onKeyDown={onClick
			? (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClick(e);
					e.preventDefault();
				}
			}
			: undefined} tabIndex={0} className={classNames('cursor-pointer', className)} {...anchorProps}>
			{children}
		</a>
	);
};

export default Link;
