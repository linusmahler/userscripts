import React from "react"
import { Ticket } from "../types/ticket"
import TicketItem from "./TicketItem";

interface ColumnProps {
  title: string
  tickets: Ticket[]
}

const Column: React.FC<ColumnProps> = ({ title, tickets }) => (
  <ul className="ticketColumnsContainer">
    <li className="ticketHeader">{title}</li>
    {tickets.map(ticket => (
      <li
        key={ticket.id}
        className="ticket"
        style={
          Number(ticket.priority.substring(0, 1)) <= 3
            ? { borderLeft: "3px solid red" }
            : undefined
        }
      >
        <TicketItem ticket={ticket} />
      </li>
    ))}
  </ul>
)

export default Column;
