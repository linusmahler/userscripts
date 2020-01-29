// ==UserScript==
// @name         Closed tickets
// @version      1.2
// @description  This script will show all closed GRQ, PRB, CHG and INC tickets in one board.
// @author       Linus Mähler
// @match        https://siemensfs.service-now.com/interaction_list.do?sysparm_fixed_query=&sysparm_query=stateNOT%20INclosed_complete%2Cclosed_abandoned%5Eassigned_to%3Djavascript:gs.getUserID()&sysparm_clear_stack=true
// ==/UserScript==


(async function main() {
    "use strict";

    documentWriteNecessaryStuff();
    appendStyleToHead();
  
    async function fetchAndGetDocumentText(url) {
      const response = await fetch(url);
      const document = await response.text();
  
      return document;
    }
  
    function createIframeWithSrcDocUrl(url) {
      const iframe = document.createElement("iframe");
      iframe.srcdoc = url;
      iframe.style.cssText = "display: none;";
  
      return iframe;
    }
  
    const allTicketsUrl =
      "https://siemensfs.service-now.com/task_list.do?sysparm_view=itil_homepage5&sysparm_fixed_query=&sysparm_query=cmdb_ciLIKESieSmart%5Eactive%3Dfalse%5Esys_class_name%3Dchange_task%5EORsys_class_name%3Dchange_request%5EORsys_class_name%3Dincident%5EORsys_class_name%3Dproblem%5EORsys_class_name%3Du_generic_request%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5Eassignment_groupLIKEApplication%20Developer&sysparm_clear_stack=true";
  
    const urls = [allTicketsUrl];
  
    const documents = await Promise.all(
      urls.map(url => fetchAndGetDocumentText(url))
    );
  
    const iframes = documents.map(document =>
      createIframeWithSrcDocUrl(document)
    );
    iframes.forEach(iframe => {
      document.body.appendChild(iframe);
    });
  
    window.setTimeout(() => {
      iframes.forEach(iframe => {
        extractTicketsFromIframe(iframe);
      });
    }, 1000);
  
    let ticketsByType = {
      incidents: [],
      grqs: [],
      changes: [],
      problems: [],
    };
  
    let msgCount = 0;
  
    window.addEventListener("message", e => {
      ticketsByType = {
        incidents: [...ticketsByType.incidents, ...e.data.incidents],
        grqs: [
          ...ticketsByType.grqs,
          ...e.data.grqs
        ],
        changes: [
          ...ticketsByType.changes,
          ...e.data.changes
        ],
        problems: [
          ...ticketsByType.problems,
          ...e.data.problems
        ],
      };
  
      msgCount += 1;
      if (msgCount === 1) {
        renderContent(ticketsByType);
      }
    });
  
    function extractTicketsFromIframe(iframe) {
      const serviceNowTicketTable = iframe.contentWindow.document.querySelectorAll(
        "table"
      )[1];
  
      if (!serviceNowTicketTable || serviceNowTicketTable.length > 0) {
          console.log('Nothing found!');
        return;
      }
  
      const rows =
        Array.prototype.slice
          .call(serviceNowTicketTable.querySelectorAll("tr"))
          .slice(2) || [];
  
      if (rows[0].querySelectorAll("td").length === 1) {
        window.top.postMessage(
          {
            incidents: [],
            grqs: [],
            changes: [],
            problems: [],
          },
          "*"
        );
        return;
      }
  
      const tickets = rows.map(row => extractTicketDataFromRow(row));
  
      console.log(tickets);
      window.top.postMessage(
        {
          incidents: tickets
            .filter(
              ticket =>
                ticket.type === "Incident"
            )
            .sort(compare),
          grqs: tickets.filter(
            ticket =>
              ticket.type === "Generic Service Request"
          ),
          changes: tickets.filter(
            ticket => ticket.type === "Change Request"
          ),
          problems: tickets.filter(
            ticket =>
              ticket.state === "Problem" 
          ),
        },
        "*"
      );
    }
  })();
  
  function renderContent(tickets) {
    renderTicketsForColumn(
      tickets.incidents,
      `Incidents (${tickets.incidents.length})`
    );
  
    renderTicketsForColumn(
      tickets.grqs,
      `GRQs (${tickets.grqs.length})`
    );
  
    renderTicketsForColumn(
      tickets.changes,
      `Changes (${tickets.changes.length})`
    );
  
    renderTicketsForColumn(
      tickets.problems,
      `Problems (${tickets.problems.length})`
    );

  
    window.setTimeout(() => location.reload(), 5 * 60000);
  
    document.getElementById("loaderContainer").style.cssText = "display: none;";
    document.body.style.background = 'white';
  }
  
  function extractTicketDataFromRow(row) {
    const tdElements = row.querySelectorAll("td");
    const idLink = tdElements[2].querySelector("a");
  
    console.log(row);
    return {
      id: idLink.text || "No id",
      link: idLink.href || "No link",
      priority: tdElements[3].textContent || "Not set",
      version: tdElements[4].querySelector("a").text || "Not set",
      description: tdElements[5].textContent || "No description set",
      assignedTo:
        tdElements[6].querySelector("a").text === "Rickard Lindahl"
          ? "https://realsprint.com/assets/images/people/rickard_lindahl.c95e321b.jpg"
          : "https://realsprint.com/assets/images/people/johan_forssell_2.c9d34746.jpg",
      type: tdElements[7].textContent || "Unknown",
      closed: tdElements[8].textContent || "Unknown",
    };
  }
  
  function createHeadingElement(text, level) {
    const headingElement = document.createElement(level || "h1");
    headingElement.innerHTML = text;
  
    return headingElement;
  }
  
  function compare(a, b) {
    if (a.priority < b.priority) {
      return -1;
    }
  
    if (a.priority > b.priority) {
      return 1;
    }
  
    return 0;
  }
  
  function createTicketColumnHeader(title) {
    const ticketColumnHeader = document.createElement("li");
    ticketColumnHeader.className = "ticketHeader";
    ticketColumnHeader.innerHTML = title;
  
    return ticketColumnHeader;
  }
  
  function createTicketRow1Element(ticket) {
    const ticketRow1Element = document.createElement("div");
    ticketRow1Element.className = "ticketRow1";
  
    const description = document.createElement("div");
    description.className = "description";
    description.innerHTML = ticket.description;
  
    const imageContainer = document.createElement("div");
    imageContainer.className = "imageContainer";
  
    const image = document.createElement("img");
    image.className = "image";
    image.src = ticket.assignedTo;
  
    imageContainer.appendChild(image);
  
    ticketRow1Element.appendChild(description);
    ticketRow1Element.appendChild(imageContainer);
  
    return ticketRow1Element;
  }
  
  function createTicketRow2Element(ticket) {
    const ticketRow2Element = document.createElement("div");
    ticketRow2Element.className = "ticketRow2";
  
    const idElement = document.createElement("div");
    idElement.className = "id";
    idElement.innerHTML = ticket.id;

    const priorityElement = document.createElement("div");
    priorityElement.className = "priority";
    priorityElement.innerHTML = ticket.priority;
  
    ticketRow2Element.appendChild(idElement);
    ticketRow2Element.appendChild(priorityElement);
  
    return ticketRow2Element;
  }

  function createTicketRow3Element(ticket) {
    const ticketRow3Element = document.createElement("div");
    ticketRow3Element.className = "ticketRow3";
  
    const closedElement = document.createElement("div");
    closedElement.className = "closed";
    const datetimePattern = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
    closedElement.innerHTML = `Closed: ${datetimePattern.exec(ticket.closed)[0]}`;

    const versionElement = document.createElement("div");
    versionElement.className = "version";
    versionElement.innerHTML = ticket.version;
  
    ticketRow3Element.appendChild(closedElement);
    ticketRow3Element.appendChild(versionElement);
  
    return ticketRow3Element;
  }
  
  function createTicket(ticket) {
    const ticketListElement = document.createElement("li");
    ticketListElement.className = "ticket";
    const aElement = document.createElement("a");
    aElement.href = ticket.link;
    aElement.target = '_blank';
    aElement.rel = "noopener noreferrer"
    ticketListElement.appendChild(aElement);
  
    ticketListElement.style.cssText =
      ticket.priority.substring(0, 1) <= 3 ? "border-left: 3px solid red" : "";
  
    aElement.appendChild(createTicketRow1Element(ticket));
    aElement.appendChild(createTicketRow2Element(ticket));
    aElement.appendChild(createTicketRow3Element(ticket));
  
    return ticketListElement;
  }
  
  function renderTicketsForColumn(ticketColumn, title) {
    const ticketColumnsContainer = document.createElement("ul");
    ticketColumnsContainer.className = "ticketColumnsContainer";
  
    ticketColumnsContainer.appendChild(createTicketColumnHeader(title));
  
    ticketColumn.forEach(ticket => {
      ticketColumnsContainer.appendChild(createTicket(ticket));
    });
  
    document
      .getElementById("allTicketsColumnsContainer")
      .appendChild(ticketColumnsContainer);
  }
  
  function appendStyleToHead() {
    document.head.insertAdjacentHTML(
      "beforeend",
      `<style>
        body {
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
          color: #212529;
          margin: 0;
          padding: 0;
          background: black;
        }
  
        a {
          text-decoration: none !important;
          color: inherit;
        }
  
        .loaderContainer {
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          background: white;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          z-index: 2;
     
        }
  
        .loaderContainer::after {
          position: absolute;
          content: "💰💲💴💵💸";
          bottom: 20%;
          color: white;
          font-family: Open Sans;
          font-size: 40px;
        }
  
        .loaderContainer::before {
          position: absolute;
          content: "🤑😻👛🥇💎";
          top: 20%;
          color: white;
          font-family: Open Sans;
          font-size: 40px;
        }
  
        .ticket {
          transition: 0.2s ease;
          padding: 8px;
          margin-bottom: 4px;
          background: white;
          border: 0.75px solid #dadada;
          box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.05);
        }
  
        .ticket:hover {
          box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.6);
          cursor: pointer;
        }
  
        .allTicketsColumnsContainer {
          display: flex;
          padding: 32px;
          justify-content: space-between;
        }
  
        .allTicketsColumnsContainer ul:last-child {
          margin-right: 0;
        }
  
        .ticketColumnsContainer {
          list-style-type: none;
          margin: 0 16px 0 0;
          min-width: calc(20% - 32px);
          max-width: calc(20% - 32px);
          padding: 8px;
          background: #f5f5f5;
        }
  
        .ticketColumnsContainer > div:last-child {
          margin-right: 0;
        }
  
        .ticketHeader {
          font-family: Open Sans;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
          border-bottom: 4px solid grey;
        }
  
        .ticketRow1 {
          display: flex;
          flex-direction: row;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 0.75px solid #f8f8f8;
        }
  
        .ticketRow2 {
          display: flex;
          color: #808080;
          font-size: 12px;
        }
  
        .id {
          margin-right: auto;
        }
  
        .hasPr {
          height: 16px;
          width: 16px;
          margin-right: 4px;
        }
  
        .priority {
          user-select: none;
        }
  
        .ticketRow3 {
          display: flex;
          color: #808080;
          font-size: 12px;
        }
  
        .closed {
          margin-right: auto;
        }
  
        .description {
          margin-bottom: 8px;
          padding-right: 8px;
          word-break: break-word;
        }
  
        .imageContainer {
          user-select: none;
          min-width: 50px;
          width: 50px;
          height: 50px;
          position: relative;
          overflow: hidden;
          border-radius: 50%;
          margin: 0 0 0 auto;
        }
  
        .image {
          height: 115%;
          width: 115%;
          object-fit: cover;
        }
  
        div {
          font-family: Open Sans;
        }
  
        h1 {
          font-family: "Open Sans"; font-size: 24px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 26.4px;
        }
  
        h3 {
          font-family: "Open Sans"; font-size: 14px; font-style: normal; font-variant: normal; font-weight: 700; line-height: 15.4px;
        }
      </style>`
    );
  }
  
  function documentWriteNecessaryStuff() {
    document.write(
      `<html>
          <head>
            <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />
          </head>
          <body>
            <div id="loaderContainer" class="loaderContainer"><div class="loader"><div></div><div></div></div></div>
            <div id="summaryContainer"><div class="allTicketsColumnsContainer" id="allTicketsColumnsContainer"></div></div>
          </body>
        </html>`
    );
  }
  