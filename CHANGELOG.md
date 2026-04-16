# Medusa Subscriptions + Authorize.Net Architecture

This project is easier to understand as a small set of focused diagrams instead of one large one.

The big ideas are:

- Medusa provides the base commerce platform.
- Subscription plans are stored as Medusa `customer groups`.
- Add-on credit packs are stored as Medusa `products`.
- Custom business logic lives in the `subscription`, `credit`, `billing`, and `authorizenet` modules.
- Store/Admin routes call workflows and services.
- Subscribers and a scheduled job automate lifecycle events.

---

## 1. System Context

This shows the outside view: who uses the system and which major parts they touch.

```mermaid
flowchart LR
    CUSTOMER[Customer]
    ADMIN[Admin]
    STOREFRONT[Storefront]
    ADMINUI[Admin Extension]
    MEDUSA[Medusa App]
    AUTHJS[Authorize.Net Accept.js]
    AUTHNET[Authorize.Net Gateway]

    CUSTOMER --> STOREFRONT
    ADMIN --> ADMINUI

    STOREFRONT --> MEDUSA
    ADMINUI --> MEDUSA

    STOREFRONT --> AUTHJS
    AUTHJS --> STOREFRONT

    MEDUSA --> AUTHNET
```

### Read It As

- Customers use the storefront.
- Admins use the Medusa admin extension.
- Both ultimately talk to the Medusa app.
- Card data is tokenized in the browser with Accept.js.
- The backend talks directly to Authorize.Net for customer profiles and charges.

---

## 2. Main Building Blocks

This shows how the backend is organized internally.

```mermaid
flowchart TB
    subgraph EntryPoints[Entry Points]
        STOREAPI[Store API Routes]
        ADMINAPI[Admin API Routes]
        SUBSCRIBERS[Event Subscribers]
        JOB[Scheduled Job]
    end

    subgraph Orchestration[Orchestration]
        WORKFLOWS[Medusa Workflows]
    end

    subgraph CustomModules[Custom Modules]
        SUBS[Subscription Module]
        CREDIT[Credit Module]
        BILLING[Billing Module]
        AUTH[Authorize.Net Module]
    end

    subgraph MedusaCore[Medusa Core]
        CUSTOMER[Customer Module]
        GROUPS[Customer Groups = Plans]
        PRODUCT[Products = Add-ons]
        ORDER[Orders]
        QUERY[Query Graph + Remote Links]
    end

    subgraph Data[Data]
        SUBSDB[(subscription)]
        CREDITDB[(credit_balance\nperson_access\nsaved_profile)]
        BILLINGDB[(billing_transaction)]
    end

    STOREAPI --> WORKFLOWS
    ADMINAPI --> WORKFLOWS
    SUBSCRIBERS --> WORKFLOWS
    JOB --> SUBS
    JOB --> CREDIT
    JOB --> BILLING
    JOB --> AUTH

    WORKFLOWS --> SUBS
    WORKFLOWS --> CREDIT
    WORKFLOWS --> BILLING
    WORKFLOWS --> AUTH
    WORKFLOWS --> QUERY

    QUERY --> CUSTOMER
    QUERY --> GROUPS
    QUERY --> PRODUCT
    QUERY --> ORDER

    SUBS --> SUBSDB
    CREDIT --> CREDITDB
    BILLING --> BILLINGDB
```

### Read It As

- Requests enter through routes, subscribers, or the maintenance job.
- Workflows coordinate the main business operations.
- Custom modules own subscription, credit, billing, and payment adapter logic.
- Medusa core still owns customers, groups, products, and orders.
- Remote links connect custom module records back to Medusa customers.

---

## 3. Subscription Lifecycle

This focuses only on subscription creation and plan changes.

