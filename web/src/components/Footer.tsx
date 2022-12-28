import { withAssetPrefix } from "gatsby"
import * as React from "react"
import Link from "./Link"

const Footer: React.FC = () => (
  <footer className="mt-8 py-4 text-xl">
    <Link href={withAssetPrefix("/privacy/")}>Privacy policy</Link>
  </footer>
)

export default Footer
