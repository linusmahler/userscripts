import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import App from "../components/App"
import Column from "../components/Column"
import { BacklogTicketsData } from "../types/backlog"

const BacklogPage: React.FC = () => (
  <Layout>
    <SEO title="Backlog" />
    <App<BacklogTicketsData>
      renderData={data => (console.log(data),
        <div
          className="allTicketsColumnsContainer"
          id="allTicketsColumnsContainer"
        >
          <Column title="INC" tickets={data.incidents} />
          <Column title="GRQ" tickets={data.grqs} />
          <Column title="CHG" tickets={data.chgs} />
          <Column title="PRB" tickets={data.problems} />
        </div>
      )}
    />
  </Layout>
)

export default BacklogPage
