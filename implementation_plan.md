# SmartChannel/vidicrm.com Performance & Scalability Implementation Plan (Phase 1)

This plan details the steps required to address identified bottlenecks in infrastructure, database interaction, and synchronous I/O operations within the system. The overall goal is to achieve horizontal scalability and low-latency response times.

## Phase 0: Prerequisites & Preparation

**Goal:** Ensure all necessary components for asynchronous processing are available.
**Tasks:**

1.  [ ] **Message Broker Setup:** Add a message broker (e.g., RabbitMQ or Redis Streams) service to `docker-compose.yml`.
2.  [ ] **Client Integration:** Update Node.js services (`api/server.js`) to include client libraries for the chosen message broker.

## Phase 1: Infrastructure Hardening & Database Optimization (Low Risk, High Impact)

**Goal:** Optimize existing infrastructure before introducing complex application changes.
**Tasks:**

1.  [ ] **PostgreSQL Tuning:** Apply recommended performance settings from `converge/database/postgresql.conf` (e.g., increasing `shared_buffers`, adjusting checkpoint parameters). _Requires backup of current configuration._
2.  [ ] **Docker Resource Allocation:** Review and increase resource limits (`cpus`, `memory`) for PostgreSQL and Directus services in `converge/docker-compose.yml`.
3.  [ ] **Read Replica Implementation (Design):** Design the schema changes required to support a read replica setup for high-read endpoints, without immediate implementation.

## Phase 2: Decoupling I/O Operations (Medium Risk, Critical Impact)

**Goal:** Eliminate synchronous blocking calls in the API layer by offloading long-running tasks.
**Tasks:**

1.  [ ] **Email Sending Offload:** Refactor `api/server.js`'s email sending logic (`sendWaitlistEmail`) to publish a message (containing recipient details) to the Message Queue instead of calling Resend directly. A dedicated worker service will consume this queue.
2.  [ ] **Vespa Indexing Offload:** Refactor API endpoints that trigger Vespa indexing (e.g., signup flow) to publish an event/message to the queue, allowing the API to return a fast response immediately while background workers handle the indexing.
3.  [ ] **Worker Service Implementation:** Create new worker services (Node.js consumers) responsible for listening to the queues and executing the original blocking logic (e.g., calling Resend, interacting with Vespa).

## Phase 3: Service Decomposition & Advanced Scaling (High Risk, Long Term)

**Goal:** Achieve true horizontal scalability by separating concerns into microservices.
**Tasks:**

1.  [ ] **API Gateway Implementation:** Introduce an API Gateway layer to handle routing, rate limiting, and authentication centrally.
2.  [ ] **Service Splitting:** Decompose the monolithic `api/server.js` logic into smaller, domain-specific services (e.g., `user-service`, `notification-service`).
3.  [ ] **Database Read/Write Splitting:** Configure application services to direct all write operations to the primary DB and read operations to the newly provisioned read replicas.

---

**Next Action:** Begin implementation of Phase 1 tasks, starting with PostgreSQL tuning.
