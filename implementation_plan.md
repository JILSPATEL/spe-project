# Database Separation and Multi-Device Deployment Plan

This plan aims to modify your existing setup so that you can deploy your application to two distinct devices using the exact same codebase, while designating one device (Device A) to host the centralized MySQL Database Container that both backend instances will connect back to.

## User Review Required
> [!IMPORTANT]
> **Firewall Validation**: To successfully complete this plan, you must ensure that inside the network where the devices reside, **Device B** is able to communicate with **Device A** over port `3306`. If a hardware or cloud firewall intercepts this internal network, please confirm that the connection will be open.

## Proposed Changes

We will leverage Ansible Groups and environment variables so that your code repository remains identical, ensuring your git webhook pulls perfectly without conflicts on either machine.

### Ansible Inventory Configuration

#### [MODIFY] [inventory.ini](file:///home/abhishek/SEM2/SPE/MAJOR%20PROJECT/spe-project/ansible/inventory.ini)
We will split the inventory into semantic groups:
- `db_servers`: Will contain the IP for Device A.
- `app_servers`: Will contain the IP for Device A and Device B.

### Ansible Playbook Modernization 

#### [MODIFY] [deploy.yml](file:///home/abhishek/SEM2/SPE/MAJOR%20PROJECT/spe-project/ansible/deploy.yml)
We will refactor this playbook into two separate "Plays" inside the same file:
1. **Play 1 (`hosts: db_servers`)**: 
   - Ensure a dedicated `mysql` Docker container is running locally here.
   - Inject root credentials dynamically from your variables.
   - Bind it to port `3306` openly so the internal network can reach it.
2. **Play 2 (`hosts: app_servers`)**:
   - The current playbook configuration.
   - Ensure the network, backend, and frontend containers are cleaned up and freshly pulled/started on both target devices.

### CI/CD Environment Modification (No Code Change)

#### [MODIFY] Jenkins Environment Configuration (`.env`)
You will manually need to:
- Navigate to your Jenkins secure credentials where the `.env` settings are hosted.
- Change `DB_HOST=localhost` to the internal/public IP address of Device A so both backends know where to search.

## Open Questions

> [!WARNING]
> 1. **IP Addresses**: Can you confirm the exact IP address mapping for "Device A" (which will host the DB) and "Device B"?
> 2. **Database Schema & Seeding**: The backend currently relies on `schema.sql` and `seed.sql` to initialize the database structure. Your `README.md` shows you execute these manually. Would you like me to automate the database initialization (running the seeds) via Ansible inside that new `db_servers` play?
> 3. **Are you connecting via SSH Passwords or SSH Keys?**: In the updated `inventory.ini`, do you need to pass specific `ansible_ssh_user` and `ansible_ssh_pass` settings for Device B?

## Verification Plan

### Automated Checks
- Run the Jenkins Pipeline once the changes are merged to main.
- Ensure the pipeline passes through the Ansible stage securely without failing due to inventory syntax checks.

### Manual Verification
1. Access the Frontend hosted on Device A (IP_A:3000) and register a new test user account.
2. Access the Frontend hosted on Device B (IP_B:3000) and attempt to **Log In** with that exact same account credential.
3. If successful, we have confirmed that the databases are synchronized and running off the single central container on Device A.
