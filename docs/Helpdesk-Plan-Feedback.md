# Help Desk Support System — Feedback on Your Plan

**Team:** Helpdesk
**Document:** `docs/Help Desk Support System - Project Guid.md`
**Date:** 25 August 2026
**From:** Dzunisani Mongwe, Programme Lead

---

## What you did well

This is a strong piece of work. A few things stand out:

- You found the **root cause**, not just the symptoms: "there is no shared system
  of record". That one sentence explains every problem on your list.
- You grouped your requirements **by role**. That means you have already worked
  out who is allowed to do what, which is often only discovered much later.
- Your non-functional requirements can actually be checked. "Loads within a few
  seconds" and "no silent data loss" are testable. "Fast and reliable" would not be.
- You wrote an **assumptions** section. Very few teams remember to.
- Several of your acceptance criteria include what happens when things go wrong,
  not just when they go right. Two are especially good:
  - **US6 AC2** — two agents claim the same ticket, only the first wins.
  - **US3 AC2** — when someone opens another person's ticket, the system does not
    even reveal whether that ticket exists. That is real security thinking.

The changes below are about scope, not quality.

---

## 1. Your whole plan assumes IT. What about the other departments?

Section 1.1 says the problem makes it hard for **"the IT department"** to track
tickets. That is the only time a department is mentioned — and the client brief
never says IT.

In a growing company, employees raise requests with several teams:

| Department | Typical request |
|------------|-----------------|
| IT | Laptop broken, password reset, access to a system |
| HR | Payroll query, leave dispute, a complaint about a manager |
| Facilities | Aircon broken, access card lost, broken chair |
| Finance | Expense claim, invoice query |

This changes three things in your plan:

**FR5 becomes a privacy problem.** It says agents can view *all* submitted
requests. The moment HR requests are in the same system, an IT agent must not be
able to read a payroll query or a complaint about a manager. Agents should see
their **own department's** requests, not everything.

**Tickets need to reach the right team.** You have one queue that everyone claims
from. You need a queue per department, and a rule for what happens when a ticket
lands in the wrong one — someone must be able to move it.

**There is more than one manager.** Your plan has a single "Support Team Lead".
There would be an IT lead and an HR lead, and each should only see their own
department's tickets and reports.

You were already reaching for this. US14 says categories should "reflect company
organization". A **department** is who deals with the ticket. A **category** is
what the ticket is about, inside that department. IT might have categories like
hardware, software and access. You need both, not one doing two jobs.

---

## 2. Not all requests are the same kind

Right now every request is submitted the same way: title, description, category,
attachment. But these are very different jobs:

- **"Reset my password"** — needs a username. Takes two minutes.
- **"I need a new laptop"** — needs a reason, a cost, and **the manager's approval
  before anyone buys anything**.
- **"New employee starts on Monday"** — needs a start date, job title, which
  systems they need, a desk and equipment. It creates work for IT *and* Facilities.
- **"Query on my payslip"** — must only be seen by HR.

Two things follow from this.

**Different request types should ask for different information.** If the form only
ever asks for a title and description, agents will spend their day chasing people
for details that should have been asked for up front. This is the single most
useful feature you could add.

**Some requests need approval before work starts.** Your flow is claim → work →
resolve. A new laptop does not work like that. It needs a manager to approve it
first. Add an approval step for the request types that need one.

A simple way to think about it: some tickets are **"something is broken"** (fix it,
speed matters) and others are **"I want something"** (approve it, then provide it).
They are not the same and should not behave the same.

---

## 3. Nothing in your system is urgent

There is no priority anywhere in your document. That means "the whole office has
no internet" and "my mouse is slow" arrive in the same queue, looking the same.

Add a priority to every ticket, and a **target time** for each priority — for
example, high priority must get a first response within 2 hours and be resolved
within 1 day. Keep it simple, three levels is enough.

This also fixes something else. Your success criteria say managers should be able
to spot bottlenecks. Without a target time, no ticket is ever late, so no report
can show what is overdue. Priority is what makes your reports mean anything.

---

## 4. Your status list is not finished

Different parts of the document use different lists. Section 1.4 says Open, In
Progress, Resolved. FR7 adds "Waiting on Employee". US4 hints at reopening.

