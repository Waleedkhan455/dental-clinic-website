# Zimal Dental Clinic And Implant Center — Website Project Specification

**Clinic Name:** Zimal Dental Clinic And Implant Center
**Location:** Mansehra, Pakistan
**Goal:** A professional, modern, mobile-friendly website for a dental clinic, with an integrated appointment system and two role-based panels (Doctor/Admin and Patient).

---

## 0. Project Instructions (for the developer)

You are the **senior full-stack engineer** on this project. You are responsible for building a complete, production-ready website end to end — frontend, backend, database, authentication, and both role-based panels.

**Design ownership**
- The UI design direction is yours to decide. Make deliberate, professional choices rather than defaulting to generic templates.
- **The clinic's colour theme is blue and white — this must be maintained throughout the site.** Blue is the primary/brand colour; white is the dominant background and breathing space. Neutral greys are acceptable as supporting tones.
- Aim for a clean, modern, and calm aesthetic appropriate for a healthcare brand — trustworthy, uncluttered, and reassuring.
- **Do not use colour gradients anywhere in the UI.** Use flat, solid colours only — solid blue, solid white, solid neutral greys. No gradient backgrounds, buttons, overlays, or text.

**Usability requirements**
- Forms must be clear, well-spaced, and easy to complete — especially the appointment booking form.
- The experience must be simple for **patients** (many of whom are non-technical) and efficient for **doctors** managing records and appointments daily.
- Mobile-first: the majority of patients will visit from a phone.
- Use clear labels, visible validation messages, sensible defaults, and obvious primary actions.
- Accessible: readable contrast against blue/white, keyboard-navigable, proper semantic markup.

**Code quality — write professional, well-engineered code**
- Write clean, production-grade code as a senior engineer would ship it — not quick prototype code.
- Use clear, descriptive names for variables, functions, components, and files.
- Keep components small and focused; extract reusable logic instead of duplicating it.
- Maintain a consistent, logical folder structure and coding style throughout.
- Separate concerns properly: UI, business logic, data access, and validation should not be tangled together.
- Handle errors and edge cases explicitly — never leave silent failures or unhandled promises.
- Validate on the server, not just the client.
- Add concise comments where the intent is non-obvious; avoid noisy or redundant comments.
- No dead code, no unused imports, no leftover console logs, no hardcoded secrets.
- Code should be readable and maintainable by another developer without explanation.

**Branding**
- The clinic name is **Zimal Dental Clinic And Implant Center** — use it consistently in the logo, page titles, meta tags, footer, and all patient-facing communication.

**Version control & GitHub**
- Repository owner: **https://github.com/Waleedkhan455**
- As soon as the initial project structure is complete (end of Phase 1), initialise Git, create the repository under the account above, and push the first commit.
- From that point on, **push the updated code to the repository after every completed module or phase** — not only at the end of the project.
- Use clear, descriptive commit messages that state what was completed (e.g. `feat: patient panel with read-only history`, `feat: doctor appointment management`).
- Commit the `.gitignore` first. Never commit `.env` files, secrets, connection strings, `node_modules`, or Python virtual environments.
- Confirm each push succeeded before starting the next phase.

**Scope**
- Build the full public website, the doctor/admin panel, and the patient panel as described in the sections below.
- Everything the doctor manages (services, team members, appointments, patient history) must be dynamic and reflected on the public site — no hardcoded content where the panel is meant to control it.

---

## 1. Key Message

> Zimal Dental Clinic And Implant Center — comprehensive dental care by experienced clinicians and faculty members affiliated with Ayub Medical College, offering specialized treatment in Dental Implants, Prosthodontics, and Orthodontics.

---

## 1.5 Tech Stack

This stack is fixed. Do not substitute frameworks or databases.

| Layer | Technology |
|---|---|
| Frontend | **Next.js** (React) |
| Backend | **FastAPI** (Python) |
| Database | **MongoDB** |
| Auth | JWT issued by FastAPI, verified on protected routes |
| Styling | Tailwind CSS (or equivalent utility CSS) — **flat colours only, no gradients** |

**Architecture**
- Next.js and FastAPI run as **two separate services**. Next.js handles all rendering and UI; FastAPI exposes a REST API and owns all business logic and database access.
- The frontend never talks to MongoDB directly — every read and write goes through the FastAPI API.
- Configure CORS on FastAPI to allow the Next.js origin.
- Keep the API base URL in an environment variable on the frontend.

