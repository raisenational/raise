import * as React from "react"

interface Props {
  icon: string,
  alt: string,
  to: string,
}

const SocialIcon: React.FC<Props> = ({ icon, alt, to }) => (
  <a href={to}>
    <img alt={alt} src={icon} width={36} />
  </a>
)

export default SocialIcon
