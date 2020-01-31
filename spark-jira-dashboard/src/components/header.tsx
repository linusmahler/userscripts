import React from "react"

import Image from "./image";

const Header: React.FC<{ siteTitle?: string }> = ({ siteTitle = `` }) => (
  <header
    style={{
      background: `rebeccapurple`,
      marginBottom: `1.45rem`,
    }}
  >
      <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
        <Image />
        <h1>{siteTitle}</h1>
      </div>
  </header>
)

export default Header
