(() => {
  const controls = 'input:not([type="hidden"]):not([type="search"]):not([type="submit"]):not([type="button"]), select, textarea';
  const errorClass = 'field-error';
  const storagePrefix = 'dfa-appointment:';
  const testingModeStorageKey = 'dfa-developer-testing-mode';
  const nextPages = {
    'applicant-family.html': 'application-contact.html',
    'application-contact.html': 'review-payment.html',
    'review-payment.html': 'payment-wallet.html',
    'group-personal.html': 'group-family.html',
    'group-family.html': 'group-application.html',
    'group-application.html': 'group-contact.html',
    'group-contact.html': 'group-contact-person.html',
    'group-contact-person.html': 'group-review.html',
    'group-review.html': 'group-payment-wallet.html'
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
  const officeDetails = {
    'DFA ASEANA': {
      address: 'Aseana Business Park, Bradco Avenue, Diosdado Macapagal Boulevard, Parañaque City'
    },
    'BAGUIO (SM CITY BAGUIO)': {
      address: 'SM City Baguio, Upper Basement, Luneta Hill, Upper Session Road corner Gov. Pack Road, Baguio City 2600',
      phone: '(074) 422-1465'
    },
    'CONSULAR OFFICE CENTRAL (ROBINSONS GALLERIA)': {
      address: 'Lower Ground Floor, Lingkod Pinoy Center, Robinsons Galleria, West Lane, EDSA corner Ortigas Avenue, Quezon City',
      phone: '(02) 8631-0806',
      hours: 'Monday to Friday, 8:00 AM to 5:00 PM'
    },
    'CONSULAR OFFICE EAST (SM MEGAMALL)': {
      address: '7th Floor, SM Megamall Building C, EDSA corner Julia Vargas Avenue, Mandaluyong City',
      phone: '(02) 8234-2478',
      hours: 'Monday to Friday, 8:00 AM to 5:00 PM'
    },
    'CONSULAR OFFICE NORTH (ROBINSONS NOVALICHES)': {
      address: '3rd Floor, Lingkod Pinoy Center Building B, Robinsons Novaliches, Quirino Highway, Barangay Pasong Putik, Quezon City',
      phone: '(02) 8372-7902',
      hours: 'Monday to Friday, 8:00 AM to 5:00 PM'
    },
    'CONSULAR OFFICE NORTHEAST (ALI MALL)': {
      address: 'Level 2, Ali Mall, Araneta City, Cubao, Quezon City',
      phone: '(02) 8293-0105',
      hours: 'Monday to Friday, 8:00 AM to 5:00 PM'
    },
    'CONSULAR OFFICE SOUTH (FESTIVAL MALL)': {
      address: '3rd Level, West Wing of Festival Mall, Alabang, Muntinlupa City',
      phone: '(02) 8551-1051',
      hours: 'Monday to Friday, 8:00 AM to 5:00 PM'
    },
    'CONSULAR OFFICE WEST (SM CITY MANILA)': {
      address: '5th Floor, SM City Manila, Natividad Almeda Lopez Street corner San Marcelino Street, Ermita, Manila',
      phone: '(02) 8536-9995',
      hours: 'Monday to Friday, 8:00 AM to 5:00 PM'
    }
  };

  function addChoices() {
    Object.entries(choices).forEach(([id, options]) => {
      const selector = id === 'city' ? 'select#city, select[id$="-contact-1"]' : `select#${id}`;
      document.querySelectorAll(selector).forEach((select) => {
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

  function updateSiteDetails() {
    const officeSelect = document.querySelector('#office');
    const section = [...document.querySelectorAll('section.chunk')].find((item) =>
      item.querySelector(':scope > h3')?.textContent.trim() === 'Site details'
    );
    if (!officeSelect || !section) return;

    let panel = section.querySelector('.site-details')
      || section.querySelector(':scope > .note')
      || section.querySelector(':scope > p');
    if (!panel) {
      panel = document.createElement('div');
      panel.setAttribute('aria-live', 'polite');
      section.append(panel);
    }
    if (panel.tagName !== 'P') section.querySelectorAll(':scope > p').forEach((item) => item.remove());
    panel.className = 'note site-details';
    panel.setAttribute('aria-live', 'polite');
    panel.replaceChildren();
    const officeName = officeSelect.value;
    if (!officeName) {
      const prompt = document.createElement('p');
      prompt.textContent = 'Select a consular office to view its details.';
      panel.append(prompt);
      return;
    }

    const heading = document.createElement('h4');
    heading.textContent = officeName;
    panel.append(heading);
    const details = officeDetails[officeName];
    if (!details) {
      const note = document.createElement('p');
      note.textContent = 'Check the official directory for current address and contact information.';
      const directory = document.createElement('a');
      directory.href = 'https://consular.dfa.gov.ph/directory-co/';
      directory.target = '_blank';
      directory.rel = 'noopener noreferrer';
      directory.textContent = 'DFA Consular Office Directory';
      panel.append(note, directory);
      return;
    }

    const address = document.createElement('p');
    address.textContent = `Office address: ${details.address}`;
    panel.append(address);
    if (details.phone) {
      const phone = document.createElement('p');
      phone.textContent = `Contact number: ${details.phone}`;
      panel.append(phone);
    }
    if (details.hours) {
      const hours = document.createElement('p');
      hours.textContent = `Office hours: ${details.hours}`;
      panel.append(hours);
    }
  }

  function getPageName() {
    return location.pathname.split('/').pop();
  }

  function getStoredValue(page, field) {
    try {
      const value = sessionStorage.getItem(`${storagePrefix}${page}:${field}`);
      return value === null ? null : JSON.parse(value);
    } catch {
      return null;
    }
  }

  function storeValue(page, field, value) {
    try {
      sessionStorage.setItem(`${storagePrefix}${page}:${field}`, JSON.stringify(value));
    } catch {
      return;
    }
  }

  function isLocalDevelopmentHost() {
    const hostname = location.hostname.toLowerCase();
    return location.protocol === 'file:' || hostname === 'localhost' || hostname.endsWith('.localhost')
      || hostname === '::1' || hostname === '[::1]' || /^127(?:\.\d{1,3}){3}$/.test(hostname)
      || hostname.endsWith('.test');
  }

  function isDeveloperTestingMode() {
    if (!isLocalDevelopmentHost()) return false;
    try {
      const requestedMode = new URLSearchParams(location.search).get('dfa-testing');
      if (requestedMode === '1') sessionStorage.setItem(testingModeStorageKey, 'enabled');
      if (requestedMode === '0') sessionStorage.removeItem(testingModeStorageKey);
      return sessionStorage.getItem(testingModeStorageKey) === 'enabled';
    } catch {
      return new URLSearchParams(location.search).get('dfa-testing') === '1';
    }
  }

  function addDeveloperTestingBanner() {
    if (!isDeveloperTestingMode()) return;
    const main = document.querySelector('main');
    if (!main) return;
    const banner = document.createElement('aside');
    banner.className = 'developer-testing-banner';
    banner.setAttribute('role', 'status');
    const message = document.createElement('span');
    message.textContent = 'DEVELOPER / TESTING MODE — Required-field validation is bypassed.';
    const exit = document.createElement('button');
    exit.type = 'button';
    exit.textContent = 'Exit testing mode';
    exit.addEventListener('click', () => {
      try {
        sessionStorage.removeItem(testingModeStorageKey);
      } catch {
        // Reload still exits when session storage is unavailable.
      }
      const url = new URL(location.href);
      url.searchParams.delete('dfa-testing');
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      location.reload();
    });
    banner.append(message, exit);
    const intro = main.querySelector('.intro');
    if (intro) intro.after(banner);
    else main.prepend(banner);
  }

  function clearAppointmentSession() {
    try {
      for (let index = sessionStorage.length - 1; index >= 0; index--) {
        const key = sessionStorage.key(index);
        if (key?.startsWith(storagePrefix)) sessionStorage.removeItem(key);
      }
    } catch {
      return;
    }
  }

  function saveControl(control) {
    if (!control.id && !control.name) return;
    if (control.type === 'radio' && !control.checked) return;
    const field = control.type === 'radio' ? control.name : control.id || control.name;
    const value = control.type === 'checkbox' ? control.checked : control.value;
    storeValue(getPageName(), field, value);
  }

  function saveVisibleControls() {
    document.querySelectorAll(controls).forEach(saveControl);
  }

  function restoreControls() {
    const page = getPageName();
    document.querySelectorAll(controls).forEach((control) => {
      if (page === 'book-appointment.html' && control.id === 'terms') return;
      if (!control.id && !control.name) return;
      const field = control.type === 'radio' ? control.name : control.id || control.name;
      const value = getStoredValue(page, field);
      if (value === null) return;
      if (control.type === 'radio') control.checked = control.value === value;
      else if (control.type === 'checkbox') control.checked = Boolean(value);
      else if (control.tagName !== 'SELECT') {
        control.value = typeof value === 'string' ? value.toUpperCase() : value;
      } else {
        const option = [...control.options].find((item) => item.value.toLowerCase() === String(value).toLowerCase());
        if (option) control.value = option.value;
      }
    });
  }

  function updateDatePicker(picker, date) {
    if (!picker || !date) return;
    picker.dataset.selectedDate = date;
    const summary = picker.querySelector('summary');
    if (summary) {
      summary.replaceChildren(document.createTextNode(date));
      summary.classList.add('has-selected-date');
      summary.setAttribute('aria-label', `Appointment date ${date}`);
    }
    const status = picker.parentElement.querySelector('.calendar-status');
    if (status) {
      status.textContent = `Selected date: ${date}.`;
      status.setAttribute('aria-live', 'polite');
    }
    const selectedDay = [...picker.querySelectorAll('.day.available')]
      .find((day) => day.getAttribute('aria-label')?.replace(/, available$/, '') === date);
    selectedDay?.setAttribute('aria-pressed', 'true');
    picker.open = false;
  }

  function updateAppointmentTime(date, clearSelection = false) {
    const select = document.querySelector('#appointment-time');
    if (!select) return;
    select.disabled = !date;
    if (clearSelection) {
      select.value = '';
      storeValue(getPageName(), 'appointment-time', '');
    }
    const savedTime = getStoredValue(getPageName(), 'appointment-time');
    if (date && savedTime && [...select.options].some((option) => option.value === savedTime)) {
      select.value = savedTime;
    }
  }

  function restoreDatePicker() {
    const picker = document.querySelector('.calendar-picker');
    const date = getStoredValue(getPageName(), 'appointment-date');
    if (!picker || !date) return;
    updateDatePicker(picker, date);
    updateAppointmentTime(date);
    const next = document.querySelector('.actions button:disabled');
    if (next?.textContent.includes('Select date first')) {
      next.disabled = false;
      next.classList.add('primary');
      next.textContent = 'Continue';
    }
  }

  function makeField(page, id) {
    return () => getStoredValue(page, id);
  }

  function makeBirthDate(page, monthId, dayId, yearId) {
    return () => {
      const month = getStoredValue(page, monthId);
      const day = getStoredValue(page, dayId);
      const year = getStoredValue(page, yearId);
      return month && day && year ? `${month} ${day}, ${year}` : null;
    };
  }

  function updateReviewSection(title, values) {
    const section = [...document.querySelectorAll('section.chunk')].find((item) =>
      item.querySelector(':scope > h3')?.textContent.trim().toLowerCase() === title.toLowerCase()
    );
    if (!section) return;
    const fields = new Map(Object.entries(values).map(([label, getter]) => [normalizeLabel(label), getter]));
    section.querySelectorAll('dt').forEach((term) => {
      const getter = fields.get(normalizeLabel(term.textContent));
      const definition = term.nextElementSibling;
      if (!getter || !definition) return;
      const value = getter();
      if (value !== null && value !== undefined) definition.textContent = String(value).trim() || 'Not provided';
    });
  }

  function updateReviewDetail(section, label, value) {
    if (!section) return;
    const list = section.querySelector('dl');
    if (!list) return;
    const existing = [...list.querySelectorAll('dt')].find((term) =>
      normalizeLabel(term.textContent) === normalizeLabel(label)
    );
    if (existing?.nextElementSibling) {
      existing.nextElementSibling.textContent = value || 'Not provided';
      return;
    }
    const row = document.createElement('div');
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.textContent = value || 'Not provided';
    row.append(term, detail);
    list.append(row);
  }

  function normalizeLabel(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function formatPeso(amount) {
    return `₱${amount.toLocaleString('en-US')}`;
  }

  function updatePaymentSummary() {
    const summary = document.querySelector('.pay-summary');
    if (!summary) return null;

    const processing = summary.querySelector('input[name="processing"]:checked')?.value || 'regular';
    const applicantsText = [...summary.querySelectorAll('.amount-row')]
      .find((row) => row.querySelector('span')?.textContent.trim() === 'Applicants')
      ?.querySelector('strong')?.textContent || '1';
    const applicants = Number.parseInt(applicantsText, 10) || 1;
    const feeRows = [...summary.querySelectorAll('.fee-lines .amount-row')];
    const feeRow = feeRows.find((row) => row.querySelector('span')?.textContent.includes('Passport fee'));
    const convenienceRow = feeRows.find((row) => row.querySelector('span')?.textContent.includes('Convenience fee'));
    const totalRow = summary.querySelector('.amount-row.total');
    const feePerApplicant = processing === 'expedited' ? 1200 : 950;
    const convenienceFee = Number.parseInt(convenienceRow?.querySelector('strong')?.textContent.replace(/\D/g, ''), 10) || 0;
    const total = feePerApplicant * applicants + convenienceFee;

    if (feeRow) feeRow.querySelector('strong').textContent = formatPeso(feePerApplicant);
    if (totalRow) totalRow.querySelector('strong').textContent = formatPeso(total);
    const selectedLabel = summary.querySelector('.selected-processing strong');
    if (selectedLabel) selectedLabel.textContent = `${processing === 'expedited' ? 'Expedited' : 'Regular'} processing`;
    storeValue('payment', 'processing', processing);
    storeValue('payment', 'applicants', applicants);
    storeValue('payment', 'total', total);
    return { processing, applicants, feePerApplicant, convenienceFee, total };
  }

  function updatePaymentProvider() {
    const providers = document.querySelector('.providers');
    const selected = providers?.querySelector('input[name="provider"]:checked');
    if (!selected) return;
    const caption = [...providers.parentElement.querySelectorAll('.caption')]
      .find((item) => item.textContent.trim().startsWith('SELECTED '));
    if (caption?.nextElementSibling) caption.nextElementSibling.textContent = selected.value;
    storeValue('payment', 'provider', selected.value);
  }

  function initializePayment() {
    if (!document.querySelector('.pay-summary')) return;
    const savedProcessing = getStoredValue('payment', 'processing');
    if (savedProcessing) {
      const option = document.querySelector(`.pay-summary input[name="processing"][value="${CSS.escape(savedProcessing)}"]`);
      if (option) option.checked = true;
    }
    const savedProvider = getStoredValue('payment', 'provider');
    if (savedProvider) {
      const option = document.querySelector(`.providers input[name="provider"][value="${CSS.escape(savedProvider)}"]`);
      if (option) option.checked = true;
    }
    updatePaymentProvider();
    updatePaymentSummary();
  }

  function startMerchantCheckout() {
    if (location.pathname.includes('/group/') && !validateStoredGroupApplicants()) return;
    const totals = updatePaymentSummary();
    if (!totals) return;
    const folder = location.pathname.split('/').slice(-2, -1)[0];
    const file = getPageName();
    const channel = file.includes('-bank') ? 'Online banking' : file.includes('-qr') ? 'QR payment' : 'E-wallet';
    const provider = document.querySelector('.providers input[name="provider"]:checked')?.value || 'QR Ph';
    storeValue('payment', 'mode', folder === 'group' ? 'group' : 'individual');
    storeValue('payment', 'channel', channel);
    storeValue('payment', 'provider', provider);
    storeValue('payment', 'return-url', `../${folder}/${file}`);
    storeValue('payment', 'confirmation-url', folder === 'group'
      ? '../group/group-confirmation.html'
      : '../individual/confirmation.html');
    window.location.href = '../other/payment-merchant.html';
  }

  function validateStoredGroupApplicants() {
    if (isDeveloperTestingMode()) return true;
    const count = Number(getStoredValue('group-booking', 'applicant-count')) || 2;
    const requiredValues = [];
    const leadFields = {
      'group-personal.html': ['given-name', 'last-name', 'middle-name', 'mobile', 'email', 'dob-month', 'dob-day', 'dob-year', 'sex', 'civil-status'],
      'group-family.html': ['field-42', 'field-43', 'field-44', 'field-45', 'field-46', 'field-47'],
      'group-application.html': ['application-type', 'citizenship', 'foreign-passport', 'emergency-name', 'emergency-mobile'],
      'group-contact.html': ['street', 'city', 'province', 'occupation']
    };
    Object.entries(leadFields).forEach(([page, fields]) => fields.forEach((field) => requiredValues.push([page, field])));
    const leadOccupation = String(getStoredValue('group-contact.html', 'occupation') || '').toUpperCase();
    if (leadOccupation !== 'STUDENT') requiredValues.push(['group-contact.html', 'office-phone']);
    if (leadOccupation === 'OTHERS') requiredValues.push(['group-contact.html', 'occupation-other']);
    requiredValues.push(['group-contact.html', 'postal-code']);
    for (let index = 2; index <= count; index++) {
      ['last', 'given', 'middle', 'dob-month', 'dob-day', 'dob-year', 'sex', 'civil-status']
        .forEach((suffix) => requiredValues.push(['group-personal.html', `applicant-${index}-${suffix}`]));
      ['family-0', 'family-1', 'family-2', 'family-3', 'family-4', 'family-5']
        .forEach((suffix) => requiredValues.push(['group-family.html', `applicant-${index}-${suffix}`]));
      ['application-0', 'application-1', 'application-2', 'application-3', 'foreign-passport']
        .forEach((suffix) => requiredValues.push(['group-application.html', `applicant-${index}-${suffix}`]));
      ['contact-0', 'contact-1', 'contact-2', 'contact-3', 'province', 'postal-code', 'occupation']
        .forEach((suffix) => requiredValues.push(['group-contact.html', `applicant-${index}-${suffix}`]));
      ['given', 'last'].forEach((suffix) => requiredValues.push(['group-contact-person.html', `group-member-${index}-${suffix}`]));
      const occupation = String(getStoredValue('group-contact.html', `applicant-${index}-occupation`) || '').toUpperCase();
      if (occupation !== 'STUDENT') requiredValues.push(['group-contact.html', `applicant-${index}-office-phone`]);
      if (occupation === 'OTHERS') requiredValues.push(['group-contact.html', `applicant-${index}-occupation-other`]);
    }
    const missing = requiredValues.find(([page, field]) => {
      const value = getStoredValue(page, field);
      return value === null || value === undefined || value === '' || value === false;
    });
    if (!missing) return true;
    let message = document.querySelector('#group-applicant-error');
    if (!message) {
      message = document.createElement('p');
      message.id = 'group-applicant-error';
      message.className = 'note field-error';
      message.setAttribute('role', 'alert');
      document.querySelector('.pay-summary')?.prepend(message);
    }
      message.replaceChildren(document.createTextNode('Some applicant information is incomplete. Complete the required fields for every applicant before payment. '));
      const link = document.createElement('a');
      link.href = 'group-personal.html#personal';
      link.textContent = 'Return to Group Personal Information';
      message.append(link);
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  function initializeMerchantPreview() {
    if (!document.body.classList.contains('merchant-preview')) return;
    const mode = getStoredValue('payment', 'mode') || 'individual';
    const provider = getStoredValue('payment', 'provider') || 'QR Ph';
    const channel = getStoredValue('payment', 'channel') || 'QR payment';
    const processing = getStoredValue('payment', 'processing') || 'regular';
    const applicants = getStoredValue('payment', 'applicants') || 1;
    const total = getStoredValue('payment', 'total') || 1000;
    const methodName = channel === 'QR payment' ? 'QR' : channel.toLowerCase();
    document.querySelector('#merchant-title').textContent = `${provider} checkout`;
    document.querySelector('#merchant-description').textContent = `Review the ${methodName} payment details before continuing.`;
    document.querySelector('#merchant-provider').textContent = `${provider} · ${channel}`;
    document.querySelector('#merchant-appointment').textContent = mode === 'group' ? 'Group appointment' : 'Individual appointment';
    document.querySelector('#merchant-applicants').textContent = `${applicants} applicant${applicants === 1 ? '' : 's'}`;
    document.querySelector('#merchant-processing').textContent = `${processing === 'expedited' ? 'Expedited' : 'Regular'} processing`;
    document.querySelector('#merchant-total').textContent = formatPeso(total);
    document.querySelector('#merchant-back').href = getStoredValue('payment', 'return-url') || '../individual/payment-wallet.html';
  }

  function configureLookupCode() {
    const control = document.querySelector('#appointment-code');
    if (!control) return;
    control.pattern = 'DFA-(IND|GRP)-[0-9]{4}-[0-9]{6}';
    control.maxLength = 19;
    control.placeholder = 'DFA-IND-2026-000001';
    control.title = 'Enter the appointment code shown on your confirmation.';
    control.autocomplete = 'off';
    control.dataset.characterRule = 'appointment-code';
  }

  function showLookupAlert(message) {
    const dialog = document.createElement('dialog');
    dialog.className = 'payment-reminder-dialog';
    dialog.setAttribute('aria-labelledby', 'lookup-alert-title');
    dialog.setAttribute('aria-describedby', 'lookup-alert-copy');
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = 'APPOINTMENT LOOKUP';
    const title = document.createElement('h2');
    title.id = 'lookup-alert-title';
    title.textContent = 'Appointment not found';
    const copy = document.createElement('p');
    copy.id = 'lookup-alert-copy';
    copy.setAttribute('role', 'alert');
    copy.textContent = message;
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.style.gridTemplateColumns = '1fr';
    const close = document.createElement('button');
    close.className = 'btn primary';
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', () => dialog.close());
    actions.append(close);
    dialog.append(eyebrow, title, copy, actions);
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
    close.focus();
  }

  const appointmentStoreKey = 'dfa-appointment-records:v1';
  const cancelledAppointmentStoreKey = 'dfa-cancelled-appointments:v1';

  function getAppointmentRecords() {
    try {
      const records = JSON.parse(localStorage.getItem(appointmentStoreKey) || '[]');
      return Array.isArray(records) ? records : [];
    } catch {
      return [];
    }
  }

  function saveAppointmentRecords(records) {
    try {
      localStorage.setItem(appointmentStoreKey, JSON.stringify(records));
    } catch {
      return;
    }
  }

  function getStoredPageValues(page) {
    const values = {};
    try {
      const prefix = `${storagePrefix}${page}:`;
      for (let index = 0; index < sessionStorage.length; index++) {
        const key = sessionStorage.key(index);
        if (key?.startsWith(prefix)) values[key.slice(prefix.length)] = JSON.parse(sessionStorage.getItem(key));
      }
    } catch {
      return values;
    }
    return values;
  }

  function collectGroupApplicantDetails(count) {
    const pages = ['group-personal.html', 'group-family.html', 'group-application.html', 'group-contact.html', 'group-contact-person.html'];
    const pageValues = Object.fromEntries(pages.map((page) => [page, getStoredPageValues(page)]));
    return Array.from({ length: count }, (_, offset) => {
      const number = offset + 1;
      const fields = {};
      pages.forEach((page) => {
        Object.entries(pageValues[page]).forEach(([name, value]) => {
          const belongsToApplicant = number === 1
            ? !/^applicant-\d+-/.test(name) && !/^group-member-\d+-/.test(name)
            : name.startsWith(`applicant-${number}-`) || name.startsWith(`group-member-${number}-`);
          if (belongsToApplicant && value !== null && value !== '') fields[name] = value;
        });
      });
      return { applicantNumber: number, fields };
    });
  }

  function ensureBaselineAppointments() {
    const records = getAppointmentRecords();
    let cancelledCodes = [];
    try {
      const storedCodes = JSON.parse(localStorage.getItem(cancelledAppointmentStoreKey) || '[]');
      if (Array.isArray(storedCodes)) cancelledCodes = storedCodes;
    } catch {
      cancelledCodes = [];
    }
    const defaults = [
      {
        code: 'DFA-IND-2026-000001',
        email: 'alex.reyes@example.com',
        mode: 'individual',
        url: 'appointment-details.html'
      },
      {
        code: 'DFA-GRP-2026-000001',
        email: 'alex.reyes@example.com',
        mode: 'group',
        url: '../group/group-appointment-details.html'
      }
    ];
    let changed = false;
    defaults.forEach((defaultRecord) => {
      if (!cancelledCodes.includes(defaultRecord.code) && !records.some((record) => record.code === defaultRecord.code)) {
        records.push(defaultRecord);
        changed = true;
      }
    });
    if (changed) saveAppointmentRecords(records);
  }

  function registerSubmittedAppointment() {
    const mode = getStoredValue('payment', 'mode') || 'individual';
    const prefix = mode === 'group' ? 'DFA-GRP' : 'DFA-IND';
    const year = new Date().getFullYear();
    const records = getAppointmentRecords();

    const page = mode === 'group' ? 'group-personal.html' : 'applicant-family.html';
    const email = (getStoredValue(page, 'email') || '').trim().toLowerCase();
    if (!email) return null;

    const existingNumbers = records
      .filter((record) => record.code?.startsWith(`${prefix}-${year}-`))
      .map((record) => Number.parseInt(record.code.split('-').pop(), 10))
      .filter((number) => Number.isFinite(number));
    const sequence = existingNumbers.length ? Math.max(...existingNumbers) + 1 : 1;
    const code = `${prefix}-${year}-${String(sequence).padStart(6, '0')}`;

    const officePage = mode === 'group' ? 'group-site.html' : 'appointment-schedule.html';
    const record = {
      code,
      email,
      mode,
      url: mode === 'group' ? '../group/group-appointment-details.html' : 'appointment-details.html',
      office: getStoredValue(officePage, 'office'),
      date: getStoredValue(officePage, 'appointment-date'),
      time: getStoredValue(officePage, 'appointment-time'),
      applicant: [
        getStoredValue(page, 'given-name'),
        getStoredValue(page, 'last-name')
      ].filter(Boolean).join(' '),
      mobile: getStoredValue(page, 'mobile'),
      applicants: getStoredValue('payment', 'applicants') || (mode === 'group' ? 2 : 1),
      ...(mode === 'group' ? { applicantDetails: collectGroupApplicantDetails(Number(getStoredValue('payment', 'applicants')) || 2) } : {}),
      processing: getStoredValue('payment', 'processing') || 'regular',
      total: getStoredValue('payment', 'total')
    };

    records.push(record);
    saveAppointmentRecords(records);
    storeValue('payment', 'appointment-code', code);
    return record;
  }

  function lookupAppointment() {
    ensureBaselineAppointments();
    const code = document.querySelector('#appointment-code').value.trim().toUpperCase();
    const email = document.querySelector('#lookup-email').value.trim().toLowerCase();
    const record = getAppointmentRecords().find((item) =>
      item.code?.trim().toUpperCase() === code &&
      (item.email || '').trim().toLowerCase() === email
    );

    if (!record) {
      showLookupAlert('We could not find an appointment matching that code and registered email. Check both details and try again.');
      return;
    }
    storeValue('lookup', 'appointment-code', code);
    storeValue('lookup', 'email', email);
    storeValue('lookup', 'record', record);
    window.location.href = record.url;
  }

  function cancelSelectedAppointment() {
    const status = document.querySelector('#cancellation-status');
    const button = document.querySelector('#cancel-appointment-confirm');
    const record = getStoredValue('lookup', 'record');
    const code = record?.code || getStoredValue('lookup', 'appointment-code');
    if (!code) {
      status.textContent = 'We could not identify the selected appointment. Look it up again before cancelling.';
      status.hidden = false;
      status.setAttribute('role', 'alert');
      return;
    }
    if (!window.confirm(`Cancel appointment ${code}? This cannot be undone.`)) return;

    button.disabled = true;
    let addedCancellationMarker = false;
    try {
      const records = JSON.parse(localStorage.getItem(appointmentStoreKey) || '[]');
      if (!Array.isArray(records)) throw new Error('Appointment records are unavailable.');
      const remaining = records.filter((item) => item.code !== code);
      if (remaining.length === records.length) {
        throw new Error('This appointment could not be found. It may already have been cancelled.');
      }
      const cancelledCodes = JSON.parse(localStorage.getItem(cancelledAppointmentStoreKey) || '[]');
      if (!Array.isArray(cancelledCodes)) throw new Error('Cancellation records are unavailable.');
      if (!cancelledCodes.includes(code)) {
        cancelledCodes.push(code);
        localStorage.setItem(cancelledAppointmentStoreKey, JSON.stringify(cancelledCodes));
        addedCancellationMarker = true;
      }
      localStorage.setItem(appointmentStoreKey, JSON.stringify(remaining));
      const savedRecords = JSON.parse(localStorage.getItem(appointmentStoreKey) || '[]');
      if (!Array.isArray(savedRecords) || savedRecords.some((item) => item.code === code)) throw new Error('The appointment could not be removed from storage.');

      storeValue('lookup', 'record', null);
      storeValue('lookup', 'appointment-code', null);
      document.querySelector('#dialog-title').textContent = 'Cancellation confirmed';
      status.className = 'note';
      status.textContent = `Appointment ${code} was successfully cancelled.`;
      status.hidden = false;
      status.setAttribute('role', 'status');
      button.hidden = true;
      const keepLink = document.querySelector('#keep-appointment');
      if (keepLink) {
        keepLink.href = 'view-appointment.html';
        keepLink.textContent = 'Return to View Appointment';
      }
      document.querySelector('.warning')?.setAttribute('hidden', '');
    } catch (error) {
      if (addedCancellationMarker) {
        try {
          const cancelledCodes = JSON.parse(localStorage.getItem(cancelledAppointmentStoreKey) || '[]');
          localStorage.setItem(cancelledAppointmentStoreKey, JSON.stringify(cancelledCodes.filter((item) => item !== code)));
        } catch {
          // Keep the original storage failure visible to the user.
        }
      }
      status.className = 'note field-error';
      status.textContent = error instanceof Error ? error.message : 'We could not cancel the appointment. Please try again.';
      status.hidden = false;
      status.setAttribute('role', 'alert');
      button.disabled = false;
    }
  }

  function updateAppointmentDetails() {
    if (getPageName() !== 'appointment-details.html' && getPageName() !== 'group-appointment-details.html') return;
    const code = getStoredValue('lookup', 'appointment-code');
    const email = getStoredValue('lookup', 'email');
    const record = getStoredValue('lookup', 'record');
    document.querySelectorAll('dt').forEach((term) => {
      const label = normalizeLabel(term.textContent);
      const detail = term.nextElementSibling;
      if (!detail) return;
      if (code && (label === 'appointmentcode' || label === 'groupappointmentcode')) detail.textContent = code;
      if (email && label === 'registeredemail') detail.textContent = email;
      if (record?.office && label === 'dfaoffice') detail.textContent = record.office;
      if (record?.date && label === 'appointmentdate') detail.textContent = record.date;
      if (record?.time && label === 'appointmenttime') detail.textContent = record.time;
      if (record?.applicant && (label === 'applicant' || label === 'primaryapplicantadultbooker' || label === 'applicant1bookingrepresentative')) detail.textContent = record.applicant;
      if (record?.mobile && label === 'contactnumber') detail.textContent = record.mobile;
      if (record?.processing && label === 'paymentstatus') detail.textContent = `Paid · ${record.processing === 'expedited' ? 'Expedited' : 'Regular'} processing`;
      if (record?.total && label === 'totalfees' || record?.total && label === 'totalgroupfees') detail.textContent = formatPeso(record.total);
    });
  }

  function finishMerchantPreview() {
    const record = registerSubmittedAppointment();
    storeValue('payment', 'status', 'demo-paid');

    const isGroup = getStoredValue('payment', 'mode') === 'group';
    const confirmationUrl = isGroup
      ? '../group/group-confirmation.html'
      : '../individual/confirmation.html';
    if (record) storeValue('payment', 'appointment-code', record.code);
    window.location.href = confirmationUrl;
  }

  function initializeConfirmation() {
    if (!document.querySelector('body.confirmation-screen')) return;
    ensureBaselineAppointments();
    const code = getStoredValue('payment', 'appointment-code');
    if (!code) return;
    const codeElement = document.querySelector('.code');
    if (codeElement) codeElement.textContent = code;
  }

  function updateReview() {
    const page = getPageName();
    const isGroup = page === 'group-review.html';
    if (page !== 'review-payment.html' && !isGroup) return;

    const schedulePage = isGroup ? 'group-site.html' : 'appointment-schedule.html';
    const datePage = isGroup ? 'group-site.html' : 'appointment-schedule.html';
    const personalPage = isGroup ? 'group-personal.html' : 'applicant-family.html';
    const familyPage = isGroup ? 'group-family.html' : 'applicant-family.html';
    const applicationPage = isGroup ? 'group-application.html' : 'application-contact.html';
    const contactPage = isGroup ? 'group-contact.html' : 'application-contact.html';
    const field = makeField;

    const scheduleValues = {
      REGION: field(schedulePage, 'region'),
      COUNTRY: field(schedulePage, 'country'),
      'DFA CONSULAR OFFICE': field(schedulePage, 'office'),
      'CONSULAR OFFICE': field(schedulePage, 'office'),
      'APPOINTMENT DATE': () => getStoredValue(datePage, 'appointment-date'),
      'APPOINTMENT TIME': () => getStoredValue(datePage, 'appointment-time')
    };
    updateReviewSection('Appointment schedule', scheduleValues);

    updateReviewSection('Personal information', {
      'FIRST NAME': field(personalPage, 'given-name'),
      'MIDDLE NAME': field(personalPage, 'middle-name'),
      'LAST NAME': field(personalPage, 'last-name'),
      'DATE OF BIRTH': makeBirthDate(personalPage, 'dob-month', 'dob-day', 'dob-year'),
      SEX: field(personalPage, 'sex'),
      'CIVIL STATUS': field(personalPage, 'civil-status'),
      'MOBILE NUMBER': field(personalPage, 'mobile'),
      'EMAIL ADDRESS': field(personalPage, 'email')
    });

    updateReviewSection('Family information', {
      'FATHER’S GIVEN NAME': field(familyPage, isGroup ? 'field-43' : 'field-12'),
      'FATHER’S MIDDLE NAME': field(familyPage, isGroup ? 'field-44' : 'field-13'),
      'FATHER’S LAST NAME': field(familyPage, isGroup ? 'field-42' : 'field-11'),
      'MOTHER’S GIVEN NAME': field(familyPage, isGroup ? 'field-46' : 'field-15'),
      'MOTHER’S MAIDEN MIDDLE NAME': field(familyPage, isGroup ? 'field-47' : 'field-16'),
      'MOTHER’S MAIDEN LAST NAME': field(familyPage, isGroup ? 'field-45' : 'field-14')
    });

    updateReviewSection('Application information', {
      'APPLICATION TYPE': field(applicationPage, 'application-type'),
      CITIZENSHIP: field(applicationPage, 'citizenship'),
      'FOREIGN PASSPORT HOLDER': field(applicationPage, 'foreign-passport'),
      'EMERGENCY CONTACT': field(applicationPage, 'emergency-name'),
      'EMERGENCY MOBILE': field(applicationPage, 'emergency-mobile')
    });

    updateReviewSection('Contact information', {
      'STREET AND BARANGAY': field(contactPage, 'street'),
      'CITY / MUNICIPALITY': field(contactPage, 'city'),
      PROVINCE: field(contactPage, 'province'),
      'POSTAL CODE': field(contactPage, 'postal-code'),
      OCCUPATION: () => {
        const occupation = getStoredValue(contactPage, 'occupation');
        const other = getStoredValue(contactPage, 'occupation-other');
        return occupation === 'OTHERS' && other ? `Others: ${other}` : occupation;
      },
      'OFFICE TELEPHONE': field(contactPage, 'office-phone')
    });

    if (isGroup) {
      const applicants = [...document.querySelectorAll('section.chunk')].find((item) =>
        item.querySelector(':scope > h3')?.textContent.trim() === 'Group applicants'
      );
      if (applicants) {
        const leadGiven = getStoredValue(personalPage, 'given-name');
        const leadLast = getStoredValue(personalPage, 'last-name');
        const memberGiven = getStoredValue('group-contact-person.html', 'group-member-2-given')
          || getStoredValue(personalPage, 'applicant-2-given');
        const memberLast = getStoredValue('group-contact-person.html', 'group-member-2-last')
          || getStoredValue(personalPage, 'applicant-2-last');
        const lead = [leadGiven, leadLast].filter(Boolean).join(' ');
        const member = [memberGiven, memberLast].filter(Boolean).join(' ');
        if (lead) applicants.querySelector('h4')?.replaceChildren(`Applicant 1 — ${lead}`);
        if (member) applicants.querySelector('.applicant-review-row p')?.replaceChildren(member);
      }

      const groupContact = 'group-contact-person.html';
      const contactDetails = [...document.querySelectorAll('section.chunk')].find((item) =>
        item.querySelector(':scope > h3')?.textContent.trim() === 'Contact information'
      );
      const contactName = [
        getStoredValue(groupContact, 'field-70'),
        getStoredValue(groupContact, 'field-71')
      ].filter(Boolean).join(' ');
      updateReviewDetail(contactDetails, 'GROUP CONTACT PERSON', contactName);
      updateReviewDetail(contactDetails, 'CONTACT MOBILE NUMBER', getStoredValue(groupContact, 'field-72'));
      updateReviewDetail(contactDetails, 'CONTACT EMAIL ADDRESS', getStoredValue(groupContact, 'field-73'));
    }
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

  function configureInput(control) {
    if (control.tagName !== 'INPUT' || !['text', 'email', 'tel', 'search'].includes(control.type)) return;
    const label = [...(control.labels || [])].map((item) => item.textContent).join(' ');
    const description = `${control.id} ${control.name} ${label}`.toLowerCase();
    if (control.type === 'email' || /\bemail\b/.test(description)) {
      control.type = 'email';
      control.inputMode = 'email';
      control.title = 'Enter a valid email address.';
      control.dataset.characterRule = 'email';
    } else if (control.type === 'tel' || /\b(phone|telephone|mobile|contact number)\b/.test(description)) {
      control.type = 'tel';
      control.inputMode = 'numeric';
      control.pattern = '[0-9]{7,15}';
      control.title = 'Enter 7 to 15 digits.';
      control.dataset.characterRule = 'digits';
    } else if (/\b(name|surname|contact person)\b/.test(description)) {
      control.inputMode = 'text';
      control.title = 'Use letters, spaces, apostrophes, periods, and hyphens only.';
      control.dataset.characterRule = 'name';
    }
  }

  function confirmBirthdate(disclosure) {
    const month = disclosure.querySelector('select[name$="-dob-month"], select[id$="dob-month"]');
    const day = disclosure.querySelector('select[name$="-dob-day"], select[id$="dob-day"]');
    const year = disclosure.querySelector('select[name$="-dob-year"], select[id$="dob-year"]');
    if (!month || !day || !year) return;

    if (!month.value || !day.value || !year.value) {
      const incomplete = !month.value ? month : !day.value ? day : year;
      incomplete.focus();
      const fields = disclosure.querySelector('.dob-content');
      let reminder = fields?.querySelector('.dob-reminder');
      if (!reminder && fields) {
        reminder = document.createElement('small');
        reminder.className = 'dob-reminder field-error';
        reminder.setAttribute('role', 'alert');
        fields.append(reminder);
      }
      if (reminder) reminder.textContent = 'Please select a month, day, and year.';
      return;
    }

    disclosure.querySelector('.dob-reminder')?.remove();

    const isPrimary = disclosure.querySelector('select[id="dob-month"]');
    if (isPrimary) {
      const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
      const birthYear = Number.parseInt(year.value, 10);
      const birthMonth = months.indexOf(month.value.toUpperCase());
      const birthDay = Number.parseInt(day.value, 10);
      const today = new Date();
      let age = today.getFullYear() - birthYear;
      if (today.getMonth() < birthMonth || (today.getMonth() === birthMonth && today.getDate() < birthDay)) age--;

      if (age < 18) {
        const fields = disclosure.querySelector('.dob-content');
        let reminder = fields?.querySelector('.dob-reminder');
        if (!reminder && fields) {
          reminder = document.createElement('small');
          reminder.className = 'dob-reminder dob-age-reminder';
          reminder.setAttribute('role', 'alert');
          reminder.setAttribute('aria-live', 'assertive');
          fields.append(reminder);
        } else {
          reminder.className = 'dob-reminder dob-age-reminder';
        }
        if (reminder) reminder.textContent = 'THE PRIMARY APPLICANT MUST BE AT LEAST 18 YEARS OLD.';
        disclosure.dataset.primaryUnderage = 'true';
        disclosure.open = true;
        return;
      }
      disclosure.dataset.primaryUnderage = 'false';
    }

    const value = `${month.value} ${day.value}, ${year.value}`;
    const summaryValue = disclosure.querySelector('#dob-value, [id$="-dob-value"]');
    if (summaryValue) summaryValue.textContent = value;
    disclosure.dataset.confirmedBirthdate = value;
    disclosure.open = false;

    disclosure.querySelectorAll('select').forEach((control) => {
      clearMessage(control);
      saveControl(control);
    });
  }

  function initializeBirthdates() {
    document.querySelectorAll('details.dob').forEach((disclosure) => {
      if (disclosure.querySelector('.dob-confirm')) return;
      const content = disclosure.querySelector('.dob-content');
      if (!content) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn secondary dob-confirm';
      button.textContent = 'Confirm';
      button.addEventListener('click', () => confirmBirthdate(disclosure));
      content.append(button);

      disclosure.querySelectorAll('select').forEach((control) => {
        control.addEventListener('change', () => {
          disclosure.querySelector('.dob-reminder')?.remove();
          saveControl(control);
        });
      });

      const month = disclosure.querySelector('select[id$="dob-month"]');
      const day = disclosure.querySelector('select[id$="dob-day"]');
      const year = disclosure.querySelector('select[id$="dob-year"]');
      if (month?.value && day?.value && year?.value) {
        disclosure.dataset.confirmedBirthdate = `${month.value} ${day.value}, ${year.value}`;
        const summaryValue = disclosure.querySelector('#dob-value, [id$="-dob-value"]');
        if (summaryValue) summaryValue.textContent = disclosure.dataset.confirmedBirthdate;
      }
    });
  }

  function filterInput(control) {
    const original = control.value;
    let filtered = original;
    const rule = control.dataset.characterRule;

    if ((control.tagName === 'INPUT' && ['text', 'email', 'tel', 'search'].includes(control.type)) || control.tagName === 'TEXTAREA') {
      filtered = filtered.toUpperCase();
    }

    if (rule === 'digits') {
      filtered = filtered.replace(/\D/g, '').slice(0, 15);
    } else if (rule === 'name') {
      filtered = filtered.replace(/[^\p{L}\p{M} .'-]/gu, '').replace(/\s{2,}/g, ' ');
    } else if (rule === 'appointment-code') {
      filtered = filtered.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 19);
    }

    if (filtered === original) return;
    const position = control.selectionStart;
    control.value = filtered;
    if (position !== null) {
      const removed = original.length - filtered.length;
      control.setSelectionRange(Math.max(0, position - removed), Math.max(0, position - removed));
    }
  }

  function validate(control, showRequiredState = false) {
    const group = getGroup(control);
    const checked = control.type === 'radio' ? group.some((item) => item.checked) : true;
    const valid = checked && control.checkValidity();
    if (valid) {
      clearMessage(control);
      return true;
    }
    if (!showRequiredState) {
      clearMessage(control);
      return false;
    }
    const message = control.validity.valueMissing || !checked
      ? 'Please complete this field before continuing.'
      : control.validationMessage;
    setMessage(control, message);
    return false;
  }

  function validatePage() {
    if (isDeveloperTestingMode()) return true;
    const primaryBirthdate = document.querySelector('details.dob select[id="dob-month"]')?.closest('details.dob');
    if (primaryBirthdate?.dataset.primaryUnderage === 'true') {
      primaryBirthdate.open = true;
      primaryBirthdate.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primaryBirthdate.querySelector('select[id$="dob-month"]')?.focus();
      return false;
    }

    const fields = [...document.querySelectorAll(`${controls}[required]`)];
    let firstInvalid;
    fields.forEach((control) => {
      if (!validate(control, true) && !firstInvalid) firstInvalid = control;
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
      configureInput(control);
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

  function updateOccupationFields() {
    document.querySelectorAll('#occupation, select[id$="-occupation"]').forEach((occupation) => {
      const prefix = occupation.id === 'occupation' ? '' : occupation.id.replace(/occupation$/, '');
      const officePhone = document.getElementById(`${prefix}office-phone`);
      const officePhoneField = document.getElementById(`${prefix}office-phone-field`);
      const otherOccupation = document.getElementById(`${prefix}occupation-other`);
      const otherOccupationField = document.getElementById(`${prefix}occupation-other-field`);
      const isStudent = occupation.value === 'STUDENT';
      const isOther = occupation.value === 'OTHERS';
      if (officePhone) {
        officePhone.required = !isStudent;
        officePhone.disabled = isStudent;
        if (isStudent) clearMessage(officePhone);
      }
      if (officePhoneField) officePhoneField.hidden = isStudent;
      if (otherOccupation) {
        otherOccupation.required = isOther;
        otherOccupation.disabled = !isOther;
        if (!isOther) clearMessage(otherOccupation);
      }
      if (otherOccupationField) otherOccupationField.hidden = !isOther;

      [[officePhone, isStudent], [otherOccupation, !isOther]].forEach(([control, remove]) => {
        const label = control?.labels?.[0];
        const marker = label?.querySelector('.required-marker');
        if (remove) marker?.remove();
        else if (label && !marker) {
          const requiredMarker = document.createElement('span');
          requiredMarker.className = 'required-marker';
          requiredMarker.textContent = ' *';
          label.append(requiredMarker);
        }
      });
    });
  }

  const groupApplicantLimit = 5;

  function clearApplicantValues(index) {
    try {
      const match = new RegExp(`(?:^|-)applicant-${index}(?:-|$)|(?:^|-)group-member-${index}(?:-|$)`);
      for (let position = sessionStorage.length - 1; position >= 0; position--) {
        const key = sessionStorage.key(position);
        if (key?.startsWith(storagePrefix) && match.test(key.slice(key.lastIndexOf(':') + 1))) {
          sessionStorage.removeItem(key);
        }
      }
    } catch {
      return;
    }
  }

  function createApplicantSection(template, index) {
    const section = template.cloneNode(true);
    const replacements = section.querySelectorAll('[id], [name], [for], [aria-labelledby], [aria-label]');
    [section, ...replacements].forEach((element) => {
      ['id', 'name', 'for', 'aria-labelledby', 'aria-label'].forEach((attribute) => {
        const value = element.getAttribute?.(attribute);
        if (value) element.setAttribute(attribute, value
          .replaceAll('applicant-2', `applicant-${index}`)
          .replaceAll('group-member-2', `group-member-${index}`)
          .replace(/Applicant 2/g, `Applicant ${index}`));
      });
    });
    section.dataset.applicantIndex = String(index);
    section.dataset.generatedApplicant = 'true';
    const heading = section.querySelector('h3');
    if (heading) heading.textContent = heading.textContent.replace(/Applicant 2/g, `Applicant ${index}`);
    section.querySelectorAll('.dob-confirm, .field-error, .required-marker').forEach((item) => item.remove());
    section.querySelectorAll('[aria-invalid]').forEach((item) => item.removeAttribute('aria-invalid'));
    section.querySelectorAll('input, textarea').forEach((control) => { control.value = ''; });
    section.querySelectorAll('select').forEach((control) => { control.selectedIndex = 0; });
    section.querySelectorAll('details.dob').forEach((disclosure) => {
      disclosure.open = false;
      delete disclosure.dataset.confirmedBirthdate;
      delete disclosure.dataset.primaryUnderage;
    });
    section.querySelectorAll('input, select, textarea').forEach((control) => {
      configureInput(control);
      control.required = true;
      const label = control.type === 'radio'
        ? control.closest('fieldset')?.querySelector('legend')
        : control.labels?.[0];
      if (control.required && label && !label.querySelector('.required-marker') && !label.textContent.trim().endsWith('*')) {
        const marker = document.createElement('span');
        marker.className = 'required-marker';
        marker.textContent = ' *';
        label.append(marker);
      }
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn secondary remove-applicant';
    remove.textContent = `Remove Applicant ${index}`;
    remove.setAttribute('aria-label', `Remove Applicant ${index}`);
    section.append(remove);
    return section;
  }

  function initializeGroupApplicants() {
    if (!location.pathname.includes('/group/')) return;
    let count = Number.parseInt(getStoredValue('group-booking', 'applicant-count'), 10);
    if (!Number.isFinite(count)) count = 2;
    count = Math.max(2, Math.min(groupApplicantLimit, count));
    const personalTemplate = document.querySelector('.additional > section.chunk');
    const namesTemplate = document.querySelector('#other-applicants > section.chunk');
    const manager = document.querySelector('.manager');

    function renderApplicants() {
      const personalRoot = document.querySelector('.additional');
      if (personalRoot && personalTemplate?.parentElement === personalRoot) {
        personalRoot.querySelectorAll('[data-generated-applicant="true"]').forEach((item) => item.remove());
        for (let index = 3; index <= count; index++) personalRoot.append(createApplicantSection(personalTemplate, index));
      }
      if (namesTemplate?.parentElement?.id === 'other-applicants') {
        const root = namesTemplate.parentElement;
        root.querySelectorAll('[data-generated-applicant="true"]').forEach((item) => item.remove());
        for (let index = 3; index <= count; index++) root.append(createApplicantSection(namesTemplate, index));
      }
      document.querySelectorAll('.remove-applicant').forEach((button) => {
        button.disabled = Number.parseInt(button.closest('[data-applicant-index]')?.dataset.applicantIndex, 10) !== count;
      });
      document.querySelectorAll('.manager').forEach((item) => {
        const total = item.querySelector('.manager-header strong');
        if (total) total.textContent = `${count} applicants`;
        const [add, remove] = item.querySelectorAll('.manager-actions button');
        if (add) {
          add.disabled = count >= groupApplicantLimit;
          add.removeAttribute('aria-label');
          add.textContent = count >= groupApplicantLimit ? 'Maximum 5 Applicants' : '+ Add 1 Applicant';
        }
        if (remove) {
          remove.disabled = count <= 2;
          remove.textContent = count <= 2 ? 'Minimum 2 applicants' : '− Remove 1 Applicant';
          remove.setAttribute('aria-label', count <= 2 ? 'Minimum 2 applicants' : 'Remove the last additional applicant');
        }
      });
      const overviewCount = [...document.querySelectorAll('section.chunk dt')]
        .find((term) => normalizeLabel(term.textContent) === 'applicants')?.nextElementSibling;
      if (overviewCount) overviewCount.textContent = `${count} applicants`;
      const paymentCount = [...document.querySelectorAll('.pay-summary .amount-row')]
        .find((row) => row.querySelector('span')?.textContent.trim() === 'Applicants')?.querySelector('strong');
      if (paymentCount) paymentCount.textContent = `${count} applicants`;
      storeValue('payment', 'applicants', count);
      storeValue('group-booking', 'applicant-count', count);
      if (document.querySelector('.pay-summary')) updatePaymentSummary();
    }

    renderApplicants();
    if (manager) {
      manager.addEventListener('click', (event) => {
        const buttons = manager.querySelectorAll('.manager-actions button');
        if (event.target.closest('.manager-actions button') === buttons[0] && count < groupApplicantLimit) count++;
        else if (event.target.closest('.manager-actions button') === buttons[1] && count > 2) {
          clearApplicantValues(count);
          count--;
        } else return;
        renderApplicants();
        initializeBirthdates();
        updateOccupationFields();
      });
    }

    document.addEventListener('click', (event) => {
      const remove = event.target.closest('.remove-applicant');
      if (!remove || count <= 2) return;
      clearApplicantValues(count);
      count--;
      renderApplicants();
      initializeBirthdates();
      updateOccupationFields();
    });

    if (document.body.classList.contains('review-screen') || getPageName() === 'group-review.html') {
      const applicantsSection = [...document.querySelectorAll('section.chunk')].find((item) =>
        item.querySelector(':scope > h3')?.textContent.trim() === 'Group applicants'
      );
      const memberRow = applicantsSection?.querySelector('.applicant-review-row');
      if (applicantsSection && memberRow) {
        applicantsSection.querySelectorAll('[data-generated-applicant="true"]').forEach((item) => item.remove());
        const secondGiven = getStoredValue('group-contact-person.html', 'group-member-2-given');
        const secondLast = getStoredValue('group-contact-person.html', 'group-member-2-last');
        memberRow.querySelector('p').textContent = [secondGiven, secondLast].filter(Boolean).join(' ') || 'Name entered in Group Contact Information';
        for (let index = 3; index <= count; index++) {
          const row = memberRow.cloneNode(true);
          row.dataset.generatedApplicant = 'true';
          row.querySelector('strong').textContent = `Applicant ${index}`;
          const given = getStoredValue('group-contact-person.html', `group-member-${index}-given`);
          const last = getStoredValue('group-contact-person.html', `group-member-${index}-last`);
          row.querySelector('p').textContent = [given, last].filter(Boolean).join(' ') || 'Name entered in Group Contact Information';
          applicantsSection.insertBefore(row, applicantsSection.querySelector('.edit'));
        }
      }
    }
  }

  function init() {
    const styles = document.createElement('style');
    styles.textContent = 'input[type="text"],input[type="email"],input[type="tel"],input[type="search"],textarea{text-transform:uppercase}[hidden]{display:none!important}.field-error{display:block;color:#9a3412;font-size:13px;line-height:20px;margin-top:4px}.required-marker{color:#9a3412}.field [aria-invalid="true"],.check [aria-invalid="true"]{outline:2px solid #be2338;outline-offset:2px;border:2px solid #be2338!important}.field [aria-invalid="true"]:focus-visible,.check [aria-invalid="true"]:focus-visible{outline:3px solid #266fab;outline-offset:3px;border:2px solid #be2338!important}.developer-testing-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 20px;padding:14px 18px;border:2px solid #a15c00;border-radius:8px;background:#fff4d6;color:#633900;font-weight:700}.developer-testing-banner button{padding:8px 12px;border:1px solid #633900;border-radius:6px;background:white;color:#633900;font:inherit;cursor:pointer}';
    document.head.append(styles);
    addChoices();
    prepareControls();
    configureLookupCode();
    initializeGroupApplicants();
    ensureBaselineAppointments();
    restoreControls();
    updateOccupationFields();
    initializeBirthdates();
    updateSiteDetails();
    restoreDatePicker();
    updateReview();
    updateAppointmentDetails();
    initializeConfirmation();
    initializePayment();
    initializeMerchantPreview();
    addDeveloperTestingBanner();

    const cancelButton = document.querySelector('#cancel-appointment-confirm');
    if (cancelButton) {
      const selectedCode = getStoredValue('lookup', 'record')?.code || getStoredValue('lookup', 'appointment-code');
      const codeElement = document.querySelector('#cancel-appointment-code');
      if (selectedCode && codeElement) codeElement.textContent = selectedCode;
      cancelButton.addEventListener('click', cancelSelectedAppointment);
    }

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
      if (control.matches(`${controls}[required]`) && control.checkValidity()) clearMessage(control);
    });

    document.addEventListener('input', (event) => {
      const control = event.target;
      filterInput(control);
      saveControl(control);
      if (control.matches(`${controls}[required]`) && control.checkValidity()) clearMessage(control);
    });

    document.addEventListener('change', (event) => {
      const control = event.target;
      saveControl(control);
      if (control.matches('#office')) updateSiteDetails();
      if (control.matches('#occupation, select[id$="-occupation"]')) updateOccupationFields();
      if (control.name === 'processing') updatePaymentSummary();
      if (control.name === 'provider') updatePaymentProvider();
      if (control.matches(`${controls}[required]`) && control.checkValidity()) clearMessage(control);
    });

    window.addEventListener('pagehide', saveVisibleControls);

    document.addEventListener('click', (event) => {
      const day = event.target.closest('.calendar-picker .day.available');
      if (day) {
        const picker = day.closest('.calendar-picker');
        const date = day.getAttribute('aria-label')?.replace(/, available$/, '');
        picker.querySelectorAll('.day[aria-pressed]').forEach((item) => item.removeAttribute('aria-pressed'));
        day.setAttribute('aria-pressed', 'true');
        const summary = picker.querySelector('summary');
        const previousDate = getStoredValue(getPageName(), 'appointment-date');
        updateDatePicker(picker, date);
        storeValue(getPageName(), 'appointment-date', date);
        updateAppointmentTime(date, Boolean(previousDate && previousDate !== date));
        clearCalendarMessage(picker);
        summary?.focus();
        const next = document.querySelector('.actions button:disabled');
        if (next?.textContent.includes('Select date first')) {
          next.disabled = false;
          next.classList.add('primary');
          next.textContent = 'Continue';
        }
      }
    });

    const timeSelect = document.querySelector('#appointment-time');
    if (timeSelect) {
      timeSelect.addEventListener('change', () => {
        storeValue(getPageName(), 'appointment-time', timeSelect.value);
      });
    }

    document.querySelectorAll('form').forEach((form) => {
      form.noValidate = true;
      form.addEventListener('submit', (event) => {
        saveVisibleControls();
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
      const startBooking = event.target.closest('.gateway .type-buttons a');
      if (startBooking) {
        if (!validatePage()) {
          event.preventDefault();
          return;
        }
        clearAppointmentSession();
      }
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('.dob-confirm')) return;

      const dismissReminder = event.target.closest('#payment-reminder-back');
      if (dismissReminder) {
        event.preventDefault();
        document.querySelector('#payment-reminder')?.close();
        return;
      }
      const action = event.target.closest('a.btn.primary, button.btn.primary');
      if (!action) return;
      if (action.id === 'merchant-confirm') {
        event.preventDefault();
        document.querySelector('#payment-reminder')?.showModal();
        document.querySelector('#payment-reminder-accept')?.focus();
        return;
      }
      if (action.id === 'payment-reminder-accept') {
        event.preventDefault();
        document.querySelector('#payment-reminder')?.close();
        finishMerchantPreview();
        return;
      }
      saveVisibleControls();
      if (!validatePage()) {
        event.preventDefault();
      } else if (action.id === 'lookup-submit') {
        event.preventDefault();
        lookupAppointment();
      } else if (action.closest('.pay-summary')) {
        event.preventDefault();
        startMerchantCheckout();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
