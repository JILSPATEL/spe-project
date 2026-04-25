# DevSecOps Implementation Guide

This guide provides step-by-step instructions for implementing four critical security features: Rate Limiting, Container Scanning, SBOM Generation, and Image Signing.

---

## Table of Contents

1. [Rate Limiting](#1-rate-limiting)
2. [Container Scanning](#2-container-scanning)
3. [SBOM Generation](#3-sbom-generation)
4. [Image Signing](#4-image-signing)

---

## 1. Rate Limiting

### Overview

Rate limiting protects your API from brute-force attacks, DDoS, and abuse by limiting the number of requests a client can make in a given time window.

### Implementation Steps

#### Step 1: Install Dependencies

```bash
cd backend
npm install express-rate-limit
```

#### Step 2: Create Rate Limiter Configuration

Create `backend/middleware/rateLimiter.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check
        return req.path === '/api/health';
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Strict limit for auth endpoints (login/signup)
    message: {
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { limiter, authLimiter };
```

#### Step 3: Apply to Server

Update `backend/server.js`:

```javascript
const { limiter, authLimiter } = require('./middleware/rateLimiter');

// Apply general rate limiting to all routes
app.use(limiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter);
app.use('/api/seller-auth', authLimiter);
```

#### Step 4: Add Custom Headers

Update `server.js` to include rate limit info in responses:

```javascript
app.use((req, res, next) => {
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '0');
    next();
});
```

### Testing Rate Limiting

```bash
# Make multiple requests to test
for i in {1..110}; do curl -I http://localhost:5000/api/health; done | head -20
```

---

## 2. Container Scanning

### Overview

Container scanning identifies vulnerabilities in Docker images before deployment. We'll use **Trivy**, an open-source vulnerability scanner.

### Implementation Steps

#### Option A: Standalone Trivy

##### Step 1: Install Trivy

```bash
# Download Trivy
curl -sfL https://aquasecurity.github.io/trivy/install/v0.49.1/install.sh | sh

# Or on Ubuntu/Debian
sudo apt-get install trivy
```

##### Step 2: Scan Images

```bash
# Scan a local image
trivy image ecommerce_backend:latest

# Scan with severity filter (CRITICAL and HIGH)
trivy image --severity CRITICAL,HIGH ecommerce_backend:latest

# Output in JSON format for CI/CD
trivy image --severity CRITICAL,HIGH --format json ecommerce_backend:latest > trivy-report.json
```

#### Option B: Integrate into Jenkinsfile

Update the `Security Scans` stage in `Jenkinsfile`:

```groovy
stage('Security Scans') {
    steps {
        script {
            // Install Trivy
            sh '''
                curl -sfL https://aquasecurity.github.io/trivy/install/v0.49.1/install.sh | install -s -m 0755 -T /usr/local/bin/trivy || true
            '''
            
            // Run SCA and SAST
            sh '''
                docker run --rm -v "$(pwd):/workspace" -w /workspace node:20 bash -c "
                    echo 'Scanning Backend...' &&
                    cd backend && npm install --include=dev && npm run security &&
                    echo 'Scanning Frontend...' &&
                    cd ../frontend && npm install --include=dev && npm run security
                "
            '''
            
            // Build images for scanning
            sh '''
                docker build -t $IMAGE_BACKEND:$TAG ./backend
                docker build -t $IMAGE_FRONTEND:$TAG ./frontend
            '''
            
            // Container vulnerability scan
            sh '''
                echo "Running Trivy vulnerability scan..."
                trivy image --severity CRITICAL,HIGH --exit-code 1 --no-progress $IMAGE_BACKEND:$TAG || true
                trivy image --severity CRITICAL,HIGH --exit-code 1 --no-progress $IMAGE_FRONTEND:$TAG || true
            '''
        }
    }
}
```

#### Option C: Scan in Dockerfile (Build-time)

Add Trivy scanning during build in `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Install Trivy for scanning
RUN apk add --no-cache curl && \
    curl -sfL https://aquasecurity.github.io/trivy/install/v0.49.1/install.sh | sh && \
    mv /tmp/trivy /usr/local/bin/trivy

# Scan for vulnerabilities (fail on CRITICAL)
RUN trivy fs --severity CRITICAL /app

EXPOSE 5000

CMD ["node", "server.js"]
```

### Create Scan Policy

Create `trivy-policy.rego` for custom policies:

```rego
package main

deny[msg] {
    input.type == "dockerfile"
    input.instructions[_] == "FROM scratch"
    msg = "Do not use scratch base image"
}
```

---

## 3. SBOM Generation

### Overview

A Software Bill of Materials (SBOM) lists all dependencies in your application, enabling vulnerability tracking and compliance.

### Implementation Steps

#### Option A: Using SPDX (Recommended)

##### Step 1: Install Tools

```bash
# Install syft (SBOM generator)
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin

# Or download directly
curl -sSfL https://github.com/anchore/syft/releases/latest/download/syft_linux_amd64.tar.gz -o syft.tar.gz
tar -xzf syft.tar.gz && sudo mv syft /usr/local/bin/
```

##### Step 2: Generate SBOM

```bash
# Generate SBOM for backend
syft backend:latest -o spdx-json > backend-sbom.spdx.json
syft backend:latest -o cyclonedx-json > backend-sbom.cdx.json

# Generate SBOM for frontend
syft frontend:latest -o spdx-json > frontend-sbom.spdx.json

# Generate SBOM from local node_modules
syft ./backend -o spdx-json > backend-sbom-local.spdx.json
```

##### Step 3: View SBOM

```bash
# View as table
syft backend:latest -o table

# View as JSON
cat backend-sbom.spdx.json | jq '.packages[].name'
```

#### Option B: Using npm for SBOM

```bash
# Generate CycloneDX SBOM
cd backend
npm install --save-dev @cyclonedx/bom

# Generate SBOM
npx cyclonedx-bom -o ../backend-sbom.cdx.json

# Or with npm
npm install --save-dev @npmcli/nice-package
npm exec -- nice-package | npx @cyclonedx/bom
```

#### Option C: Integrate into Jenkinsfile

```groovy
stage('Generate SBOM') {
    steps {
        sh '''
            # Install syft
            curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin || true
            
            # Generate SBOM for backend
            syft $IMAGE_BACKEND:$TAG -o spdx-json > backend-sbom-$TAG.spdx.json
            
            # Generate SBOM for frontend
            syft $IMAGE_FRONTEND:$TAG -o spdx-json > frontend-sbom-$TAG.spdx.json
            
            # Archive SBOM files
            archiveArtifacts artifacts: '*.spdx.json', fingerprint: true
        '''
    }
}
```

#### Option D: Create SBOM for Supply Chain Security

Create `sbom-metadata.json` with additional context:

```json
{
    "metadata": {
        "tool": "syft",
        "version": "0.49.1",
        "build": {
            "number": "${BUILD_NUMBER}",
            "url": "${BUILD_URL}",
            "commit": "${GIT_COMMIT}"
        }
    },
    "component": {
        "name": "ecommerce-backend",
        "version": "1.0.0"
    }
}
```

### Verify SBOM

```bash
# Validate SPDX SBOM
pip install spdx-tools
validate.py backend-sbom.spdx.json
```

---

## 4. Image Signing

### Overview

Image signing ensures container images haven't been tampered with and come from a trusted source. We'll use **Cosign** from Sigstore.

### Implementation Steps

#### Step 1: Install Cosign

```bash
# Install Cosign
curl -sSfL https://raw.githubusercontent.com/sigstore/cosign/main/install.sh | sh -s -- -b /usr/local/bin

# Or on Ubuntu/Debian
sudo apt-get install cosign
```

#### Step 2: Generate Key Pair

```bash
# Generate keys (automatically stored in ~/.cosign/)
cosign generate-key-pair

# Or specify custom location
cosign generate-key-pair --key-path ./cosign.key
```

#### Step 3: Sign Images

```bash
# Sign the image
cosign sign --key cosign.key ecommerce_backend:latest

# Sign with annotation
cosign sign --key cosign.key \
    --annotation version=1.0.0 \
    ecommerce_backend:latest

# Sign with lifecycle annotations
cosign sign --key cosign.key \
    -a org.opencontainers.image.authors="DevOps Team" \
    -a org.opencontainers.image.version="1.0.0" \
    ecommerce_backend:latest
```

#### Step 4: Verify Images

```bash
# Verify signature
cosign verify --key cosign.pub ecommerce_backend:latest

# Verify with public key (for others to verify)
cosign verify --key cosign.pub ecommerce_backend:latest

# Verify and check annotations
cosign verify --key cosign.pub \
    -a version=1.0.0 \
    ecommerce_backend:latest
```

#### Step 5: Store Public Key for Verification

The `cosign.pub` file should be stored in your repository or a trusted location:

```bash
# Copy public key to project
cp ~/.cosign/cosign.pub ./cosign.pub
```

#### Step 6: Integrate into Jenkinsfile

```groovy
stage('Sign Images') {
    steps {
        withCredentials([file(credentialsId: 'cosign-key', variable: 'COSIGN_KEY')]) {
            sh '''
                # Load cosign key from credentials
                cp $COSIGN_KEY ./cosign.key
                
                # Generate key pair if not exists
                cosign generate-key-pair --key-path ./cosign.key || true
                
                # Sign images
                cosign sign --key cosign.key $IMAGE_BACKEND:$TAG
                cosign sign --key cosign.key $IMAGE_FRONTEND:$TAG
                
                # Save public key for verification
                cosign public-key --key ./cosign.key > cosign.pub
                
                # Push public key to registry (optional)
                cosign attach signature --public-key ./cosign.pub $IMAGE_BACKEND:$TAG
            '''
        }
    }
}

stage('Verify Images') {
    steps {
        sh '''
            # Verify images
            cosign verify --key cosign.pub $IMAGE_BACKEND:$TAG
            cosign verify --key cosign.pub $IMAGE_FRONTEND:$TAG
        '''
    }
}
```

#### Step 7: Store Keys Securely

Update `ansible/inventory.ini` to include cosign key path:

```ini
[web]
server1 ansible_host=xxx.xxx.xxx.xxx

[web:vars]
...
cosign_key_path=/path/to/cosign.key
```

### Additional: Use Rekor for Transparency Log

```bash
# Set Rekor server (default is public)
export COSIGN_REKOR_URL=https://rekor.sigstore.dev

# Sign with transparency log
cosign sign --key cosign.key --tlog-upload=true ecommerce_backend:latest
```

---

## Integration Summary

### Complete Jenkinsfile Integration

```groovy
pipeline {
    agent any
    
    environment {
        TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Load Env') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    script {
                        def props = readProperties file: ENV_FILE
                        env.IMAGE_BACKEND = props.IMAGE_BACKEND
                        env.IMAGE_FRONTEND = props.IMAGE_FRONTEND
                    }
                }
            }
        }
        
        stage('Security Scans') {
            steps {
                sh '''
                    docker run --rm -v "$(pwd):/workspace" -w /workspace node:20 bash -c "
                        cd backend && npm install --include=dev && npm run security
                        cd ../frontend && npm install --include=dev && npm run security
                    "
                '''
            }
        }
        
        stage('Build Images') {
            steps {
                sh '''
                    docker build -t $IMAGE_BACKEND:$TAG ./backend
                    docker build -t $IMAGE_FRONTEND:$TAG ./frontend
                '''
            }
        }
        
        stage('Container Scanning') {
            steps {
                sh '''
                    # Install trivy
                    curl -sfL https://aquasecurity.github.io/trivy/install/v0.49.1/install.sh | sh -s -- -m 0755 || true
                    
                    # Scan images
                    trivy image --severity CRITICAL,HIGH --exit-code 1 --no-progress $IMAGE_BACKEND:$TAG || true
                    trivy image --severity CRITICAL,HIGH --exit-code 1 --no-progress $IMAGE_FRONTEND:$TAG || true
                '''
            }
        }
        
        stage('Generate SBOM') {
            steps {
                sh '''
                    # Install syft
                    curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh -s -- -b /usr/local/bin || true
                    
                    # Generate SBOM
                    syft $IMAGE_BACKEND:$TAG -o spdx-json > backend-sbom-$TAG.spdx.json
                    syft $IMAGE_FRONTEND:$TAG -o spdx-json > frontend-sbom-$TAG.spdx.json
                    
                    archiveArtifacts artifacts: '*.spdx.json', fingerprint: true
                '''
            }
        }
        
        stage('Sign Images') {
            steps {
                withCredentials([file(credentialsId: 'cosign-key', variable: 'COSIGN_KEY')]) {
                    sh '''
                        cp $COSIGN_KEY ./cosign.key
                        cosign sign --key cosign.key $IMAGE_BACKEND:$TAG
                        cosign sign --key cosign.key $IMAGE_FRONTEND:$TAG
                    '''
                }
            }
        }
        
        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push $IMAGE_BACKEND:$TAG
                        docker push $IMAGE_FRONTEND:$TAG
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    ansible-playbook ansible/deploy.yml \
                        -i ansible/inventory.ini \
                        --extra-vars "tag=$TAG"
                '''
            }
        }
    }
}
```

---

## Testing Checklist

| Feature | Test Command |
|---------|-------------|
| Rate Limiting | `for i in {1..110}; do curl http://localhost:5000/api/health; done` |
| Container Scan | `trivy image ecommerce_backend:latest` |
| SBOM Generation | `syft backend:latest -o spdx-json` |
| Image Signing | `cosign verify --key cosign.pub ecommerce_backend:latest` |

---

## References

- [Express Rate Limiter](https://github.com/expressjs/express-rate-limit)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Syft SBOM Generator](https://github.com/anchore/syft)
- [Cosign Image Signing](https://docs.sigstore.dev/cosign/signing/overview/)
- [SPDX Specification](https://spdx.dev/)
- [CycloneDX](https://cyclonedx.org/)