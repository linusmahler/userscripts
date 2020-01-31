import React, { useState, useRef, useEffect, useCallback } from "react"
import { SparkData } from "../types/spark"
import { Ticket } from "../types/ticket"
import Column from "./Column"

type HandlerFn = (event: SparkMessageEvent) => void

interface SparkMessageEvent extends MessageEvent {
  data: SparkData
}

// Usage
const App: React.FC = () => {
  const [data, setData] = useState<SparkData>(null)

  // Event handler utilizing useCallback ...
  // ... so that reference never changes.
  const handler = useCallback<HandlerFn>(
    ({ data }) => {
      console.log("message!!!", data)
      // Update coordinates
      setData(data)
    },
    [setData]
  )

  // Add event listener using our hook
  useEventListener("message", handler)

  return (
    <>
      {!data && <div>Loading...</div>}
      {data && (
        <div
          className="allTicketsColumnsContainer"
          id="allTicketsColumnsContainer"
        >
          <Column title="todoTickets" tickets={data.todoTickets} />
          <Column title="workingTickets" tickets={data.workingTickets} />
          <Column title="blockedTickets" tickets={data.blockedTickets} />
          <Column title="approvedTickets" tickets={data.approvedTickets} />
          <Column
            title="stagedForReleaseTickets"
            tickets={data.stagedForReleaseTickets}
          />
        </div>
      )}
    </>
  )
}

export default App