**Backend conventions (FastAPI)**
- Use **Pydantic models** for all request and response schemas — validate every input.
- Use an async MongoDB driver (Motor or equivalent).
- Organise by routers: `auth`, `doctors`, `services`, `appointments`, `history`, `testimonials`, `gallery`.
- Return proper HTTP status codes and structured error responses.
- Enforce role checks (`doctor` vs `patient`) as a dependency on protected endpoints — never rely on the frontend to hide actions.
- Auto-generated OpenAPI docs should remain accurate and usable.

**Frontend conventions (Next.js)**
- Use the App Router with server components where sensible.
- Centralise API calls in a typed client layer rather than scattering `fetch` calls through components.
- Handle loading, empty, and error states on every data-driven view.
- Protect panel routes with middleware; redirect unauthenticated or wrong-role users.

**Database notes (MongoDB)**
- **MongoDB is already installed and running on the system.** Do not install it, do not set up a new server, and do not switch to a different database or an in-memory substitute. Connect to the existing local MongoDB instance and create this project's database inside it.
- Read the connection string from an environment variable (e.g. `MONGO_URI`, defaulting to the local instance). Never hardcode it.
- Verify the connection succeeds before building any feature that depends on it; if it fails, stop and report the error rather than working around it.
- Collections mirror the models in Section 7.
- Store references by ObjectId; index fields used for filtering (doctor, patient, appointment date, status).
- Do not store passwords in plain text — hash them.

---

## 2. Site Structure

| Page | Purpose |
|---|---|
| Home | About, doctors, services preview, testimonials, gallery, appointment form, contact |
| Services | Full service list |
| Service Detail | One sub-page per service (description + visit count) |
| Our Team | Doctor profiles and availability |
| Gallery | Clinic photos |
| Contact | Location, map, phone, WhatsApp |
| Book Appointment | Booking form with doctor selection |
| Login / Register | Auth entry for both panels |
| Doctor Panel | Admin dashboard (protected) |
| Patient Panel | Patient dashboard (protected) |

### Homepage Sections (in order)

1. About the Clinic
2. Meet Our Dentists
3. Services
4. Testimonials
5. Gallery
6. Appointment Form
7. Contact & Location

---

## 3. Our Team

### Dr. Safa Nawaz
- FCPS Prosthodontics
- Implantologist
- Assistant Professor, Ayub Medical College
- **Availability:** Fridays only

### Dr. Naveed Iqbal
- Orthodontist
- Lecturer, Ayub Medical College
- **Availability:** By prior appointment

### Dr. Haseeb Ahmad
- General Dental Practitioner
- **Availability:** Regular clinic hours

> Availability must be displayed on the team section **and** enforced in the booking flow (a patient cannot book Dr. Safa Nawaz on a non-Friday).

---

## 4. Services

Each service has a detail sub-page containing a description and the expected number of visits.

### 4.1 General Dentistry

#### Dental Checkups
A routine examination and professional cleaning help maintain healthy teeth and gums. Regular visits allow early detection of dental issues and removal of plaque and tartar buildup.
**Visits:** 1

#### Scaling & Polishing
Professional scaling and polishing removes plaque, tartar, and surface stains, leaving teeth clean and smooth.
**Visits:** 1

#### Fillings
Dental fillings restore teeth damaged by cavities or minor fractures. The decayed portion is removed and replaced with a durable filling material to restore function and appearance.
**Visits:** 1

#### Root Canal Treatment
A root canal treats infection or damage within the tooth's pulp. The infected tissue is removed, the canals are cleaned and sealed, and the tooth is preserved from extraction.
**Visits:** 1–3, depending on case complexity

#### Extractions
Tooth extraction involves the safe removal of a damaged, infected, or problematic tooth when it cannot be restored. The procedure is performed with patient comfort as a priority.
**Visits:** 1

#### Gum Disease Treatment
Periodontal treatment addresses gum infection and inflammation through deep cleaning and other therapies to restore gum health and prevent tooth loss.
**Visits:** 1–4, depending on disease severity

#### Wisdom Tooth Removal
Wisdom tooth extraction is performed when third molars are impacted, causing pain, infection, or crowding. The procedure helps protect adjacent teeth and maintain oral health.
**Visits:** 1 (plus follow-up if required)

### 4.2 Restorative & Prosthodontics

#### Crowns & Bridges
Crowns are custom-made caps placed over damaged or weakened teeth to restore strength, function, and aesthetics while protecting the remaining tooth structure.
**Visits:** 2 (preparation and placement)

#### Dentures
Dentures are removable prosthetic appliances designed to replace missing teeth and restore chewing ability, speech, and facial appearance.
**Visits:** 3–5

