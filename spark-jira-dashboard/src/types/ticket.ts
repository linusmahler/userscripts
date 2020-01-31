export interface Ticket {
    id: string;
    link: string;
    priority: string;
    version: string;
    description: string;
    assignedTo: string;
    assignedToFullString: string;
    state: string;
    stage: string;
    hasPr: boolean;
}