// Hook
function useEventListener(eventName: string, handler: HandlerFn) {
  // Create a ref that stores handler
  const savedHandler = useRef<HandlerFn>()

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(
    () => {
      // Create event listener that calls handler function stored in ref
      const eventListener = (event: SparkMessageEvent) =>
        savedHandler.current(event)

      // Add event listener
      window.addEventListener(eventName, eventListener)

      // Remove event listener on cleanup
      return () => {
        window.removeEventListener(eventName, eventListener)
      }
    },
    [eventName, window] // Re-run if eventName or element changes
  )
}
/*
window.setTimeout(() => {
  window.postMessage(
    {
      todoTickets: [
        {
          id: "CHG0056630",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=4a1abe57dbe6841026df85294b961933",
          priority: "2 - High",
          version: "SieSmart 2.0",
          description: '"Signaturs on delivery acceptans" for SieSmart 2',
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Open",
          stage: "In Estimation",
          hasPr: true,
        },
        {
          id: "CHG0055486",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=5b54f6dfdb26841026df85294b961977",
          priority: "2 - High",
          version: "SieSmart",
          description: "Signaturs on delivery acceptans",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Open",
          stage: "In Estimation",
          hasPr: true,
        },
        {
          id: "CHG0056366",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=4a1abe57dbe6841026df85294b961935",
          priority: "3 - Medium",
          version: "SieSmart 2.0",
          description:
            'Email validation does not take "null" value into account',
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Open",
          stage: "Assigned",
          hasPr: false,
        },
        {
          id: "CHG0050534",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=5f54f6dfdb26841026df85294b96197b",
          priority: "4 - Low",
          version: "SieSmart",
          description:
            "SieSmart Germany: Legal forms are not in alphabetical order",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Open",
          stage: "In Estimation",
          hasPr: false,
        },
        {
          id: "CHG0056762",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=8a1abe57dbe6841026df85294b961932",
          priority: "5 - Planning",
          version: "SieSmart",
          description:
            "When creating a portfolio report, there should be an option for numbers with decimals",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Open",
          stage: "Assigned",
          hasPr: false,
        },
        {
          id: "CHG0056365",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=0a1abe57dbe6841026df85294b961936",
          priority: "5 - Planning",
          version: "SieSmart 2.0",
          description:
            'An empty quick search applied with "enter" should not create an unexpected error',
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Open",
          stage: "Assigned",
          hasPr: false,
        },
        {
          id: "CHG0055762",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=c61abe57dbe6841026df85294b961938",
          priority: "5 - Planning",
          version: "SieSmart",
          description: "Unsynced BPs prevents Alfa communication",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Open",
          stage: "Assigned",
          hasPr: false,
        },
        {
          id: "CHG0051176",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=9f54f6dfdb26841026df85294b96197a",
          priority: "5 - Planning",
          version: "SieSmart",
          description:
            "Reopening CHG0024293 - Fix to Deal (Upgrade) stuck in Waiting for Backend - PRB0000442",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Open",
          stage: "Assigned",
          hasPr: false,
        },
        {
          id: "PRB0000961",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=c83cbdcbdbae04106c0b25784b961934&sysparm_record_target=problem&sysparm_record_row=6&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description:
            "Error during CreditBureau Search - White spaces are required between publicId and systemId",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Assigned",
          stage: "Unknown",
          hasPr: false,
        },
        {
          id: "PRB0000962",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=8f1d7583dbee04106c0b25784b96190a&sysparm_record_target=problem&sysparm_record_row=7&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description: "query did not return a unique result",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "New",
          stage: "Unknown",
          hasPr: false,
        },
        {
          id: "PRB0000964",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=f6f44603dba244106c0b25784b9619f2&sysparm_record_target=problem&sysparm_record_row=8&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description: 'Could not read JSON: For input string: ""',
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "New",
          stage: "Unknown",
          hasPr: false,
        },
      ],
      workingTickets: [
        {
          id: "CHG0053641",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=df54f6dfdb26841026df85294b961979",
          priority: "5 - Planning",
          version: "SieSmart",
          description: "BP Status - Role",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Approved",
          stage: "Assigned for Processing",
          hasPr: false,
        },
        {
          id: "INC0087171",
          link:
            "https://siemensfs.service-now.com/incident.do?sys_id=cb29fa8bdb390418c83025784b9619d6&sysparm_record_target=incident&sysparm_record_row=1&sysparm_record_rows=1&sysparm_record_list=u_stageNOT+IN70%2C80%2C90%5Ecmdb_ci.nameCONTAINSSieSmart%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYDESCnumber",
          priority: "3 - Medium",
          version: "SieSmart",
          description: "doc not in the task list",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Work in Progress",
          stage: "Open",
          hasPr: false,
        },
        {
          id: "PRB0000442",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=247f0e0ddb1ec300139622915b9619e3&sysparm_record_target=problem&sysparm_record_row=1&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description: "Deal (Upgrade) stuck in Waiting for Backend",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Work In Progress",
          stage: "Unknown",
          hasPr: false,
        },
        {
          id: "PRB0000743",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=61df2b91dbcfe384139622915b961951&sysparm_record_target=problem&sysparm_record_row=2&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "3 - Medium",
          version: "SieSmart",
          description: '"Login of user" Looping',
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Work In Progress",
          stage: "Unknown",
          hasPr: false,
        },
        {
          id: "PRB0000834",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=13c9991ddb9b73807da484084b96190f&sysparm_record_target=problem&sysparm_record_row=3&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description:
            "Error JBWEB000065: HTTP Status 500 - Error on parsing response by Jtidy. ",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Work In Progress",
          stage: "Unknown",
          hasPr: false,
        },
        {
          id: "PRB0000872",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=027250e0db1040d07da484084b9619a1&sysparm_record_target=problem&sysparm_record_row=4&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description:
            "Failures (CALLBACK_FAILED and FAILURE) of ALFA_THIRD_PARTY_BP_RATING messages.",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Work In Progress",
          stage: "Unknown",
          hasPr: false,
        },
        {
          id: "PRB0000928",
          link:
            "https://siemensfs.service-now.com/problem.do?sys_id=f6a5152edbda849c86bf85294b961960&sysparm_record_target=problem&sysparm_record_row=5&sysparm_record_rows=8&sysparm_record_list=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Ecmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORu_cmdb_ciDYNAMIC2877b5c0b408210031ed3f4524ff04aa%5EORsys_idIN%5EORu_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORopened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORwatch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORwork_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.watch_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.opened_by%3Dca00d23cdb6dbf00139622915b96195f%5EORu_asp_parent_change.u_the_requestor%3Dca00d23cdb6dbf00139622915b96195f%5EORparent.work_notes_listCONTAINSca00d23cdb6dbf00139622915b96195f%5EORDERBYnumber",
          priority: "5 - Planning",
          version: "SieSmart",
          description: "FR Argus extract failing",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Work In Progress",
          stage: "Unknown",
          hasPr: false,
        },
      ],
      blockedTickets: [],
      approvedTickets: [
        {
          id: "CHG0056866",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=df5476dfdb26841026df85294b9619d3",
          priority: "2 - High",
          version: "SieSmart",
          description:
            "Rating Method is not sent to Transact in the correct format",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Approved",
          stage: "Assigned for Processing",
          hasPr: true,
        },
        {
          id: "CHG0056367",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=4a1abe57dbe6841026df85294b961934",
          priority: "5 - Planning",
          version: "SieSmart 2.0",
          description: "Add information about bp to logs",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Approved",
          stage: "Assigned for Deployment",
          hasPr: false,
        },
        {
          id: "CHG0056361",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=c61abe57dbe6841026df85294b961937",
          priority: "2 - High",
          version: "SieSmart 2.0",
          description: "Notepad issue",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Approved",
          stage: "Assigned for Processing",
          hasPr: true,
        },
        {
          id: "CHG0055631",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=c61abe57dbe6841026df85294b961939",
          priority: "2 - High",
          version: "SieSmart",
          description: "Unexpected error when accessing MIS  Dashbaord",
          assignedTo: "R L",
          assignedToFullString: "Rickard Lindahl",
          state: "Approved",
          stage: "Developed",
          hasPr: true,
        },
        {
          id: "CHG0055296",
          link:
            "https://siemensfs.service-now.com/change_request.do?sysparm_tiny=5f54f6dfdb26841026df85294b961978",
          priority: "2 - High",
          version: "SieSmart",
          description: "Notepad issue",
          assignedTo: "J F",
          assignedToFullString: "Johan Forssell",
          state: "Approved",
          stage: "Assigned for Deployment",
          hasPr: true,
        },
      ],
      stagedForReleaseTickets: [],
    },
    "*"
  )
}, 1500)
*/