document.addEventListener('DOMContentLoaded', () => {
  const leaveModal = document.getElementById("modal-leave");
  const closeLeaveBtn = document.getElementById("close-leave");
  const cancelLeaveBtn = document.getElementById("cancel-leave");
  const leaveForm = document.getElementById('leave-form');
  const modalMessageLeave = document.getElementById('modal-message-leave');
  const confirmLeaveBtn = document.getElementById('confirm-leave-btn');
  const modalTitleLeave = document.getElementById("event-title-leave");
  const eventIdInputLeave = document.getElementById("event-id-leave");

  const deleteModal = document.getElementById("modal-delete");
  const closeDeleteBtn = document.getElementById("close-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const deleteForm = document.getElementById('delete-form');
  const modalMessageDelete = document.getElementById('modal-message-delete');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const modalTitleDelete = document.getElementById("event-title-delete");
  const eventIdInputDelete = document.getElementById("event-id-delete");

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

  function openLeaveModal(eventId, eventTitle) {
    leaveModal.classList.add("open");
    document.body.style.overflow = "hidden";
    eventIdInputLeave.value = eventId;
    if (modalTitleLeave) {
      modalTitleLeave.textContent = `Leave "${eventTitle}"?`;
    }
  }

  function closeLeaveModal() {
    leaveModal.classList.remove("open");
    document.body.style.overflow = "";
    if (modalMessageLeave) {
      modalMessageLeave.textContent = '';
      modalMessageLeave.className = 'modal-message';
    }
    if (confirmLeaveBtn) {
      confirmLeaveBtn.disabled = false;
      confirmLeaveBtn.textContent = 'Confirm Leave';
    }
  }

  if (leaveModal && closeLeaveBtn && cancelLeaveBtn) {
    closeLeaveBtn.addEventListener("click", closeLeaveModal);
    cancelLeaveBtn.addEventListener("click", closeLeaveModal);
    leaveModal.addEventListener("click", (e) => {
      if (e.target === leaveModal) closeLeaveModal();
    });
  }

  function openDeleteModal(eventId, eventTitle) {
    deleteModal.classList.add("open");
    document.body.style.overflow = "hidden";
    eventIdInputDelete.value = eventId;
    if (modalTitleDelete) {
      modalTitleDelete.textContent = `Delete "${eventTitle}"?`;
    }
  }

  function closeDeleteModal() {
    deleteModal.classList.remove("open");
    document.body.style.overflow = "";
    if (modalMessageDelete) {
      modalMessageDelete.textContent = '';
      modalMessageDelete.className = 'modal-message';
    }
    if (confirmDeleteBtn) {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = 'Confirm Delete';
    }
  }

  if (deleteModal && closeDeleteBtn && cancelDeleteBtn) {
    closeDeleteBtn.addEventListener("click", closeDeleteModal);
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }


  if (leaveForm) {
    leaveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventId = eventIdInputLeave.value;

      if (confirmLeaveBtn) {
        confirmLeaveBtn.disabled = true;
        confirmLeaveBtn.textContent = 'Leaving...';
      }
      if (modalMessageLeave) {
        modalMessageLeave.textContent = 'Processing...';
        modalMessageLeave.className = 'modal-message message-loading';
      }
      
      try {
        const res = await fetch(`/events/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: eventId }),
          credentials: 'include'
        });

        const messageText = await res.text();

        if (res.ok) {
          if (modalMessageLeave) {
            modalMessageLeave.textContent = messageText || 'Successfully left the event!';
            modalMessageLeave.className = 'modal-message message-success';
          }
          if (confirmLeaveBtn) {
            confirmLeaveBtn.textContent = 'Event Left';
          }
          fetchMyEvents(); 
        } else {
          if (modalMessageLeave) {
            modalMessageLeave.textContent = messageText || 'Failed to leave event.';
            modalMessageLeave.className = 'modal-message message-error';
          }
          if (confirmLeaveBtn) {
            confirmLeaveBtn.disabled = false;
            confirmLeaveBtn.textContent = 'Confirm Leave';
          }
        }
      } catch (err) {
        console.error('Leave event fetch error:', err);
        if (modalMessageLeave) {
          modalMessageLeave.textContent = 'A network error occurred.';
          modalMessageLeave.className = 'modal-message message-error';
        }
        if (confirmLeaveBtn) {
          confirmLeaveBtn.disabled = false;
          confirmLeaveBtn.textContent = 'Confirm Leave';
        }
      } finally {
        setTimeout(closeLeaveModal, 3000);
      }
    });
  }

  if (deleteForm) {
    deleteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const eventId = eventIdInputDelete.value;

      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.textContent = 'Deleting...';
      }
      if (modalMessageDelete) {
        modalMessageDelete.textContent = 'Processing...';
        modalMessageDelete.className = 'modal-message message-loading';
      }
      
      try {
        const res = await fetch(`/events/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: eventId }),
          credentials: 'include'
        });

        const messageText = await res.text();

        if (res.ok) {
          if (modalMessageDelete) {
            modalMessageDelete.textContent = messageText || 'Successfully deleted the event!';
            modalMessageDelete.className = 'modal-message message-success';
          }
          if (confirmDeleteBtn) {
            confirmDeleteBtn.textContent = 'Event Deleted';
          }
          fetchMyEvents(); 
        } else {
          if (modalMessageDelete) {
            modalMessageDelete.textContent = messageText || 'Failed to delete event.';
            modalMessageDelete.className = 'modal-message message-error';
          }
          if (confirmDeleteBtn) {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Confirm Delete';
          }
        }
      } catch (err) {
        console.error('Delete event fetch error:', err);
        if (modalMessageDelete) {
          modalMessageDelete.textContent = 'A network error occurred.';
          modalMessageDelete.className = 'modal-message message-error';
        }
        if (confirmDeleteBtn) {
          confirmDeleteBtn.disabled = false;
          confirmDeleteBtn.textContent = 'Confirm Delete';
        }
      } finally {
        setTimeout(closeDeleteModal, 3000);
      }
    });
  }

  function attachLeaveModalListeners() {
    document.querySelectorAll(".leave-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const eventId = btn.dataset.id;
        const eventTitle = btn.dataset.title;
        openLeaveModal(eventId, eventTitle);
      });
    });
  }

  function attachDeleteModalListeners() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const eventId = btn.dataset.id;
        const eventTitle = btn.dataset.title;
        openDeleteModal(eventId, eventTitle);
      });
    });
  }

  const fetchMyEvents = async () => {
    const params = new URLSearchParams();
    params.append('page', state.currentPage);
    params.append('limit', state.pageSize);

    tableBody.innerHTML = '<tr><td colspan="7">Loading your events...</td></tr>';

    try {
      const res = await fetch(`/api/users/myevents?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (res.status === 401) {
         tableBody.innerHTML = '<tr><td colspan="7">You must be logged in to see your events.</td></tr>';
         return;
      }
      if (!res.ok) throw new Error('Network response was not ok');

      const { events, pagination } = await res.json();
      state = { ...state, ...pagination };
      renderTable(events);
      renderPaginationControls();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error("Failed to fetch events:", err);
      tableBody.innerHTML = '<tr><td colspan="7">Error loading your events. Please try again.</td></tr>';
    }
  };

  const renderTable = (events) => {
    if (!events || events.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7">You have not created or joined any events yet.</td></tr>';
      return;
    }

    const tableHtml = events.map(event => {
      let actionButtons = `
        <a href="/events/${event._id}" class="table-action-btn" title="View Details">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </a>
      `;

      if (event.isOwner) {
        actionButtons += `
          <button class="table-action-btn delete-btn" data-id="${event._id}" data-title="${event.title}" title="Delete Event">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        `;
      } else if (event.isJoined) {
        actionButtons += `
          <button class="table-action-btn leave-btn" data-id="${event._id}" data-title="${event.title}" title="Leave Event">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        `;
      }

      return `
        <tr>
          <td>${event.title}</td>
          <td>${event.sport?.name || "—"}</td>
          <td>${event.location}</td>
          <td>${event.formattedDate}</td>
          <td>${event.formattedTime}</td>
          <td>${event.slotsRemainingText}</td>
          <td class="table-actions">
            ${actionButtons}
          </td>
        </tr>
      `;
    }).join('');

    tableBody.innerHTML = tableHtml;

    attachLeaveModalListeners(); 
    attachDeleteModalListeners();
  };

  const renderPaginationControls = () => {
    pageInfo.textContent = `Page ${state.currentPage || 1} of ${state.totalPages || 1}`;
    totalEventsInfo.textContent = `(${state.totalEvents || 0} total events)`;
    prevPageBtn.disabled = (state.currentPage || 1) <= 1;
    nextPageBtn.disabled = (state.currentPage || 1) >= (state.totalPages || 1);
  };

  pageSizeSelect.addEventListener("change", (e) => {
    state.pageSize = parseInt(e.target.value);
    state.currentPage = 1;
    fetchMyEvents();
  });

  prevPageBtn.addEventListener("click", () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      fetchMyEvents();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    if (state.currentPage < state.totalPages) {
      state.currentPage++;
      fetchMyEvents();
    }
  });

  // Initial page Load 
  fetchMyEvents();
});