```mermaid
flowchart LR
    A[Customer created] --> B[customer.created subscriber]
    B --> C[Auto-create free subscription]
    C --> D[Create credit balance]
    D --> E[Assign free tier customer group]

    F[Customer chooses paid plan] --> G[Store/Admin subscription route]
    G --> H[create-subscription workflow]
    H --> I[Create or reuse Authorize.Net profile]
    I --> J[Charge if paid tier]
    J --> K[Create subscription record]
    K --> L[Initialize or reset credits]
    L --> M[Assign customer group for selected tier]
    M --> N[Record billing transaction]

    O[Customer upgrades] --> P[upgrade-subscription workflow]
    P --> Q[Charge prorated amount if needed]
    Q --> R[Switch tier group]
    R --> S[Reset credits]
    S --> T[Record upgrade billing]

    U[Customer downgrades] --> V[downgrade-subscription workflow]
    V --> W[Schedule downgrade for period end]

    X[Customer cancels] --> Y[cancel-subscription workflow]
    Y --> Z[Mark subscription canceled / end-of-period access]

    AA[Customer reactivates] --> AB[reactivate-subscription workflow]
    AB --> AC[Restore active status and billing period]
```

### Read It As

- New customers are automatically placed on the free tier.
- Paid plan creation and upgrades go through workflows.
- Customer group membership is the source of plan identity and plan limits.
- Downgrades are scheduled, not applied immediately.
- Cancel and reactivate are separate lifecycle operations.

---

## 4. Credits and Add-Ons

This isolates the entitlement side of the system.

```mermaid
flowchart LR
    A[Customer accesses person/profile] --> B[Check existing access]
    B --> C{Already unlocked?}
    C -->|Yes| D[Allow access without consuming credit]
    C -->|No| E[consume-credit workflow]
    E --> F[Validate available credits]
    F --> G[Lock credit balance row]
    G --> H[Consume preview or full-report credit]
    H --> I[Record person_access]
    I --> J[Return updated balance]

    K[Customer buys add-on pack] --> L[Add-on purchase route]
    L --> M[Load add-on product metadata]
    M --> N[Charge stored Authorize.Net payment profile]
    N --> O[Grant add-on credits]
    O --> P[Record billing transaction]
    O --> Q{Grant failed?}
    Q -->|Yes| R[Void or refund charge]
```

### Read It As

- Credits are only consumed if the customer does not already have access.
- Full reports can permanently unlock a person.
- Credit consumption uses row locking to reduce double-spend races.
- Add-on packs increase report credits after a successful charge.
- The add-on path is more direct than the subscription path and includes compensation logic.

---

## 5. Billing and Automation

This shows recurring billing, retries, and event-driven automation.

```mermaid
flowchart TB
    subgraph Events[Event Driven]
        E1[customer.created] --> E2[Create free subscription + credits]
        E3[order.placed] --> E4[grant-addon-credits workflow]
    end

    subgraph Scheduled[Scheduled Maintenance Job]
        J1[Find active subscriptions at period end]
        J2[Charge renewal]
        J3[Record renewal transaction]
        J4[Reset monthly credits]
        J5[Advance billing period]

        J6[Find past_due subscriptions ready for retry]
        J7[Retry payment]
        J8{Retry success?}
        J9[Reactivate subscription]
        J10[Increment retry count]
        J11{Max retries reached?}
        J12[Cancel subscription]

        J13[Apply scheduled downgrade if date reached]
    end

    J1 --> J2 --> J3 --> J4 --> J5
    J6 --> J7 --> J8
    J8 -->|Yes| J9
    J8 -->|No| J10 --> J11
    J11 -->|Yes| J12
    J11 -->|No| J13
    J9 --> J13
    J5 --> J13
```

### Read It As

- Two important automations come from events: free-tier provisioning and add-on credit granting.
- The scheduled job handles renewals, retries, cancellations after repeated payment failure, credit resets, and scheduled downgrades.

---

## Key Modeling Choices

- `customer groups` act as the subscription plan catalog.
- `products` act as the add-on catalog.
- `subscription` stores lifecycle state like status, billing period, retries, downgrade scheduling, and saved payment profile references.
- `credit` stores balances plus access/saved-profile history.
- `billing` is the transaction ledger.
- `authorizenet` is a direct outbound integration module, not a standard Medusa payment provider.
- There is no inbound Authorize.Net webhook flow in the current codebase.
