import classNames from 'classnames';

interface Props {
  action: string,
  className?: string,
}

const ContactForm: React.FC<Props> = ({ action, className }) => (
  <form className={classNames(className, 'max-w-xl mx-auto')} id="contact-form" action={action} method="post">
    <ContactField type="text" name="name" id="contact-name" label="Name" />
    <ContactField type="email" name="_replyto" id="contact-email" label="Email" />
    <ContactField type="textarea" name="message" id="contact-message" label="Message" />
    <button className="text-2xl sm:text-4xl font-raise-header font-black mt-4" type="submit" value="Send" id="contact-button">Submit</button>
  </form>
);

const ContactField: React.FC<{ label: string, type: string, name: string, id: string }> = ({
  label, type, name, id,
}) => (
  <div className="border-4 border-white p-2 relative mb-4 rounded">
    <label htmlFor={id} className="absolute bg-raise-blue -top-3 left-8 px-2 font-black text-xl leading-none">{label}</label>
    {type === 'textarea'
      ? <textarea name={name} rows={6} id={id} required className="bg-transparent w-full h-full resize-none border-none focus:bg-black focus:bg-opacity-10 p-2 rounded focus:outline-none -mb-2" />
      : <input type={type} name={name} id={id} required className="bg-transparent w-full h-full resize-none border-none focus:bg-black focus:bg-opacity-10 p-2 rounded focus:outline-none" />}
  </div>
);

export default ContactForm;
