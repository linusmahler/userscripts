import React from "react"
import { Ticket } from "../types/ticket"

const TicketItem: React.FC<{ ticket: Ticket }> = ({ ticket }) => (
  <a href={ticket.link} target="_blank" rel="noopener noreferrer">
    <div className="ticketRow1">
      <div className="description">{ticket.description}</div>
      <div className="assignedToContainer">
        <div title={ticket.assignedToFullString}>{ticket.assignedTo}</div>
      </div>
    </div>
    <div className="ticketRow2">
      <div className="id">{ticket.id}</div>
      <div className="priority">{ticket.priority}</div>
    </div>
    <div className="ticketRow3">
      <div className="version">{ticket.version}</div>
      <div className="state">
        {ticket.state}
        {ticket.stage.indexOf("Information Requested") === -1 &&
        ticket.stage.indexOf("Deployed") === -1
          ? `&nbsp;|&nbsp;${ticket.stage}`
          : ""}
      </div>
      {ticket.hasPr && (
        <img
          className="hasPr"
          src="https://cdn0.iconfinder.com/data/icons/octicons/1024/git-pull-request-512.png"
        />
      )}
    </div>
  </a>
)

export default TicketItem
