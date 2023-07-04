import classNames from 'classnames';

interface Props {
  image?: string | React.ReactNode,
  title: string,
  text: React.ReactNode,
  className?: string,
}

const Panel: React.FC<Props> = ({
  image, title, text, className,
}) => (
  <div className={classNames('shadow-raise rounded px-8 py-8 flex flex-col items-center', className)}>
    {typeof image === 'string' ? <img alt="" src={image} className="mb-4 h-16" /> : image}
    <h3 className="text-5xl font-normal pb-2">{title}</h3>
    <p className="text-xl font-light">{text}</p>
  </div>
);

export default Panel;
