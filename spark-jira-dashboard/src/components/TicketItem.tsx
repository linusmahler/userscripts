import React from "react"
import { BacklogTicketData } from "../types/backlog"

const TicketItem: React.FC<{ ticket: BacklogTicketData }> = ({ ticket }) => (
  <a href={ticket.link} target="_blank" rel="noopener noreferrer">
    <div className="ticketRow1">
      <div className="description">{ticket.description}</div>
    </div>
    <div className="ticketRow2">
      <div className="id">{ticket.id}</div>
      <div className="priority">{ticket.priority}</div>
    </div>
    <div className="ticketRow3">
      <div className="state">
        {ticket.state}
      </div>
    </div>
  </a>
)

export default TicketItem
