/* ==========================================================================
   SEKINAH PORTFOLIO — GLOBAL SCRIPT (Ops Wall design)
   Sections:
     1. Mobile navigation toggle      (all pages)
     2. Academic Planner logic        (planner.html)
     3. Contact form validation       (contact.html)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
  ------------------------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ------------------------------------------------------------------
     2. ACADEMIC PLANNER
     Tasks are kept as an in-memory array and persisted to localStorage
     so the list survives a page reload.
  ------------------------------------------------------------------ */
  const taskForm = document.getElementById('taskForm');

  if (taskForm) {
    const STORAGE_KEY = 'sekinah-planner-tasks';

    const taskTitleInput = document.getElementById('taskTitle');
    const taskDueInput = document.getElementById('taskDue');
    const taskPriorityInput = document.getElementById('taskPriority');
    const taskListEl = document.getElementById('taskList');
    const emptyStateEl = document.getElementById('emptyState');
    const statTotal = document.getElementById('statTotal');
    const statDone = document.getElementById('statDone');
    const statPending = document.getElementById('statPending');

    let tasks = loadTasks();

    function loadTasks() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        console.warn('Could not read saved tasks, starting fresh.', err);
        return [];
      }
    }

    function saveTasks() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        console.warn('Could not save tasks.', err);
      }
    }

    function formatDate(dateStr) {
      if (!dateStr) return 'No due date';
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function render() {
      taskListEl.innerHTML = '';

      if (tasks.length === 0) {
        taskListEl.appendChild(emptyStateEl);
        emptyStateEl.style.display = 'block';
      } else {
        emptyStateEl.style.display = 'none';

        tasks.forEach(function (task) {
          const item = document.createElement('div');
          item.className = 'task-item' + (task.completed ? ' completed' : '');
          item.dataset.id = task.id;

          item.innerHTML =
            '<button class="task-check ' + (task.completed ? 'checked' : '') + '" ' +
              'aria-label="Toggle task completed" title="Mark ' + (task.completed ? 'incomplete' : 'complete') + '">' +
              (task.completed ? '✓' : '') +
            '</button>' +
            '<div class="task-main">' +
              '<div class="task-title"></div>' +
              '<div class="task-meta"></div>' +
            '</div>' +
            '<span class="task-priority ' + task.priority + '">' + task.priority + '</span>' +
            '<button class="task-delete" aria-label="Delete task" title="Delete task">✕</button>';

          item.querySelector('.task-title').textContent = task.title;
          item.querySelector('.task-meta').textContent = 'Due: ' + formatDate(task.due);

          taskListEl.appendChild(item);
        });
      }

      const total = tasks.length;
      const done = tasks.filter(function (t) { return t.completed; }).length;
      statTotal.textContent = total;
      statDone.textContent = done;
      statPending.textContent = total - done;
    }

    taskForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = taskTitleInput.value.trim();
      if (!title) return;

      tasks.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: title,
        due: taskDueInput.value,
        priority: taskPriorityInput.value,
        completed: false
      });

      saveTasks();
      render();
      taskForm.reset();
      taskPriorityInput.value = 'medium';
      taskTitleInput.focus();
    });

    taskListEl.addEventListener('click', function (e) {
      const item = e.target.closest('.task-item');
      if (!item) return;
      const id = item.dataset.id;

      if (e.target.closest('.task-check')) {
        const task = tasks.find(function (t) { return t.id === id; });
        if (task) task.completed = !task.completed;
        saveTasks();
        render();
      }

      if (e.target.closest('.task-delete')) {
        tasks = tasks.filter(function (t) { return t.id !== id; });
        saveTasks();
        render();
      }
    });

    render();
  }


  /* ------------------------------------------------------------------
     3. CONTACT FORM VALIDATION
     Rules: no empty fields, valid email format (regex), phone must be
     digits only. Feedback is written into the DOM — no alert() calls.
  ------------------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    const fields = {
      name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
      email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
      phone: { input: document.getElementById('phone'), error: document.getElementById('phoneError') },
      message: { input: document.getElementById('message'), error: document.getElementById('messageError') }
    };
    const formMsg = document.getElementById('formMsg');

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const DIGITS_ONLY_REGEX = /^\d+$/;

    function setFieldError(field, text) {
      field.error.textContent = text;
      field.input.classList.toggle('invalid', Boolean(text));
    }

    function validateField(key) {
      const field = fields[key];
      const value = field.input.value.trim();

      if (!value) {
        setFieldError(field, 'This field cannot be empty.');
        return false;
      }

      if (key === 'email' && !EMAIL_REGEX.test(value)) {
        setFieldError(field, 'Enter a valid email address (e.g. name@example.com).');
        return false;
      }

      if (key === 'phone' && !DIGITS_ONLY_REGEX.test(value)) {
        setFieldError(field, 'Phone number must contain digits only, no spaces or symbols.');
        return false;
      }

      setFieldError(field, '');
      return true;
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].input.addEventListener('blur', function () { validateField(key); });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const results = Object.keys(fields).map(validateField);
      const allValid = results.every(Boolean);

      formMsg.classList.remove('success', 'error', 'show');

      if (!allValid) {
        formMsg.textContent = 'Please fix the highlighted fields before sending.';
        formMsg.classList.add('error', 'show');
        return;
      }

      formMsg.textContent = 'Message sent — thanks for reaching out! I will get back to you soon.';
      formMsg.classList.add('success', 'show');
      contactForm.reset();
    });
  }

});