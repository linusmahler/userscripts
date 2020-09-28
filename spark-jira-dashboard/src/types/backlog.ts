export interface BacklogTicketData {
  assignmentGroup: string
  description: string
  id: string
  link: string
  priority: string
  state: string
  type: string
  typeOfStandardChange: string
}

export interface BacklogTicketsData {
  incidents: BacklogTicketData
  grqs: BacklogTicketData
  chgs: BacklogTicketData
  problems: BacklogTicketData
  slas: BacklogTicketData
}