#### Dental Implants
Dental implants are a long-lasting solution for replacing missing teeth. A titanium implant is placed in the jawbone and, after healing, a custom-made crown is attached to restore function and appearance.
**Visits:** 3–5 over several months, depending on healing time

### 4.3 Orthodontics

#### Braces & Aligners
Orthodontic treatment corrects misaligned teeth and bite problems, improving both oral health and smile aesthetics.
**Visits:** Initial consultation plus regular adjustment/review visits over 6–24 months

### 4.4 Cosmetic Dentistry

#### Teeth Whitening
Professional teeth whitening safely removes stains and discoloration, helping patients achieve a brighter, more confident smile.
**Visits:** 1

#### Dental Veneers
Veneers are thin, custom-made porcelain or composite shells bonded to the front of teeth to enhance their color, shape, size, and overall appearance.
**Visits:** 2

#### Smile Makeover
A smile makeover combines multiple cosmetic and restorative dental treatments tailored to improve the appearance and function of your smile.
**Visits:** Varies by treatment plan, typically 2–6

### 4.5 Pediatric Dentistry

#### Children's Dental Care
Children's dental care focuses on preventive treatments, oral health education, and gentle management of developing teeth and gums.
**Visits:** Usually 1, with regular checkups every 6 months

---

## 5. Public Website Features

- Online appointment booking
- Doctor selection during booking
- Display of doctor availability
- WhatsApp booking button
- Patient testimonials
- Clinic gallery
- Fully mobile-responsive design

---

## 6. Panels & Roles

The application has **two role-based panels** behind authentication.

### 6.1 Doctor / Admin Panel

| Area | Capabilities |
|---|---|
| Patient History | Create, read, update, delete patient records and treatment history |
| Services | Add, edit, and remove services and their detail content |
| Team | Add, edit, and remove team members |
| Appointments | View, confirm, reschedule, cancel, and mark appointments complete |

**Details:**
- **Patient History** — full CRUD. Each record links to a patient, a doctor, a date, the treatment performed, notes, and optional attachments.
- **Services** — full CRUD on service name, category, description, and number of visits. Changes reflect immediately on the public Services page.
- **Team** — full CRUD on name, qualifications, role, availability, and photo. Changes reflect on the Meet Our Dentists section.
- **Appointments** — see all incoming bookings, filter by doctor/date/status, and change status.

### 6.2 Patient / User Panel

| Area | Capabilities |
|---|---|
| Appointments | Book an appointment and choose a preferred doctor; view own upcoming and past appointments |
| History | **View only** — cannot create, edit, or delete |

**Details:**
- Patients book for themselves only.
- Doctor selection is part of the booking form, constrained by that doctor's availability.
- Medical history is strictly read-only for patients.

### 6.3 Permission Matrix

| Action | Doctor | Patient |
|---|---|---|
| View patient history | All patients | Own only |
| Create/edit/delete history | Yes | No |
| Manage services | Yes | No |
| Manage team members | Yes | No |
| Manage all appointments | Yes | No |
| Book an appointment | Yes | Own only |

---

## 7. Suggested Data Models

**User** — id, name, email, phone, password_hash, role (`doctor` \| `patient`), created_at

**Doctor** — id, user_id, qualifications[], designation, availability_rule, photo_url, bio, is_active

**Service** — id, name, slug, category, description, visits_text, image_url, is_active

**Appointment** — id, patient_id, doctor_id, service_id, scheduled_at, status (`pending` \| `confirmed` \| `completed` \| `cancelled`), notes

**PatientHistory** — id, patient_id, doctor_id, appointment_id, treatment, notes, attachments[], created_at, updated_at

**Testimonial** — id, patient_name, message, rating, is_published

**GalleryImage** — id, image_url, caption, sort_order

---

## 8. Appointment Rules

- Dr. Safa Nawaz — bookable on **Fridays only**
- Dr. Naveed Iqbal — **appointment-based**, requires confirmation from the panel
- Dr. Haseeb Ahmad — bookable during **regular clinic hours**
- A booking starts as `pending` and becomes `confirmed` only after a doctor approves it
- Patients receive confirmation via WhatsApp or email

---

## 9. Non-Functional Requirements

- Mobile-first responsive layout
- Fast load times and optimized images
- Secure authentication with hashed passwords and role-based route guards
- Patient data treated as confidential; history accessible only to the owning patient and clinic doctors
- SEO basics: meta tags, semantic headings, local business schema for Mansehra

---

## 10. Build Plan — Phased TODO