Agree one list and use it everywhere. A workable one:

`Open → In Progress → Waiting on Employee → Resolved → Closed`
plus `Cancelled` for withdrawn requests.

Two things worth knowing:

- **Resolved and Closed are different.** Resolved means the agent thinks it is
  fixed. Closed means the employee agreed, or enough time passed. You need both,
  or you cannot tell a real fix from a guess.
- **"Waiting on Employee" should stop the clock.** If your team is waiting for
  someone to reply, that time should not count against your response target.

---

## 5. Platform Admin — you have one administrator, you need three

Your Support Team Lead does everything an agent does, **plus** manage user accounts
and configure system settings. That is three different jobs wearing one hat.

| | Who they work for | What they manage |
|---|---|---|
| **Department Lead** | The client | Their own department — its agents, its queue, its categories and its reports |
| **System Admin** | The client | Creating departments, appointing department leads, user accounts and roles, priorities and target times |
| **Platform Admin** | Us, who build and run it | Creating the client's first System Admin account, platform settings, fixing access problems |

**The client creates their own departments.** When they open a Facilities desk, their
own System Admin adds it — they do not phone us. The only thing we ever create is the
very first account, so that somebody at the client has the power to create everyone
else.

Two reasons this split matters for you specifically.

**Who creates the first account?** Nothing can happen until departments and categories
exist and somebody has an account. Your plan has a manager who does all of this, but
nobody creates the manager. That first account is the only thing a Platform Admin ever
makes.

**Someone who reads tickets should not also control who may read tickets.** Once HR
requests are in the system, the person setting permissions must not be someone who
benefits from setting them loosely. That is why the System Admin is a separate job
from the Department Lead.

The rule: **the Platform Admin manages the system, not the data.** They can reset a
locked-out user's password. They must not be able to read an HR ticket. Add a record
of who did what and when, especially for Platform Admin actions.

---

## 6. Smaller fixes

- **US4 AC2 offers a choice.** It says the system "prevents new comments **or**
  reopens the ticket". An acceptance criterion cannot offer two options — in Week 8
  another team tests you against it and will not know which one to check. Pick one.
  Our suggestion: allow reopening for 5 days, after that it becomes a new ticket
  linked to the old one.
- **Attachments appear once and never again.** No size limit, no allowed file
  types, and no rule about who may open them. Attachments are the easiest way for
  private information to leak — someone attaches a payslip to a ticket. Add a line
  about this to your security section.
- **SSO is mentioned once in your assumptions and never explained.** Either commit
  to it or take it out.
- **Reporting is thin.** FR12 is counts per status and per agent. Once you have
  departments, request types and priority, managers will want counts per
  department, per request type, and a list of overdue tickets.

---

## 7. Put the work in phases

Your plan does not say what gets built first. With departments, request types and
priority added, it needs to. Do not cut anything — stage it:

| Phase | What is in it |
|-------|---------------|
| **Phase 1** — build first | Log in, submit a request with department and type, see my requests, department queues, claim, update status, comment, internal notes, resolve, basic counts |
| **Phase 2** — build next | Priority and target times, approval step, reassign, reports per department and type, notifications |
| **Phase 3** — later version | Self-help articles, submitting by email, satisfaction rating after resolution, trend reports |

Build Phase 1 so Phase 2 fits without starting again. In practice that means:
every ticket should already have a **department**, a **type** and a **priority**
field from the very first version, even if there is only one option in each list
to begin with.

---

## What to do next

1. Add departments to the stakeholders, requirements and permissions.
2. Fix FR5 — agents see their own department, not everything.
3. Add request types, and say which ones need approval first.
4. Add priority and target response times.
5. Agree one status list and use it everywhere.
6. Fix US4 AC2 so it says one thing.
7. Split the Support Team Lead into Department Lead, System Admin and Platform Admin.
8. Add the phase table.
9. Add a "who can do what" table — rows for Employee, Agent, Department Lead,
   System Admin, Platform Admin; a column for every action. You will use it again in Week 4.

The quality of your acceptance criteria is high — keep that standard as you add the
missing pieces.
