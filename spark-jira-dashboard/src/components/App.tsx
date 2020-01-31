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
    <h1>
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
    </h1>
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