Build this project **phase by phase**. Do not attempt the whole site in one pass.

**Rules for each phase:**
- Complete and verify one phase before starting the next.
- Tick each checkbox as it is finished.
- At the end of every phase, run the app, confirm it builds without errors, and report what was completed.
- **Commit and push to GitHub at the end of every phase.**
- If a phase depends on something missing from an earlier phase, go back and fix it before continuing.

### Phase 1 — Project Setup
- [ ] Initialise the Next.js frontend and the FastAPI backend as two separate services
- [ ] Connect FastAPI to the **existing local MongoDB instance** and confirm the connection before proceeding
- [ ] Configure CORS and frontend environment variables for the API base URL
- [ ] Set up folder structure for both services
- [ ] Configure the blue/white design system: colour tokens, typography scale, spacing — **flat colours, no gradients**
- [ ] Build shared layout — header, navigation, footer
- [ ] Build reusable UI primitives — button, input, select, card, modal, table, toast
- [ ] Confirm both services run cleanly and the frontend can reach a test API endpoint
- [ ] Add `.gitignore`, initialise Git, create the repo under https://github.com/Waleedkhan455, and **push the initial project structure**

### Phase 2 — Database & Models
- [ ] Define MongoDB collections and Pydantic schemas for User, Doctor, Service, Appointment, PatientHistory, Testimonial, GalleryImage
- [ ] Set up ObjectId references and indexes
- [ ] Seed initial data: three doctors, all services from Section 4, sample testimonials
- [ ] Build and verify read endpoints for each collection

- [ ] **Push to GitHub**

### Phase 3 — Authentication & Roles
- [ ] Registration and login for patients
- [ ] JWT issuance in FastAPI, password hashing, token verification
- [ ] `role` field with `doctor` and `patient`
- [ ] Role-check dependency on protected FastAPI endpoints
- [ ] Next.js middleware route guards — patients blocked from doctor panel and vice versa
- [ ] Logout, plus redirect to the correct panel after login
- [ ] Test both roles manually

- [ ] **Push to GitHub**

### Phase 4 — Public Website (Static Pages)
- [ ] Home: About the Clinic, Meet Our Dentists, Services preview, Testimonials, Gallery, Appointment Form, Contact & Location
- [ ] Services listing page, grouped by category
- [ ] Service detail sub-page (description + number of visits)
- [ ] Team page with qualifications and availability
- [ ] Gallery page
- [ ] Contact page with map, phone, and WhatsApp button
- [ ] All pages pull from the database, not hardcoded content
- [ ] Verify responsiveness on mobile

- [ ] **Push to GitHub**

### Phase 5 — Appointment Booking
- [ ] Booking form: name, phone, service, doctor, date, time, notes
- [ ] Doctor selection in the form
- [ ] Enforce availability rules (Dr. Safa Nawaz = Fridays only; Dr. Naveed Iqbal = requires confirmation)
- [ ] Prevent double-booking of the same slot
- [ ] New bookings save with status `pending`
- [ ] Validation and clear success/error feedback
- [ ] Confirmation message to the patient

- [ ] **Push to GitHub**

### Phase 6 — Patient Panel
- [ ] Dashboard with upcoming appointments
- [ ] Book an appointment from inside the panel
- [ ] View past appointments
- [ ] View own treatment history — **read-only, no edit or delete controls anywhere**
- [ ] Basic profile view/edit
- [ ] Confirm a patient cannot access another patient's data

- [ ] **Push to GitHub**

### Phase 7 — Doctor / Admin Panel
- [ ] Dashboard overview: today's appointments, pending requests, counts
- [ ] Appointments: list, filter by doctor/date/status, confirm, reschedule, cancel, mark complete
- [ ] Patient history: full create, read, update, delete
- [ ] Services: full create, read, update, delete — reflected live on the public site
- [ ] Team members: full create, read, update, delete — reflected live on the public site
- [ ] Testimonials and gallery management
- [ ] Confirm every change appears correctly on the public website

- [ ] **Push to GitHub**

### Phase 8 — Polish & Hardening
- [ ] Server-side validation on every form and endpoint
- [ ] Consistent error handling, loading states, and empty states
- [ ] Accessibility pass: contrast, keyboard navigation, labels, semantic HTML
- [ ] Image optimisation and performance check
- [ ] SEO: meta tags, page titles, local business schema for Mansehra
- [ ] Full responsive review on mobile, tablet, and desktop
- [ ] Re-test the permission matrix in Section 6.3 end to end
- [ ] **Final push to GitHub**
