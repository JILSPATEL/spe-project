# Future 3-Pipeline Architecture Strategy

To implement a highly optimized, decoupled 3-pipeline architecture in the future, you will need **3 separate Jenkinsfiles** in the root of your repository. 

Here is exactly what you will create and what each will contain:

## 1. `Jenkinsfile.frontend`
**What it does:** Builds and deploys only the React application.
**When it runs:** Configured in the Jenkins job to only trigger when files inside the `/frontend/` folder change.

**Pipeline Stages:**
* **SCA & SAST:** Runs `npm audit` and `eslint` *only* inside the `frontend` directory.
* **Build & Scan:** Builds the `ecommerce_frontend` Docker image and runs Trivy against it.
* **Push & Sign:** Pushes the single frontend image to DockerHub and signs it with Cosign.
* **Deploy:** Calls Ansible, but only instructs it to restart/pull the `frontend` container.

---

## 2. `Jenkinsfile.backend` (API Gateway)
**What it does:** Builds and deploys only the API routing layer.
**When it runs:** Configured in Jenkins to only trigger when files inside the `/backend/api-gateway/` folder change.

**Pipeline Stages:**
* **SCA & SAST:** Runs security checks *only* inside the `api-gateway` directory.
* **Build & Scan:** Builds the `ecommerce_api_gateway` Docker image and runs Trivy.
* **Push & Sign:** Pushes and signs the gateway image.
* **Deploy:** Calls Ansible to restart/pull the `api-gateway` container so traffic routing is updated.

---

## 3. `Jenkinsfile.microservices`
**What it does:** Builds and deploys your core business logic (the 5 microservices).
**When it runs:** Configured in Jenkins to trigger when files change inside `backend/user-service`, `backend/cart-service`, etc.

**Pipeline Stages:**
* **The Loop:** It contains a list of the 5 services (`user-service`, `seller-service`, `product-service`, `cart-service`, `order-service`).
* **SCA & SAST:** Loops through all 5 directories to run security checks.
* **Build & Scan:** Loops to build 5 Docker images and scans all 5 with Trivy.
* **Push & Sign:** Pushes and signs all 5 images.
* **Deploy:** Calls Ansible to restart/pull all 5 microservice containers at once.

---

## How Jenkins Knows Which One to Use
When setting up your pipeline jobs in the Jenkins UI, instead of pointing them all to the default `Jenkinsfile`, you will point:
* **Job A** to the script path `Jenkinsfile.frontend`
* **Job B** to the script path `Jenkinsfile.backend`
* **Job C** to the script path `Jenkinsfile.microservices`

You will also use the Jenkins **"Polling Requires Workspace"** or **"Included Regions"** setting so Jenkins knows exactly which folder changes belong to which job. This ensures that a UI color change in React does not trigger a massive 5-microservice backend rebuild!
