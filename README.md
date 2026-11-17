# DFA Passport Appointment System — Phase 1

Open index.html directly in a browser, or use VS Code Live Server. No installation, CDN or build step is required. All imagery, fonts and styles load locally.

The screens are static HTML/CSS with local JavaScript for browser-side required-field reminders, placeholder examples, location dropdown choices, and appointment-date selection. No installation, CDN or build step is required. Booking and payment are simulated; no information is sent to DFA.

## Design source

Figma HCI Group Project: Ii4q5GPJ5WO9i1HoOm2RpP. Every HTML screen records its source frame as data-figma-node. Page 3 is the source of truth. The connected four-step individual flow (162:129 → 164:129 → 164:413 → 165:129) supersedes older standalone eight-step form frames. Group forms remain separate. Page 2 supplies controls, Page 4 supplies focus color #9A3412, and Page 5 supplies tablet/laptop layout guidance.

## Screens

Homepage; booking gateway; terms and privacy; individual introduction; appointment location/date; individual applicant/family; individual application/contact; individual review/payment and final consent; group site, date, personal, family, application, residential/work contact, group contact, review and final consent; three merchant states each for individual and group (wallet, bank and QR); individual and group confirmation; appointment lookup; individual and group details; cancellation confirmation for each; cancellation result; requirements; advisories.

The group applicant manager initially shows two applicants, as in Figma. Add/remove behavior, server-side booking, fee calculation, and payment processing are not implemented. The lookup and cancellation screens remain prototype presentations.

Original Figma seal, icons, QR and building illustration are local in assets. Fonts are local Inter/Roboto variable TTF files from the Google Fonts repository; licenses are in assets/fonts. Reference screenshots are comparison material and are never used as screen backgrounds.

The cancellation dialog is represented as a standalone static page. No live booking, payment or cancellation occurs.


## Phase 1 checks and known differences

The original 34 screens were rendered in installed Chrome. Layout widths checked: 1440, 1280, 768, 390 and 320 CSS pixels. Screenshots and machine-readable results are in `.qa/`. Flow pages are grouped under `pages/homepage/`, `pages/individual/`, `pages/group/`, and `pages/other/`; shared CSS, images, icons and fonts remain under their existing root folders.

Remaining prototype limitations: native select and birthdate option menus vary by browser; the birthdate picker uses native month/day/year controls inside a details disclosure. The calendar exposes the static sample dates only. Cancellation is a standalone static presentation rather than a live overlay. Page 5 breakpoint layouts adapt the current Page 3 content; they do not replace that content with the older wording shown in some breakpoint studies. Advisory article details and requirement-category detail pages are outside the connected booking/management flow and are not implemented.

Required controls display a reminder when left blank or when a user tries to continue. Sample values are shown as placeholders rather than prefilled answers.

## Open screens

- [Index](index.html)
- [Homepage](pages/homepage/index.html)
- [Homepage booking gateway](pages/homepage/book-appointment.html)
- [Individual appointment screens](pages/individual/)
- [Group appointment screens](pages/group/)
- [Other task flows](pages/other/)

Flow-specific pages and scripts are organized under `pages/`.
