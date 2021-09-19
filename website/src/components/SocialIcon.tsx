import * as React from "react"

interface Props {
  icon: string,
  alt: string,
  href: string,
}

const SocialIcon: React.FC<Props> = ({ icon, alt, href }) => (
  <a href={href}>
    <img alt={alt} src={icon} width={36} />
  </a>
)

export default SocialIcon
