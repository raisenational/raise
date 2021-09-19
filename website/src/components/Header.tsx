import * as React from "react"
import { Link } from "gatsby"

import Container from "./Section"

interface HeaderProps {
  title: string,
}

const Header: React.FC<HeaderProps> = ({ title }) => (
  <header>
    <Container>
      <Link to="/">{title}</Link>
    </Container>
  </header>
)

export default Header
