document.addEventListener('DOMContentLoaded', () => {
  const settingsModal = document.getElementById("modal-settings");
  const openSettingsBtn = document.getElementById("open-settings-btn");
  const closeSettingsBtn = document.getElementById("close-settings");
  const cancelSettingsBtn = document.getElementById("cancel-settings");
  const settingsForm = document.getElementById("settings-form");
  const settingsMessage = document.getElementById("modal-message-settings");
  const confirmSettingsBtn = document.getElementById("confirm-settings-btn");

  const imageModal = document.getElementById('modal-image-url');
  const openImageBtn = document.getElementById('open-image-modal-btn');
  const closeImageBtn = document.getElementById('close-image-modal');
  const cancelImageBtn = document.getElementById('cancel-image-modal');
  const imageForm = document.getElementById('image-url-form');
  const imageMessage = document.getElementById('modal-message-image');
  const profileImg = document.querySelector('.profile-picture-img');

  const createModal = document.getElementById("modal-create");
  const openCreateModalBtn = document.getElementById("open-create-modal-btn");
  const closeCreateBtn = document.getElementById("close-create");
  const cancelCreateBtn = document.getElementById("cancel-create");
  const createForm = document.getElementById('create-form');
  const modalMessageCreate = document.getElementById('modal-message-create');
  const confirmCreateBtn = document.getElementById('confirm-create-btn');
  const sportSelectCreate = document.getElementById('create-sport');
  let sportsOptions = null; 


  function openImageModal() {
    if (!imageModal) return;
    imageModal.classList.add("open");
    if (typeof imageModal.showModal === "function") {
        try { imageModal.showModal(); } catch(e){}
    }
    document.body.style.overflow = "hidden";
  }

  function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove("open");
    if (typeof imageModal.close === "function") imageModal.close();
    document.body.style.overflow = "";
    
    if (imageMessage) {
        imageMessage.textContent = "";
        imageMessage.className = "modal-message";
    }
    if (imageForm) imageForm.reset();
  }

  if (imageModal && openImageBtn) {
    openImageBtn.addEventListener("click", (e) => {
        e.preventDefault(); 
        openImageModal();
    });
    if (closeImageBtn) closeImageBtn.addEventListener("click", closeImageModal);
    if (cancelImageBtn) cancelImageBtn.addEventListener("click", closeImageModal);

    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal) closeImageModal();
    });
  }

  if (imageForm) {
    imageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('image-url-input');
      const confirmImageBtn = document.getElementById('confirm-image-btn');

      if (confirmImageBtn) {
        confirmImageBtn.textContent = "Saving...";
        confirmImageBtn.disabled = true;
      }
      if (imageMessage) {
          imageMessage.textContent = "Processing...";
          imageMessage.className = "modal-message";
      }

      try {
        const res = await fetch('/api/users/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: urlInput.value })
        });

        if (res.ok) {
          if (profileImg) {
            profileImg.src = urlInput.value;
          } else {
            window.location.reload();
          }
          closeImageModal();
        } else {
          if (imageMessage) {
            imageMessage.textContent = "Failed to update image.";
            imageMessage.className = "modal-message message-error";
          }
        }
      } catch (err) {
        console.error(err);
        if (imageMessage) {
            imageMessage.textContent = "Error connecting to server.";
            imageMessage.className = "modal-message message-error";
        }
      } finally {
        if (confirmImageBtn) {
            confirmImageBtn.textContent = "Save Image";
            confirmImageBtn.disabled = false;
        }
      }
    });
  }

  function openSettingsModal() {
    if (!settingsModal) return;
    settingsModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeSettingsModal() {
    if (!settingsModal) return;
    settingsModal.classList.remove("open");
    document.body.style.overflow = "";

    if (settingsMessage) {
        settingsMessage.textContent = "";
        settingsMessage.className = "modal-message";
    }
    if (confirmSettingsBtn) {
        confirmSettingsBtn.disabled = false;
        confirmSettingsBtn.textContent = "Save Settings";
    }
  }

  if (settingsModal && openSettingsBtn) {
    openSettingsBtn.addEventListener("click", openSettingsModal);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener("click", closeSettingsModal);
    if (cancelSettingsBtn) cancelSettingsBtn.addEventListener("click", closeSettingsModal);

    settingsModal.addEventListener("click", (e) => {
      if (e.target === settingsModal) closeSettingsModal();
    });
  }

  if (settingsForm) {
      settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (confirmSettingsBtn) {
          confirmSettingsBtn.disabled = true;
          confirmSettingsBtn.textContent = "Saving...";
      }
      if (settingsMessage) {
          settingsMessage.textContent = "Processing...";
          settingsMessage.className = "modal-message message-loading";
      }

      const formData = new FormData(settingsForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch("/api/users/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(data), 
          credentials: "include",
        });

        const msg = await res.json(); 

        if (res.ok) {
          if (settingsMessage) {
              settingsMessage.textContent = "Settings updated!";
              settingsMessage.className = "modal-message message-success";
          }
          if (confirmSettingsBtn) confirmSettingsBtn.textContent = "Saved";

          setTimeout(() => location.reload(), 1000);
        } else {
          if (settingsMessage) {
              settingsMessage.textContent = msg.error || "Failed to update settings.";
              settingsMessage.className = "modal-message message-error";
          }
          if (confirmSettingsBtn) {
              confirmSettingsBtn.disabled = false;
              confirmSettingsBtn.textContent = "Save Settings";
          }
        }
      } catch (err) {
        console.error(err);
        if (settingsMessage) {
            settingsMessage.textContent = "Network Error";
            settingsMessage.className = "modal-message message-error";
        }
        if (confirmSettingsBtn) {
            confirmSettingsBtn.disabled = false;
            confirmSettingsBtn.textContent = "Save Settings";
        }
      }
    });
  }

  async function populateSportsDropdown() {
    if (sportsOptions || !sportSelectCreate) {return;} 

    try {
      const res = await fetch('/api/events/filter-options/sport');
      if (!res.ok) {throw new Error('Failed to fetch sports');}
      const options = await res.json();
      sportsOptions = options; 

      sportSelectCreate.innerHTML = '<option value="">Select a Sport</option>';
      options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt.value; 
        optionEl.textContent = opt.label; 
        sportSelectCreate.appendChild(optionEl);
      });
    } catch (err) {
      console.error(err);
      if (sportSelectCreate) sportSelectCreate.innerHTML = '<option value="">Could not load sports</option>';
    }
  }

  function openCreateModal() {
    if (!createModal) return;
    createModal.classList.add("open");
    document.body.style.overflow = "hidden";
    populateSportsDropdown();
  }

  function closeCreateModal() {
    if (!createModal) return;
    createModal.classList.remove("open");
    document.body.style.overflow = "";
    if (modalMessageCreate) {
      modalMessageCreate.textContent = '';
      modalMessageCreate.className = 'modal-message';
    }
    if (confirmCreateBtn) {
      confirmCreateBtn.disabled = false;
      confirmCreateBtn.textContent = 'Confirm Create';
    }
    if (createForm) createForm.reset(); 
  }

  if (createModal && openCreateModalBtn) {
    openCreateModalBtn.addEventListener('click', openCreateModal);
    if (closeCreateBtn) closeCreateBtn.addEventListener("click", closeCreateModal);
    if (cancelCreateBtn) cancelCreateBtn.addEventListener("click", closeCreateModal);
    createModal.addEventListener("click", (e) => {
      if (e.target === createModal) {closeCreateModal();}
    });
  }

  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (confirmCreateBtn) {
        confirmCreateBtn.disabled = true;
        confirmCreateBtn.textContent = "Creating...";
      }
      if (modalMessageCreate) {
        modalMessageCreate.textContent = "Processing...";
        modalMessageCreate.className = 'modal-message message-loading';
      }
      
      const formData = new FormData(createForm);
      const eventData = Object.fromEntries(formData.entries());

      // Date validation
      const selectedDate = new Date(eventData.date + "T" + eventData.time);
      const now = new Date();
      if (selectedDate < now) {
          if (modalMessageCreate) {
            modalMessageCreate.textContent = 'You cannot create an event in the past.';
            modalMessageCreate.className = 'modal-message message-error';
          }
          if (confirmCreateBtn) {
            confirmCreateBtn.disabled = false;
            confirmCreateBtn.textContent = 'Confirm Create';
          }
          return; 
      }

      try {
        const res = await fetch(`/api/events/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
          credentials: 'include'
        });

        const messageText = await res.text();

        if (res.ok) {
          if (modalMessageCreate) {
            modalMessageCreate.textContent = messageText || 'Successfully created the event!';
            modalMessageCreate.className = 'modal-message message-success';
          }
          if (confirmCreateBtn) {
            confirmCreateBtn.textContent = 'Event Created';
          }
          // Redirect to My Events after successful creation
          setTimeout(() => {
             window.location.href = "/dashboard/myevents";
          }, 1000);
          
          createForm.reset(); 
        } else {
          if (modalMessageCreate) {
            modalMessageCreate.textContent = messageText || 'Failed to create event.';
            modalMessageCreate.className = 'modal-message message-error';
          }
          if (confirmCreateBtn) {
            confirmCreateBtn.disabled = false;
            confirmCreateBtn.textContent = 'Confirm Create';
          }
        }
      } catch (err) {
        console.error('Create event fetch error:', err);
        if (modalMessageCreate) {
          modalMessageCreate.textContent = 'A network error occurred.';
          modalMessageCreate.className = 'modal-message message-error';
        }
        if (confirmCreateBtn) {
          confirmCreateBtn.disabled = false;
          confirmCreateBtn.textContent = 'Confirm Create';
        }
      } 
    });
  }
});