document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. HELPER FUNCTIONS
  // ============================================================
  
  // Helper to close any modal and reset its state
  function closeModal(modalId, formId = null, messageId = null) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("open");
      if (typeof modal.close === "function" && modal.open) {
          modal.close();
      }
    }
    
    if (formId) {
      const form = document.getElementById(formId);
      if (form) form.reset();
    }

    if (messageId) {
      const msg = document.getElementById(messageId);
      if (msg) {
        msg.textContent = "";
        msg.className = "modal-message";
      }
    }
  }

  // Helper to open a modal
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("open");
      if (typeof modal.showModal === "function" && !modal.open) {
          modal.showModal();
      }
    }
  }

  // Helper to redirect if session is lost
  function checkSession(res) {
      if (res.status === 401 || res.status === 404) {
          alert("Session expired or user not found. Redirecting to login.");
          window.location.href = "/signin";
          return false;
      }
      return true;
  }

  // --- NEW HELPER: Robust ID Extractor ---
  // If Handlebars fails to render {{event._id}}, this gets the ID from the URL
  function getSafeEventId(formData, fieldName = "event_id") {
      let id = formData.get(fieldName);
      
      // Check if the value is the literal Handlebars string (Broken render)
      if (!id || id.includes("{{")) {
          console.warn("Event ID from form is invalid/unrendered. extracting from URL.");
          // Extract ID from /events/1234567890...
          const pathParts = window.location.pathname.replace(/\/$/, '').split('/');
          id = pathParts[pathParts.length - 1];
      }
      return id;
  }

  // ============================================================
  // 2. REGISTER FOR EVENT LOGIC
  // ============================================================
  const registerModalId = "modal-register";
  const openRegisterBtn = document.getElementById("open-register-btn");
  const closeRegisterBtn = document.getElementById("close-register");
  const cancelRegisterBtn = document.getElementById("cancel-register");
  const registerForm = document.getElementById("register-form");

  if (openRegisterBtn) {
    openRegisterBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(registerModalId);
    });
  }

  if (closeRegisterBtn) closeRegisterBtn.addEventListener("click", () => closeModal(registerModalId, "register-form", "modal-message"));
  if (cancelRegisterBtn) cancelRegisterBtn.addEventListener("click", () => closeModal(registerModalId, "register-form", "modal-message"));

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = registerForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        
        btn.disabled = true;
        btn.textContent = "Registering...";

        const formData = new FormData(registerForm);
        // Use the safe extractor
        const eventId = getSafeEventId(formData, "event_id");

        try {
            const res = await fetch('/events/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId })
            });

            if (!checkSession(res)) return;

            if (res.ok) {
                window.location.reload();
            } else {
                const text = await res.text();
                const msgDiv = document.getElementById("modal-message");
                msgDiv.textContent = text || "Registration failed.";
                msgDiv.className = "modal-message message-error";
                btn.disabled = false;
                btn.textContent = originalText;
            }
        } catch (err) {
            console.error(err);
            const msgDiv = document.getElementById("modal-message");
            msgDiv.textContent = "Network error.";
            msgDiv.className = "modal-message message-error";
            btn.disabled = false;
            btn.textContent = originalText;
        }
    });
  }


  // ============================================================
  // 3. LEAVE EVENT LOGIC
  // ============================================================
  const leaveModalId = "modal-leave";
  const openLeaveBtn = document.getElementById("open-leave-btn");
  const closeLeaveBtn = document.getElementById("close-leave");
  const cancelLeaveBtn = document.getElementById("cancel-leave");
  const leaveForm = document.getElementById("leave-form");
  
  if (openLeaveBtn) {
      openLeaveBtn.addEventListener("click", (e) => {
          e.preventDefault();
          openModal(leaveModalId);
      });
  }

  if (closeLeaveBtn) closeLeaveBtn.addEventListener("click", () => closeModal(leaveModalId, "leave-form", "modal-message-leave"));
  if (cancelLeaveBtn) cancelLeaveBtn.addEventListener("click", () => closeModal(leaveModalId, "leave-form", "modal-message-leave"));

  if (leaveForm) {
      leaveForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = document.getElementById("confirm-leave-btn");
          const originalText = btn.textContent;
          btn.disabled = true;
          btn.textContent = "Processing...";

          const formData = new FormData(leaveForm);
          const eventId = getSafeEventId(formData, "event_id");

          try {
              const res = await fetch('/events/leave', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventId })
              });

              if (!checkSession(res)) return;

              if (res.ok) {
                  window.location.reload();
              } else {
                  const text = await res.text();
                  const msg = document.getElementById("modal-message-leave");
                  msg.textContent = text || "Failed to leave.";
                  msg.className = "modal-message message-error";
                  btn.disabled = false;
                  btn.textContent = originalText;
              }
          } catch (err) {
              console.error(err);
              const msg = document.getElementById("modal-message-leave");
              msg.textContent = "Network error.";
              msg.className = "modal-message message-error";
              btn.disabled = false;
              btn.textContent = originalText;
          }
      });
  }

  // ============================================================
  // 4. DELETE EVENT LOGIC
  // ============================================================
  const deleteModalId = "modal-delete";
  const openDeleteBtn = document.getElementById("open-delete-btn");
  const closeDeleteBtn = document.getElementById("close-delete");
  const cancelDeleteBtn = document.getElementById("cancel-delete");
  const deleteForm = document.getElementById("delete-form");

  if (openDeleteBtn) {
      openDeleteBtn.addEventListener("click", (e) => {
          e.preventDefault();
          openModal(deleteModalId);
      });
  }

  if (closeDeleteBtn) closeDeleteBtn.addEventListener("click", () => closeModal(deleteModalId, "delete-form", "modal-message-delete"));
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", () => closeModal(deleteModalId, "delete-form", "modal-message-delete"));

  if (deleteForm) {
      deleteForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = document.getElementById("confirm-delete-btn");
          const originalText = btn.textContent;
          btn.disabled = true;
          btn.textContent = "Deleting...";

          const formData = new FormData(deleteForm);
          const eventId = getSafeEventId(formData, "event_id");

          try {
              const res = await fetch('/api/events/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ eventId })
              });

              if (!checkSession(res)) return;

              if (res.ok) {
                  window.location.href = "/dashboard/myevents";
              } else {
                  const text = await res.text();
                  const msg = document.getElementById("modal-message-delete");
                  msg.textContent = text || "Failed to delete.";
                  msg.className = "modal-message message-error";
                  btn.disabled = false;
                  btn.textContent = originalText;
              }
          } catch (err) {
              console.error(err);
              const msg = document.getElementById("modal-message-delete");
              msg.textContent = "Network error.";
              msg.className = "modal-message message-error";
              btn.disabled = false;
              btn.textContent = originalText;
          }
      });
  }

  // ============================================================
  // 5. EDIT EVENT LOGIC
  // ============================================================
  const editModalId = "modal-edit";
  const openEditBtn = document.getElementById("open-edit-btn");
  const closeEditBtn = document.getElementById("close-edit");
  const cancelEditBtn = document.getElementById("cancel-edit");
  const editForm = document.getElementById("edit-form");
  const sportSelect = document.getElementById("edit-sport");

  async function loadSports() {
    if (!sportSelect || sportSelect.options.length > 1) return;

    try {
      const res = await fetch('/api/events/filter-options/sport');
      const options = await res.json();
      const selectedId = sportSelect.dataset.selected;

      sportSelect.innerHTML = '<option value="">Select Sport</option>';
      
      options.forEach(opt => {
        const isSelected = (opt.value === selectedId || opt.label === selectedId) ? 'selected' : '';
        sportSelect.innerHTML += `<option value="${opt.value}" ${isSelected}>${opt.label}</option>`;
      });
    } catch (err) {
      console.error("Failed to load sports", err);
    }
  }

  if (openEditBtn) {
      openEditBtn.addEventListener("click", (e) => {
          e.preventDefault();
          openModal(editModalId);
          loadSports();
      });
  }

  if (closeEditBtn) closeEditBtn.addEventListener("click", () => closeModal(editModalId, "edit-form", "modal-message-edit"));
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", () => closeModal(editModalId, "edit-form", "modal-message-edit"));

  if (editForm) {
      editForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const btn = document.getElementById("confirm-edit-btn");
          const originalText = btn.textContent;
          btn.disabled = true;
          btn.textContent = "Saving...";

          const formData = new FormData(editForm);
          const data = Object.fromEntries(formData.entries());
          
          // Fix ID if it's broken in the edit form too
          data.eventId = getSafeEventId(formData, "eventId");

          try {
              const res = await fetch('/api/events/update', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
              });

              if (!checkSession(res)) return;

              if (res.ok) {
                  window.location.reload();
              } else {
                  const text = await res.text();
                  const msg = document.getElementById("modal-message-edit");
                  msg.textContent = text || "Failed to update event.";
                  msg.className = "modal-message message-error";
                  btn.disabled = false;
                  btn.textContent = originalText;
              }
          } catch (err) {
              console.error(err);
              const msg = document.getElementById("modal-message-edit");
              msg.textContent = "Network error.";
              msg.className = "modal-message message-error";
              btn.disabled = false;
              btn.textContent = originalText;
          }
      });
  }

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("open");
      if (typeof e.target.close === "function") e.target.close();
    }
  });

});