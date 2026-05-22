# Project Evaluations

This directory contains the code for the public dashboard and the data showed in it. The dashboard was built using Vite and React, and the data is stored in JSON files. The production dashboard can be found at [https://private-transfers.pse.dev/](https://private-transfers.pse.dev/)

# Setup

```bash

# 1. Clone the repository
git clone https://github.com/privacy-ethereum/private-transfers-benchmarks

# 2. install dependencies
cd private-transfers-benchmarks
pnpm install

# 3. Navigate to the specific directory
cd project-evaluations

# 4. Start the web server to view the dashboard and data
pnpm run dev
```

# Adding Placeholder Projects

The dashboard auto-loads every JSON file inside `src/data/evaluations/`.

To showcase a project that is not fully analyzed yet, add a file like `src/data/evaluations/PROJECT_NAME.json` with `status` set to `pending`.

```json
{
  "id": "project-name",
  "title": "Project Name",
  "description": "Short description of the protocol and why it is listed.",
  "status": "pending",
  "documentation": "",
  "categories": ["Shielded Pool"],
  "properties": [],
  "sourceUrls": []
}
```

Behavior:

- Pending projects are visible in Category Browser and Protocol Profiles.
- Pending projects are excluded from Scorecard comparisons until analyzed.
- Once analysis is ready, change `status` to `complete` (or remove it, defaults to `complete`) and populate `properties`.
