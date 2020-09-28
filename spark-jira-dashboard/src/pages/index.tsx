import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import App from "../components/App"
import { BacklogTicketsData } from "../types/backlog"

const IndexPage: React.FC = () => (
  <Layout>
    <SEO title="Home" />
    <App<BacklogTicketsData> renderData={data => <div>I has data</div>} />
  </Layout>
)

export default IndexPage
