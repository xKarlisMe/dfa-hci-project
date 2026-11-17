(() => {
  const controls = 'input:not([type="hidden"]):not([type="search"]):not([type="submit"]):not([type="button"]), select, textarea';
  const errorClass = 'field-error';
  const nextPages = {
    'applicant-family.html': 'application-contact.html',
    'application-contact.html': 'review-payment.html',
    'review-payment.html': 'final-consent.html',
    'final-consent.html': 'payment-wallet.html',
    'group-personal.html': 'group-family.html',
    'group-family.html': 'group-application.html',
    'group-application.html': 'group-contact.html',
    'group-contact.html': 'group-contact-person.html',
    'group-contact-person.html': 'group-review.html',
    'group-review.html': 'group-consent.html',
    'group-consent.html': 'group-payment-wallet.html'
  };
  const choices = {
    region: ['ASIA PACIFIC', 'AMERICAS', 'EUROPE', 'MIDDLE EAST AND AFRICA'],
    country: ['Philippines', 'Australia', 'China', 'Hong Kong', 'India', 'Indonesia', 'Japan', 'Malaysia', 'New Zealand', 'Singapore', 'South Korea', 'Taiwan', 'Thailand', 'United Arab Emirates', 'United Kingdom', 'United States', 'Canada'],
    office: [
      'DFA ASEANA', 'BAGUIO (SM CITY BAGUIO)', 'CONSULAR OFFICE CENTRAL (ROBINSONS GALLERIA)',
      'CONSULAR OFFICE EAST (SM MEGAMALL)', 'CONSULAR OFFICE NORTH (ROBINSONS NOVALICHES)',
      'CONSULAR OFFICE NORTHEAST (ALI MALL)', 'CONSULAR OFFICE SOUTH (FESTIVAL MALL)',
      'CONSULAR OFFICE WEST (SM CITY MANILA)', 'CEBU (ROBINSONS GALLERIA CEBU)',
      'DAVAO (SM CITY DAVAO)', 'CAGAYAN DE ORO (SM CITY CDO)', 'ILOILO (SM CITY ILOILO)',
      'BACOLOD (AYALA MALLS CAPITOL CENTRAL)', 'SAN FERNANDO (ROBINSONS STARMILLS)',
      'ANGELES (ROBINSONS PLACE ANGELES)', 'PUERTO PRINCESA (SM CITY PUERTO PRINCESA)'
    ],
    province: ['Metro Manila', 'Abra', 'Agusan del Norte', 'Aklan', 'Albay', 'Batangas', 'Benguet', 'Bulacan', 'Cavite', 'Cebu', 'Davao del Sur', 'Iloilo', 'Laguna', 'Pampanga', 'Rizal', 'Zambales'],
    city: ['Paranaque City', 'Manila City', 'Quezon City', 'Makati City', 'Pasay City', 'Taguig City', 'Mandaluyong City', 'Pasig City', 'Muntinlupa City', 'Caloocan City', 'Cebu City', 'Davao City', 'Baguio City', 'Iloilo City', 'Cagayan de Oro City']
  };
  choices['field-30'] = choices.office;

  function addChoices() {
    Object.entries(choices).forEach(([id, options]) => {
      document.querySelectorAll(`select#${id}`).forEach((select) => {
        [...select.options].forEach((option) => {
          if (option.value.toLowerCase().startsWith('para') && option.textContent.includes('City')) {
            option.value = 'Paranaque City';
            option.textContent = 'Paranaque City';
          }
        });
        const existing = new Set([...select.options].map((option) => option.value));
        options.forEach((value) => {
          if (existing.has(value)) return;
          select.add(new Option(value, value));
          existing.add(value);
        });
      });
    });
  }

  function getGroup(control) {
    if (control.type === 'radio') {
      return [...document.querySelectorAll(`input[type="radio"][name="${CSS.escape(control.name)}"]`)];
    }
    return [control];
  }

  function getMessageTarget(control) {
    return control.closest('.field, .check, fieldset') || control.parentElement;
  }

  function setMessage(control, message) {
    const target = getMessageTarget(control);
    if (!target) return;
    let note = target.querySelector(`:scope > .${errorClass}`);
    if (!note) {
      note = document.createElement('small');
      note.className = errorClass;
      note.setAttribute('role', 'alert');
      target.append(note);
    }
    note.textContent = message;
    getGroup(control).forEach((item) => item.setAttribute('aria-invalid', 'true'));
  }

  function clearMessage(control) {
    const target = getMessageTarget(control);
    target?.querySelector(`:scope > .${errorClass}`)?.remove();
    getGroup(control).forEach((item) => item.removeAttribute('aria-invalid'));
  }

  function setCalendarMessage(picker, message) {
    let note = picker.querySelector(`:scope > .${errorClass}`);
    if (!note) {
      note = document.createElement('small');
      note.className = errorClass;
      note.setAttribute('role', 'alert');
      picker.append(note);
    }
    note.textContent = message;
    picker.querySelector('summary')?.setAttribute('aria-invalid', 'true');
  }

  function clearCalendarMessage(picker) {
    picker.querySelector(`:scope > .${errorClass}`)?.remove();
    picker.querySelector('summary')?.removeAttribute('aria-invalid');
  }

  function validate(control) {
    const group = getGroup(control);
    const checked = control.type === 'radio' ? group.some((item) => item.checked) : true;
    const valid = checked && control.checkValidity();
    if (valid) {
      clearMessage(control);
      return true;
    }
    const message = control.validity.valueMissing || !checked
      ? 'Please complete this field before continuing.'
      : control.validationMessage;
    setMessage(control, message);
    return false;
  }

  function validatePage() {
    const fields = [...document.querySelectorAll(`${controls}[required]`)];
    let firstInvalid;
    fields.forEach((control) => {
      if (!validate(control) && !firstInvalid) firstInvalid = control;
    });
    const picker = document.querySelector('.calendar-picker');
    if (picker && !picker.dataset.selectedDate) {
      setCalendarMessage(picker, 'Please select an appointment date before continuing.');
      if (!firstInvalid) firstInvalid = picker.querySelector('summary');
    }
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  function prepareControls() {
    document.querySelectorAll(controls).forEach((control) => {
      control.required = true;
      const label = control.type === 'radio'
        ? control.closest('fieldset')?.querySelector('legend')
        : control.labels?.[0];
      if (label && !label.textContent.trim().endsWith('*')) {
        const marker = document.createElement('span');
        marker.className = 'required-marker';
        marker.textContent = ' *';
        label.append(marker);
      }
      if (control.tagName === 'SELECT') {
        const prompt = document.createElement('option');
        prompt.value = '';
        prompt.textContent = 'Select an option';
        prompt.disabled = true;
        control.prepend(prompt);
        control.selectedIndex = 0;
      } else if (['text', 'email', 'tel', 'number', 'url'].includes(control.type) && control.value.trim()) {
        if (!control.placeholder) control.placeholder = control.value;
        control.value = '';
      }
    });
  }

  function init() {
    const styles = document.createElement('style');
    styles.textContent = '.field-error{display:block;color:#9a3412;font-size:13px;line-height:20px;margin-top:4px}.required-marker{color:#9a3412}.field [aria-invalid="true"],.check [aria-invalid="true"]{outline:2px solid #9a3412;outline-offset:2px}';
    document.head.append(styles);
    addChoices();
    prepareControls();

    const lookupAction = document.querySelector('.management button.disabled');
    if (lookupAction) {
      lookupAction.disabled = false;
      lookupAction.classList.remove('disabled');
      lookupAction.classList.add('primary');
      lookupAction.id = 'lookup-submit';
      lookupAction.type = 'button';
    }

    document.addEventListener('focusout', (event) => {
      const control = event.target;
      if (control.matches(`${controls}[required]`)) validate(control);
    });

    document.addEventListener('input', (event) => {
      const control = event.target;
      if (control.matches(`${controls}[required]`) && control.checkValidity()) clearMessage(control);
    });

    document.addEventListener('change', (event) => {
      const control = event.target;
      if (control.matches(`${controls}[required]`) && control.checkValidity()) clearMessage(control);
    });

    document.addEventListener('click', (event) => {
      const day = event.target.closest('.calendar-picker .day.available');
      if (day) {
        const picker = day.closest('.calendar-picker');
        const date = day.getAttribute('aria-label')?.replace(/, available$/, '');
        picker.dataset.selectedDate = date;
        picker.querySelectorAll('.day[aria-pressed]').forEach((item) => item.removeAttribute('aria-pressed'));
        day.setAttribute('aria-pressed', 'true');
        const dateLabel = picker.querySelector('summary span:last-child');
        if (dateLabel) dateLabel.textContent = date;
        clearCalendarMessage(picker);
        const next = document.querySelector('.actions button:disabled');
        if (next?.textContent.includes('Select date first')) {
          next.disabled = false;
          next.classList.add('primary');
          next.textContent = 'Continue';
        }
      }
      const continueAfterDate = event.target.closest('.actions button.primary');
      if (continueAfterDate && document.body.classList.contains('group')) {
        if (!validatePage()) {
          event.preventDefault();
          return;
        }
        window.location.href = 'group-personal.html';
      }
    });

    document.querySelectorAll('form').forEach((form) => {
      form.noValidate = true;
      form.addEventListener('submit', (event) => {
        if (!validatePage()) {
          event.preventDefault();
          return;
        }
        const nextPage = nextPages[location.pathname.split('/').pop()];
        if (nextPage) {
          event.preventDefault();
          window.location.href = nextPage;
        }
      });
    });

    document.addEventListener('click', (event) => {
      const action = event.target.closest('a.btn.primary, button.btn.primary');
      if (!action) return;
      if (!validatePage()) {
        event.preventDefault();
      } else if (action.id === 'lookup-submit') {
        window.location.href = 'appointment-details.html';
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
