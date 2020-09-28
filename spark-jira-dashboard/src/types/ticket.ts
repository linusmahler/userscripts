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

export interface Ticket {
  id: string
  link: string
  priority: string
  version: string
  description: string
  assignedTo: string
  assignedToFullString: string
  state: string
  stage: string
  hasPr: boolean
}
