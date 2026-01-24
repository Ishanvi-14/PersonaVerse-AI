# Project Structure Map

/
├── .kiro/                       # THE AI BRAIN (Immutable)
│   ├── steering/                # The 9 "Laws" we just wrote
│   ├── specs/                   # The 2 Blueprints (Reqs + Design)
│   └── hooks/                   # Automation (e.g., Brand Voice Guard)
├── backend/                     # AWS CLOUD LAYER
│   ├── infrastructure/          # AWS CDK (Bedrock, S3, DynamoDB)
│   ├── services/                # Core Python/Node.js Engines
│   │   └── persona-engine/      # (The Identity Logic)
│   │       └── __mocks__/       # Credit-saving dummy data
│   └── shared/                  # Global Types & Interfaces
├── frontend/                    # REACT 19 DASHBOARD
│   ├── components/              # Buttons, Cards, Sliders
│   ├── features/                # /persona-dna, /audience-mirror
│   └── hooks/                   # API Data Fetching
├── docs/                        # THE WINNING PITCH
│   ├── strategy.md              # Why we win Track 2
│   ├── demo.md                  # The "Mic Drop" Script
│   └── localization.md          # The "Sixer" Dictionary
└── README.md                    # The Judge's Entry Point