# Cheat sheet — quick guide to start using Speckit (Spec Driven Development for GitHub) on your workflow

_Dayan.developer · May 13, 2026_

[medium.com/@dayan.developer/cheat-sheet-quickly-guide-to-start-speckit-spec-driven-development-for-github-on-your-workflow-c2d950dcadad](https://medium.com/@dayan.developer/cheat-sheet-quickly-guide-to-start-speckit-spec-driven-development-for-github-on-your-workflow-c2d950dcadad)

---

This morning, I want to share this short cheat sheet to help me — and maybe help you — implement this tool in your daily work. Of course, there are some features that I will add later to achieve more effective code.

> **What is Speckit?
> **An open source toolkit that allows you to focus on product scenarios and predictable outcomes instead of vibe coding every piece from scratch.Spec-Driven Development: specifications become executable, directly generating working implementations rather than just guiding them.

But for now, let’s focus on Spekit

**Step 1-** install uv tool here [https://github.com/github/spec-kit/blob/main/docs/install/uv.md](https://github.com/github/spec-kit/blob/main/docs/install/uv.md)

**Step 2-** check this link to see the lastest version: [https://github.com/github/spec-kit/releases](https://github.com/github/spec-kit/releases)

**Step 3-** install spekit

```
uv tool install specify-cli - from git+https://github.com/github/spec-kit.git@vX.Y.Z
```

**Step 4-** Init on a new project or in a existing project

```
# Create new project
specify init <PROJECT\_NAME> \# Or initialize in existing project
specify init . --integration copilot
\# or
specify init --here --integration copilot \# Check installed tools
specify check
```

**Step 5- Start terminal:** Now open the shell and type

```
specify init . --integration claude #your#your model
```

**Step 6- /speckit.constitution:** first step is write a prompt for the constitution, What is the constitution?

> In AI, a **“constitution”** is a set of principles, rules, and values that guide a model’s behavior to ensure its responses are safe, consistent, and aligned with ethical and business goals.
>
> \- development standards
>
> \- AI usage guidelines
>
> \- documentation guidelines
>
> \- UX/development best practices
>
> \- security and compliance policies

The constitution prompt: Create or update the project constitution from principles entered interactively or provided as arguments, ensuring that alldependent templates remain synchronized.

This is and example of constitution prompt:

This is where we spend most of our time. Now, let’s enter the next command with the prompt.

```
/speckit-constitution You are an AI assistant focused on backend API development.

Constitution:

1. API Consistency
- Follow RESTful conventions.
- Use clear endpoint naming and standardized response formats.

2. Data Validation
- Validate query params and request bodies.
- Prevent invalid pagination values.

3. Security
- Ensure endpoints are authenticated and authorized.
- Never expose sensitive user data.

4. Performance
- Use pagination for scalable responses.
- Optimize database queries and avoid unnecessary payloads.

5. Code Quality
- Prefer clean, maintainable, and typed code.
- Separate controller, service, and repository logic.

6. Error Handling
- Return meaningful HTTP status codes and error messages.
- Handle missing notifications and invalid IDs gracefully.

7. Documentation
- Include request examples, response shapes, and edge cases.
```

`This comand create: What is delivered upon execution

a. Updated Constitution — `.specify/memory/constitution.md` file with all [PLACEHOLDER] tokens replaced with concrete values: project name, principles, dates, semantic version.

b. Synchronization Impact Report — HTML comment at the beginning of the file with: version change (old → new), modified/added/deleted principles, status of updated templates (✅ / ⚠), and pending TODOs.

**Step 7- /speckit.specify:** Now is time to create the specify prompt, but firts What is a specify comand made for? Create or update a feature specification from anatural language description.

```
specify # Or /speckit-specify
```

**What it delivers upon execution**

1. Feature directory — Creates specs/<NNN></nnn>-<short-name></short>/ (e.g., specs/003-user-auth/) with automatic sequential numbering.

2. `spec.md` — Complete specification document based on the template, with:

    - Context and problem description
    - User stories / testing scenarios
    - Functional requirements (testable, without implementation details)
    - Measurable and technology-agnostic success criteria
    - Key entities (if data is involved)
    - Assumptions and dependencies

3. `checklists/requirements.md` — Specification quality checklist with validations for:

    - Completeness of requirements
    - Absence of implementation details
    - Measurable success criteria
    - Coverage of flows and edge cases

4. Updated `.specify/feature.json` — Saves the Active Directory path so that subsequent commands (/speckit-plan, /speckit-tasks, etc.) know where to look.

```
`/speckit-specify Create a feature specification for a notifications system that allows users to stay informed about important activity inside the platform.
The feature should help users:
 - View recent notifications
 - Identify unread notifications
 - Mark notifications as read individually or all at once
 - Improve visibility of user-related activity Include:
 - Feature overview
 - User goals
 - Business value
 - Expected user experience
 - Acceptance criteria
 - Edge cases
```

**Step 8- speckit-clarify:** Detects and reduces ambiguities or undefined decisions in the active specification, and records the clarifications directly in the spec.md file. With this comand ask you for 5 questions for clarify. Maximum 5 questions, one at a time, with:\- Highlighted recommended option with reasoning\- A/B/C choice table (or short answer ≤5 words)

```
/speckit-clarify
```

**Step 9- speckit-plan:** Generate the technical implementation plan from the active specification, making decisions about architecture, data model, and interface contracts.

What is delivered upon execution?

a. `plan.md` — Complete technical plan with:\- Selected technology stack and libraries\- Architecture and file structure\- Implementation phases\- Constitution Check (validation against project principles)\- Justified technical decisions

b. `research.md` — Research document that addresses all the NEEDS CLARIFICATION of the plan:\- Selected decision\- Justification\- Considered alternatives

c. `data-model.md` — Data model with:\- Entities, fields, and types\- Relationships\- Validation rules\- State transitions (if applicable)

d. `contracts/` — Interface contracts according to the project type:\- REST/GraphQL APIs → endpoint contracts\- CLI → command schemas\- Libraries → public function contracts

e. `quickstart.md`— Integration scenarios to guide testing and Onboarding

Here is how the comand look like:

```
/speckit-plan The endpoint must be GET /api/notifications?userId=&page=&limit\=
Returns a list of paginated notifications with shape:
  {
    "data": \[{ "id", "type", "message", "read", "createdAt" }\],
    "total": 40,
    "page": 1,
    "limit": 10
  }                                                                                                                                                    Mark as read: PATCH /api/notifications/:id/read
  Mark all: PATCH /api/notifications/read-all
```

**Step 10- speckit-task:** It generates a `tasks.md` file with actionable tasks, ordered by dependencies for the current feature, based on available design artifacts (such as spec.md and plan.md).

In short: it takes the existing plan/spec and turns it into a list of concrete, ordered tasks ready for implementation.

```
/speckit-task
```

**Step 11- speckit-analiyze:** It performs a consistency and quality analysis among the artifacts of the current spec — spec.md, plan.md, and tasks.md — without modifying anything.
```
/speckit-analyze
```

It is read-only: it checks that these three files are aligned with each other and reports any inconsistencies or quality issues it finds.When it finds inconsistencies ask you and give ways for resolves.

So far, we’ve seen the commands you can use, but you can run `analyze` multiple times if needed.

Every new file in the project MUST be read carefully, because that’s where you’ll spend most of your time: creating prompts and reviewing content.

If you read something that is wrong or could be improved, you can edit the file and tell the AI about the changes you made. You can also directly explain in the console what is wrong or what could be changed.

It’s an iterative process. Once all tasks are checked, and only then, you can run the `/speckit.implement` command. This command starts the coding phase, and then you just need a cup of coffee ☕️ and watch the magic happen 🪄(Or maybe not… because hopefully you already reviewed everything 👀)

```
/speckit-implement
```

Okay, this is a summary of Speckit’s main features. Today I’m working on seeing which scenarios this framework works best in. I’m trying to implement it in my daily work and see what modifications improve the code and the user experience.See you later!
