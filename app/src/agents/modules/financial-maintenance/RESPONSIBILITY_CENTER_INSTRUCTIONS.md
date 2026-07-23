# Responsibility Center Instructions

## Purpose

Responsibility Centers let Gr8Books Neo support SMEs that track performance across departments, branches, projects, business units, sales teams, warehouses, and similar operating units.

The module should support both standard accounting responsibility center types and user-defined responsibility center types. The target capability is multi-dimensional responsibility center tagging, where a transaction can carry more than one responsibility center at the same time without complicating the general ledger.

## Standard Responsibility Center Types

### Cost Center

A Cost Center tracks expenses only.

Examples:

- Accounting
- HR
- IT
- Admin
- Marketing
- Purchasing
- Warehouse
- Maintenance

Typical reports:

- Expenses by Department
- Budget vs Actual
- Department Expense Analysis

### Profit Center

A Profit Center tracks both revenue and expenses.

Examples:

- Branch A
- Branch B
- Online Store
- Retail Store
- Wholesale Division

Typical reports:

- Profit and Loss per Branch
- Sales by Profit Center
- Gross Profit Analysis

### Revenue Center

A Revenue Center tracks income only.

Examples:

- Sales Team A
- Sales Team B
- E-Commerce
- Call Center

Typical reports:

- Sales Performance
- Revenue by Team
- Commission Reports

### Investment Center

An Investment Center tracks revenue, expenses, and assets.

Examples:

- Manufacturing Plant
- Regional Office
- Business Unit

Typical reports:

- ROI
- Asset Utilization
- Return on Capital

## User-Defined Responsibility Center Types

Gr8Books Neo should allow unlimited user-defined responsibility center types. These types should be configurable by the user and usable across transaction entry and reporting.

Suggested examples:

| Type | Example Centers |
| --- | --- |
| Branch | Cavite, Laguna, Cebu |
| Department | HR, Accounting, Sales, IT |
| Project | Project Alpha, Project Beta |
| Division | Trading, Manufacturing, Distribution |
| Business Unit | Retail, Wholesale, Export |
| Outlet | SM Dasma, Robinsons Imus |
| Sales Territory | North Luzon, NCR, South Luzon, Visayas |
| Warehouse | Main Warehouse, Spare Parts Warehouse |
| Fleet | Truck 1, Truck 2 |

## Responsibility Center Type Setup

The setup screen should let users enable or define responsibility center types.

Suggested default types:

- Department
- Branch
- Project
- Business Unit
- Cost Center
- Profit Center
- Salesman
- Warehouse
- Division
- Region

The screen should support:

- Creating custom responsibility center types.
- Activating or deactivating a type.
- Preventing deletion of types already used in transactions.
- Sorting types for transaction entry display.
- Marking a type as required or optional when needed by company policy.

## Responsibility Center Master

The Responsibility Center master file should maintain the actual responsibility centers used by the company.

Suggested fields:

| Field | Example | Notes |
| --- | --- | --- |
| Code | SALES | Required unique code. |
| Description | Sales Department | Required display name. |
| Type | Department | Selected from Responsibility Center Types. |
| Parent | Operations | Optional hierarchy for rollup reporting. |
| Manager | Juan Dela Cruz | Optional person responsible. |
| Status | Active | Active or Inactive. |

Validation requirements:

- Code must be unique within the company.
- Type is required.
- Inactive centers should remain available in historical reports.
- Inactive centers should not be selectable in new transactions unless explicitly allowed.
- A parent center must not create a circular hierarchy.

## Transaction Entry

Every transaction should be able to assign one or more responsibility centers.

Example Sales Invoice tagging:

| Dimension | Center |
| --- | --- |
| Branch | Cavite |
| Department | Sales |
| Salesman | Pedro |
| Project | Mall Renovation |
| Business Unit | Retail |

This allows detailed management reporting without duplicate encoding or duplicate journal entries.

Transaction entry requirements:

- Support multiple responsibility center dimensions on the same transaction.
- Allow responsibility center assignment at header level when the whole transaction belongs to the same centers.
- Allow responsibility center assignment at line level when different lines belong to different centers.
- Default line-level centers from the header when applicable.
- Preserve responsibility center history after posting.
- Validate required responsibility center types before saving or posting.
- Keep the general ledger simple while storing responsibility center details for reporting.

## Financial Reports

Financial reports should be filterable and groupable by responsibility center dimensions.

Users should be able to filter reports by:

- Department
- Branch
- Project
- Salesman
- Business Unit
- Warehouse
- Region
- Customer Group
- Responsibility Center

Suggested reports:

- Income Statement by Branch
- Trial Balance by Department
- Expenses by Project
- Sales by Salesman
- Profit by Business Unit
- Budget vs Actual by Department
- Expenses by Department
- Sales by Profit Center
- Gross Profit Analysis
- Revenue by Team
- ROI by Investment Center

Reporting requirements:

- Support filtering by one responsibility center dimension.
- Support filtering by multiple dimensions together, such as Branch plus Department plus Project.
- Support rollups using parent responsibility centers.
- Keep historical reporting accurate even when a center is later renamed, deactivated, or moved under a different parent.
- Allow export of responsibility center reports when the existing reporting framework supports export.

## Recommended Product Direction

Gr8Books Neo should implement multi-dimensional responsibility centers. Instead of limiting a transaction to one cost center, users should be able to assign multiple analytical dimensions simultaneously, such as:

- Branch
- Department
- Project
- Salesperson
- Business Unit

This gives SMEs management reporting capabilities usually found in larger ERP systems while keeping day-to-day transaction entry familiar and the general ledger clean.

This approach makes Gr8Books Neo stronger than entry-level accounting software for companies with multiple branches, departments, projects, warehouses, or business units.
