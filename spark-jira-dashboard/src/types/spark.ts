import { Ticket } from "./ticket";

export interface SparkData {
    todoTickets: Ticket[];
    workingTickets: Ticket[];
    blockedTickets: Ticket[];
    approvedTickets: Ticket[];
    stagedForReleaseTickets: Ticket[];
}
