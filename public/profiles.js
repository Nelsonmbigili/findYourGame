document.addEventListener('DOMContentLoaded', () => {

  const searchForm = document.getElementById("profile-search-form");
  const filterForm = document.getElementById("profile-filter-form");
  const searchInput = document.getElementById("profile_search_query");
  const sportSelect = document.getElementById("filter-by-sport");
  
  const tableBody = document.getElementById("profiles-table-body");
  const pageSizeSelect = document.getElementById("page-size-select");
  const totalProfilesInfo = document.getElementById("total-profiles-info");
  const pageInfo = document.getElementById("page-info");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");

  let state = {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalUsers: 0
  };

  const performSearch = async () => {
    const query = searchInput.value;
    const sport = sportSelect.value;

    const params = new URLSearchParams();
    params.append('page', state.currentPage);
    params.append('limit', state.pageSize);
    
    if (query) { params.append('search_query', query); }
    if (sport) { params.append('sport', sport); }

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Loading profiles...</td></tr>';

    try {
      const res = await fetch(`/api/users/search?${params.toString()}`);
      
      if (!res.ok) { throw new Error('Network response was not ok'); }
      
      const data = await res.json();
      const { users, pagination } = data;
      
      state = { ...state, ...pagination };
      
      renderTable(users);
      renderPaginationControls();


    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #d9534f;">Error loading profiles. Please try again.</td></tr>';
    }
  };

  const renderTable = (users) => {
    if (!users || users.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No profiles found matching your criteria.</td></tr>';
      return;
    }

    const tableHtml = users.map(user => {
        let initials = user.initials;
        if (!initials && user.name) {
            const first = user.name.firstName ? user.name.firstName[0] : '';
            const second = user.name.secondName ? user.name.secondName[0] : '';
            initials = (first + second).toUpperCase();
        }

        const sportsHtml = user.sports && user.sports.length 
            ? user.sports.map(sport => 
                `<span class="sport-tag-small" style="display: inline-block; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-right: 4px;">${sport}</span>`
              ).join('')
            : '<span style="color: #999; font-size: 0.8rem;">None</span>';

        let avatarHtml = '';
        if (user.image) {
            avatarHtml = `<img src="${user.image}" alt="avatar" class="table-avatar" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;">`;
        } else {
            avatarHtml = `
            <div class="table-avatar-placeholder" style="width: 30px; height: 30px; border-radius: 50%; background: #eee; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #555;">
                ${initials}
            </div>`;
        }

        const memberSince = user.formattedDate || new Date(user.createdAt).toLocaleDateString();

        return `
        <tr>
          <td>${avatarHtml}</td>
          <td>${user.name.firstName} ${user.name.secondName}</td>
          <td>${user.username}</td>
          <td>${sportsHtml}</td>
          <td>${memberSince}</td>
          <td>
            <a href="/profiles/${user.username}" class="table-action-btn" title="View Details">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>

            </a>
          </td>
        </tr>
        `;
    }).join('');

    tableBody.innerHTML = tableHtml;
  };

  const renderPaginationControls = () => {
    pageInfo.textContent = `Page ${state.currentPage} of ${state.totalPages || 1}`;
    totalProfilesInfo.textContent = `(${state.totalUsers || 0} total profiles)`;
    
    prevPageBtn.disabled = state.currentPage <= 1;
    nextPageBtn.disabled = state.currentPage >= state.totalPages;
  };


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


  if (tableBody) {
    performSearch();
  }
});