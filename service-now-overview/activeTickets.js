// ==UserScript==
// @name         Active tickets
// @run-at document-start
// @version      1.5.4
// @description  This script will show all active GRQ, PRB, CHG and INC tickets in one board.
// @author       Linus Mähler
// @match        https://siemensfs.service-now.com/interaction_list.do?sysparm_clear_stack=true&sysparm_query=stateNOT%20INclosed_complete%2Cclosed_abandoned%5Eassigned_to%3Djavascript:gs.getUserID()&sysparm_fixed_query=
// ==/UserScript==

(async function main() {
  "use strict";

  documentWriteNecessaryStuff();

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

  const changeTicketsUrl =
    "https://siemensfs.service-now.com/change_request_list.do?sysparm_clear_stack=true&sysparm_query=assignment_groupLIKESieSmart%5Estate%3D0%5EORstate%3D2%5EORstate%3D1%5EORstate%3D105%5EORstate%3D103%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912&sysparm_fixed_query=";
  const grqTicketsUrl =
    "https://siemensfs.service-now.com/u_generic_request_list.do?sysparm_clear_stack=true&sysparm_query=active%3Dtrue%5EstateIN1%2C103%2C4%5Eassignment_groupLIKESieSmart%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912%5EORassigned_to%3Dca00d23cdb6dbf00139622915b96195f&sysparm_fixed_query=";
  const incTicketsUrl =
    "https://siemensfs.service-now.com/incident_list.do?sysparm_fixed_query=&sysparm_query=u_stageNOT%20IN70%2C80%2C90%5Ecmdb_ciLIKESieSmart%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912&sysparm_clear_stack=true";
  const prbTicketsUrl =
    "https://siemensfs.service-now.com/problem_list.do?sysparm_fixed_query=&sysparm_query=active%3Dtrue%5Eassigned_to%3D79732760dbf84c50139622915b9619f7%5EORassigned_to%3Db1b40e2fdb9c4814139622915b961912&sysparm_clear_stack=true";

  const urls = [changeTicketsUrl, grqTicketsUrl, incTicketsUrl, prbTicketsUrl];

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
      renderContent(ticketsByStatus);
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
        todoTickets: tickets
          .filter(
            ticket =>
              ticket.state === "New" ||
              ticket.state === "Open" ||
              ticket.state === "Assigned"
          )
          .sort(compare),
        workingTickets: tickets.filter(
          ticket =>
            ticket.state === "Work in Progress" ||
            ticket.state === "Work In Progress" ||
            (ticket.state === "Approved" &&
              ticket.stage === "Assigned for Processing" &&
              ticket.hasPr === false)
        ),
        blockedTickets: tickets.filter(
          ticket => ticket.state === "Information Requested"
        ),
        approvedTickets: tickets.filter(
          ticket =>
            (ticket.state === "Approved" &&
              ticket.stage !== "Assigned for Processing") ||
            (ticket.state === "Approved" && ticket.hasPr === true)
        ),
        stagedForReleaseTickets: tickets.filter(
          ticket => ticket.state === "Deployed"
        )
      },
      "*"
    );
  }
})();

function renderContent(tickets) {
  renderTicketsForColumn(tickets.todoTickets, "Todo");
  renderTicketsForColumn(tickets.workingTickets, "In progress");
  renderTicketsForColumn(tickets.blockedTickets, "Information Requested");
  renderTicketsForColumn(tickets.approvedTickets, "Waiting for test");
  renderTicketsForColumn(tickets.stagedForReleaseTickets, "In testing");

  drawChart(
    tickets.todoTickets.length,
    tickets.workingTickets.length,
    tickets.blockedTickets.length,
    tickets.approvedTickets.length,
    tickets.stagedForReleaseTickets.length
  );
  window.setTimeout(() => location.reload(), 5 * 60000);

  document.getElementById("loaderContainer").style.cssText = "display: none;";
  document.getElementById("headerContainer").style.cssText = "display: flex;";
  document.body.style.background = "white";
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
    assignedTo: tdElements[6]
      .querySelector("a")
      .text.split(" ")
      .map(n => n[0])
      .join(" "),
    assignedToFullString: tdElements[6].querySelector("a").text,
    state: tdElements[7].textContent || "Unknown",
    stage: tdElements[8].textContent || "Unknown",
    hasPr:
      (tdElements[9] &&
        tdElements[9].title.indexOf(
          "https://code.siemens.com/siesmart/siesmart/merge_requests"
        ) !== -1) ||
      false
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

  const assignedToContainer = document.createElement("div");
  assignedToContainer.className = "assignedToContainer";

  const assignedTo = document.createElement("div");
  assignedTo.className = "assignedTo";
  assignedTo.setAttribute("title", ticket.assignedToFullString);
  assignedTo.innerHTML = ticket.assignedTo;

  assignedToContainer.appendChild(assignedTo);

  ticketRow1Element.appendChild(description);
  ticketRow1Element.appendChild(assignedToContainer);

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
  stateElement.innerHTML = `${ticket.state}${
    ticket.stage.indexOf("Information Requested") === -1 &&
    ticket.stage.indexOf("Deployed") === -1
      ? `&nbsp;|&nbsp;${ticket.stage}`
      : ""
  }`;

  ticketRow3Element.appendChild(versionElement);

  if (ticket.hasPr) {
    const prElement = document.createElement("img");
    prElement.className = "hasPr";
    prElement.src =
      "https://cdn0.iconfinder.com/data/icons/octicons/1024/git-pull-request-512.png";
    ticketRow3Element.appendChild(prElement);
  }

  ticketRow3Element.appendChild(stateElement);

  return ticketRow3Element;
}

function createTicket(ticket) {
  const ticketListElement = document.createElement("li");
  ticketListElement.className = "ticket";
  const aElement = document.createElement("a");
  aElement.href = ticket.link;
  aElement.target = "_blank";
  aElement.rel = "noopener noreferrer";
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

function documentWriteNecessaryStuff() {
  document.write(
    `<html>
        <head>
          <title>Active tickets</title>
          <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans" />
          <script type="text/javascript">
          <link rel="stylesheet" type="text/css" href="https://raw.githubusercontent.com/linusmahler/userscripts/master/service-now-overview/styles.css" />
          </script>
          <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
          <script type="text/javascript">
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);

            function drawChart(todo, active, blocked, testing, deployed) {

              var data = google.visualization.arrayToDataTable([
                ['Task', 'Number of tickets'],
                ['Todo', todo],
                ['In progress', active],
                ['Inf. requested', blocked],
                ['Waiting for test', testing],
                ['In testing', deployed]
              ]);

              var options = {
                title: 'Ticket status overview'
              };

              var chart = new google.visualization.PieChart(document.getElementById('piechart'));
              chart.draw(data, options);
            }
          </script>
        </head>
        <body>
          <div id="loaderContainer" class="loaderContainer"><div class="loader"><div></div><div></div></div></div>
          <div id="summaryContainer">
            <div id="headerContainer" class="headerContainer">
              <img height="201px" src="http://dailynewsdig.com/wp-content/uploads/2014/04/20-A-Team-Show-Facts-That-You-Probably-Never-Knew-1.jpg" />
              <div id="piechart" style="min-width: 400px; height: 201px;"></div>
            </div>
            <div class="allTicketsColumnsContainer" id="allTicketsColumnsContainer"></div>
          </div>
        </body>
      </html>`
  );
}
