document.addEventListener('DOMContentLoaded', () => {

  // Element references
  const filterBySelect = document.getElementById("filter-by");
  const filterOptionSelect = document.getElementById("filter-option");
  const searchForm = document.getElementById("search-form");
  const filterForm = document.getElementById("filter-form");
  const eventsContainer = document.getElementById("events-content-container");
  
  // Table and Pagination elements
  const tableBody = document.getElementById("events-table-body");
  const pageSizeSelect = document.getElementById("page-size-select");
  const totalEventsInfo = document.getElementById("total-events-info");
  const pageInfo = document.getElementById("page-info");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");

  let state = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalEvents: 0
  };

  const performSearch = async () => {

    const searchInput = document.getElementById("search_query").value;
    const filterBy = filterBySelect.value;
    const filterOption = filterOptionSelect.value;

    const params = new URLSearchParams();
    params.append('page', state.currentPage);
    params.append('limit', state.pageSize);
    
    if (searchInput) params.append('search_query', searchInput);
    if (filterBy && filterOption) {
      params.append('filter_by', filterBy);
      params.append('filter_option', filterOption);
    }

    tableBody.innerHTML = '<tr><td colspan="7">Loading events...</td></tr>';

    try {
      console.log(` Fetching here: /api/events/search?${params.toString()}` )
      const res = await fetch(`/api/events/search?${params.toString()}`);
      if (!res.ok) throw new Error('Network response was not ok');
      
      const { events, pagination } = await res.json();
    
      state = { ...state, ...pagination };
      
      renderTable(events);
      renderPaginationControls();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("Failed to fetch events:", err);
      tableBody.innerHTML = '<tr><td colspan="7">Error loading events. Please try again.</td></tr>';
    }
  };

  const renderTable = (events) => {
    if (!events || events.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7">No events found matching your criteria.</td></tr>';
      return;
    }

    const tableHtml = events.map(event => `
      <tr>
        <td>${event.title}</td>
        <td>${event.sport?.name || "—"}</td>
        <td>${event.location}</td>
        <td>${event.formattedDate}</td>
        <td>${event.formattedTime}</td>
        <td>${event.slotsRemainingText}</td>
        <td class="table-actions">
            <a href="/events/${event._id}" class="table-action-btn" title="View Details">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </a>
            <button class="table-action-btn save-btn" data-id="${event._id}" title="Save Event">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
            <button class="table-action-btn join-btn" data-id="${event._id}" title="Join Event">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
      </td>
      </tr>
    `).join('');

    tableBody.innerHTML = tableHtml;
  };

 // Update Pagination 
  const renderPaginationControls = () => {
    pageInfo.textContent = `Page ${state.currentPage} of ${state.totalPages || 1}`;
    totalEventsInfo.textContent = `(${state.totalEvents} total events)`;
    
    prevPageBtn.disabled = state.currentPage <= 1;
    nextPageBtn.disabled = state.currentPage >= state.totalPages;
  };

  
// Fetch the dynamic options for the filter dropdown
  const populateFilterOptions = async () => {
    const field = filterBySelect.value;
    filterOptionSelect.innerHTML = '<option value="">Choose Option</option>'; 
    filterOptionSelect.disabled = true;

    if (!field) return;

    try {
      const res = await fetch(`/api/events/filter-options/${field}`);
      if (!res.ok) throw new Error('Network response was not ok');
      
      const options = await res.json();
      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        filterOptionSelect.appendChild(optionEl);
      });

      filterOptionSelect.disabled = false;
    } catch (err) {
      console.error("Failed to populate filter options:", err);
    }
  };

  filterBySelect.addEventListener("change", populateFilterOptions);
  
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.currentPage = 1;
    performSearch();
  });

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    state.currentPage = 1;
    performSearch();
  });

  pageSizeSelect.addEventListener("change", (e) => {
    state.pageSize = parseInt(e.target.value);
    state.currentPage = 1;
    performSearch();
  });

  prevPageBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      performSearch();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (state.currentPage < state.totalPages) {
      state.currentPage++;
      performSearch();
    }
  });

  // Initial page Load 
  performSearch();
});
