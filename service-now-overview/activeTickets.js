// ==UserScript==
// @name         Active tickets
// @version      0.1
// @description  This script will show all ACTIVE tickets.
// @author       Linus Mähler
// @match        https://siemensfs.service-now.com/interaction_list.do?sysparm_clear_stack=true&sysparm_query=stateNOT%20INclosed_complete%2Cclosed_abandoned%5Eassigned_to%3Djavascript:gs.getUserID()&sysparm_fixed_query=
// ==/UserScript==

(async function main() {
    "use strict";
  
    async function fetchAndGetDocumentText(url) {
      const response = await fetch(url);
      const document = await response.text();
  
      return document;
    }
  
    function createIframeWithSrcDocUrl(url) {
      const iframe = document.createElement("iframe");
      iframe.srcdoc = url;
  
      return iframe;
    }
  
    const changeTicketsUrl =
      "https://siemensfs.service-now.com/change_request_list.do?sysparm_clear_stack=true&sysparm_query=assignment_groupLIKESieSmart%5Estate%3D0%5EORstate%3D2%5EORstate%3D1%5EORstate%3D105%5EORstate%3D103%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912&sysparm_fixed_query=";
    const grqTicketsUrl =
      "https://siemensfs.service-now.com/u_generic_request_list.do?sysparm_clear_stack=true&sysparm_query=active%3Dtrue%5EstateIN1%2C103%2C4%5Eassignment_groupLIKESieSmart%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5EORassigned_to%3Dca00d23cdb6dbf00139622915b96195f&sysparm_fixed_query=";
    const incTicketsUrl =
      "https://siemensfs.service-now.com/incident_list.do?sysparm_fixed_query=&sysparm_query=u_stageNOT%20IN70%2C80%2C90%5Ecmdb_ciLIKESieSmart%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912&sysparm_clear_stack=true";
    const prbTicketsUrl =
      "https://siemensfs.service-now.com/problem_list.do?sysparm_fixed_query=&sysparm_query=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912&sysparm_clear_stack=true";
  
    const urls = [changeTicketsUrl, grqTicketsUrl, incTicketsUrl, prbTicketsUrl];
  
    const documents = await Promise.all(urls.map(url => fetchAndGetDocumentText(url)));
  
    const iframes = documents.map(document => createIframeWithSrcDocUrl(document));
    iframes.forEach(iframe => {
      document.body.appendChild(iframe);
    });
  
    window.setTimeout(() => {
      iframes.forEach(iframe => {
          extractTicketsFromIframe(iframe);
      });
    }, 1000);
  
    let ticketsByStatus = {
      todoTickets: [],
      workingTickets: [],
      blockedTickets: [],
      approvedTickets: [],
      stagedForReleaseTickets: []
    };
  
    let msgCount = 0;
  
    window.addEventListener("message", e => {
      ticketsByStatus = {
        todoTickets: [...ticketsByStatus.todoTickets, ...e.data.todoTickets],
        workingTickets: [
          ...ticketsByStatus.workingTickets,
          ...e.data.workingTickets
        ],
        blockedTickets: [
          ...ticketsByStatus.blockedTickets,
          ...e.data.blockedTickets
        ],
        approvedTickets: [
          ...ticketsByStatus.approvedTickets,
          ...e.data.approvedTickets
        ],
        stagedForReleaseTickets: [
          ...ticketsByStatus.stagedForReleaseTickets,
          ...e.data.stagedForReleaseTickets
        ]
      };
  
      msgCount += 1;
      if (msgCount === 4) {
        renderShit(ticketsByStatus);
        appendStyleToHead();
      }
    });
  
    function extractTicketsFromIframe(iframe) {
      const serviceNowTicketTable = iframe.contentWindow.document.querySelectorAll(
        "table"
      )[1];
  
      if (!serviceNowTicketTable || serviceNowTicketTable.length > 0) {
        return;
      }
  
      const rows =
        Array.prototype.slice
          .call(serviceNowTicketTable.querySelectorAll("tr"))
          .slice(2) || [];
  
      if (rows[0].querySelectorAll("td").length === 1) {
        window.top.postMessage(
          {
            todoTickets: [],
            workingTickets: [],
            blockedTickets: [],
            approvedTickets: [],
            stagedForReleaseTickets: []
          },
          "*"
        );
        return;
      }
  
      const tickets = rows.map(row => extractTicketDataFromRow(row));
  
      window.top.postMessage(
        {
          todoTickets: tickets.filter(
            ticket =>
              ticket.state === "New" ||
              ticket.state === "Open" ||
              ticket.state === "Assigned"
          ).sort(compare),
          workingTickets: tickets.filter(
            ticket =>
              ticket.state === "Work in Progress" ||
              ticket.state === "Work In Progress" ||
              (ticket.state === "Approved" &&
                ticket.stage === "Assigned for Processing" && ticket.hasPr === false)
          ),
          blockedTickets: tickets.filter(
            ticket => ticket.state === "Information Requested"
          ),
          approvedTickets: tickets.filter(
            ticket =>
              ticket.state === "Approved" &&
              ticket.stage !== "Assigned for Processing" || (ticket.state === 'Approved' && ticket.hasPr === true)
          ),
          stagedForReleaseTickets: tickets.filter(
            ticket => ticket.state === "Deployed"
          )
        },
        "*"
      );
    }
  })();
  
  function renderShit(tickets) {
    const summaryContainerId = "summaryContainer";
  
    document.write(
      `<html>
      <head>
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
          google.charts.load('current', {'packages':['corechart']});
          google.charts.setOnLoadCallback(drawChart);
  
          function drawChart(todo, working, blocked, approved, staged) {
  
            var data = google.visualization.arrayToDataTable([
              ['Type', 'Number'],
              ['TODO', todo],
              ['In progress', working],
              ['Inf. req.',  blocked],
              ['To test', approved],
              ['Testing', staged]
            ]);
  
            var options = {
              title: 'Overview of ticket status'
            };
  
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
  
            chart.draw(data, options);
          }
        </script>
      </head>
      <body>
        <h1>Uppdaterad ${new Date().toLocaleString("sv-SE")}</h1>
        <div id="${summaryContainerId}"><div class="allTicketsColumnsContainer" id="allTicketsColumnsContainer"></div></div>
        <div id="piechart" style="width: 900px; height: 500px;"></div>
      </body>
    </html>`
    );
  
    renderTicketsForColumn(
      tickets.todoTickets,
      `Todo (${tickets.todoTickets.length})`
    );
  
    renderTicketsForColumn(
      tickets.workingTickets,
      `In progress (${tickets.workingTickets.length})`
    );
  
    renderTicketsForColumn(
      tickets.blockedTickets,
      `Information Requested (${tickets.blockedTickets.length})`
    );
  
    renderTicketsForColumn(
      tickets.approvedTickets,
      `Waiting for test (${tickets.approvedTickets.length})`
    );
  
    renderTicketsForColumn(
      tickets.stagedForReleaseTickets,
      `In testing (${tickets.stagedForReleaseTickets.length})`
    );
  
    window.setTimeout(() => drawChart(tickets.todoTickets.length, tickets.workingTickets.length, tickets.blockedTickets.length, tickets.approvedTickets.length, tickets.stagedForReleaseTickets.length), 2000);
    window.setTimeout(() => location.reload(), 60000)
  }
  
  function extractTicketDataFromRow(row) {
    const tdElements = row.querySelectorAll("td");
    const idLink = tdElements[2].querySelector("a");
  
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
      state: tdElements[7].textContent || "Unknown",
      stage: tdElements[8].textContent || "Unknown",
      hasPr: tdElements[9] && tdElements[9].title.indexOf('https://code.siemens.com/siesmart/siesmart/merge_requests') !== -1 || false
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
  
    const versionElement = document.createElement("div");
    versionElement.className = "version";
    versionElement.innerHTML = ticket.version;
  
    const stateElement = document.createElement("div");
    stateElement.className = "state";
    stateElement.innerHTML = `${ticket.state}&nbsp;|&nbsp;${ticket.stage}`;
  
    ticketRow3Element.appendChild(versionElement);
  
    if(ticket.hasPr) {
      const prElement = document.createElement("img");
      prElement.className = "hasPr";
      prElement.src = 'https://cdn0.iconfinder.com/data/icons/octicons/1024/git-pull-request-512.png';
      ticketRow3Element.appendChild(prElement);
    }
  
    ticketRow3Element.appendChild(stateElement);
  
    return ticketRow3Element;
  }
  
  function createTicket(ticket) {
    const ticketListElement = document.createElement("li");
  
    ticketListElement.className = "ticket";
  
    ticketListElement.addEventListener(
      "click",
      () => window.open(ticket.link),
      false
    );
  
    ticketListElement.style.cssText =
      ticket.priority.substring(0, 1) <= 3 ? "border-left: 3px solid red" : "";
  
    ticketListElement.appendChild(createTicketRow1Element(ticket));
    ticketListElement.appendChild(createTicketRow2Element(ticket));
    ticketListElement.appendChild(createTicketRow3Element(ticket));
  
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
        transform: scale(1.03);
        box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.6);
        cursor: pointer;
      }
  
      .allTicketsColumnsContainer {
        display: flex;
        margin-top: 32px;
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
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
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
        color: #a9a9a9;
        font-size: 12px;
      }
  
      .id {
        margin-right: auto;
      }
  
      .hasPr {
        height: 12px;
        width: 12px;
        margin-right: 4px;
      }
  
      .priority {
        user-select: none;
      }
  
      .ticketRow3 {
        display: flex;
        color: #a9a9a9;
        font-size: 10px;
      }
  
      .version {
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
    </style>`
    );
  }
  