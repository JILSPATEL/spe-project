pipeline {
    agent any

    environment {
        TAG = "${BUILD_NUMBER}"
    }

    stages {

        // ✅ Load .env file from Jenkins credentials
        stage('Load Env') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    script {
                        def props = readProperties file: ENV_FILE

                        env.IMAGE_BACKEND = props.IMAGE_BACKEND
                        env.IMAGE_FRONTEND = props.IMAGE_FRONTEND
                        env.DOCKERHUB_CREDENTIALS = props.JENKINS_CREDENTIALS_ID

                        // Optional (for deploy stage reuse)
                        env.DB_HOST = props.DB_HOST
                        env.DB_PORT = props.DB_PORT
                        env.DB_USER = props.DB_USER
                        env.DB_PASSWORD = props.DB_PASSWORD
                        env.DB_NAME = props.DB_NAME
                        env.PORT = props.PORT
                        env.FRONTEND_URL = props.FRONTEND_URL
                        env.JWT_SECRET = props.JWT_SECRET
                        env.NODE_ENV = props.NODE_ENV
                    }
                }
            }
        }

        // ✅ SCA, SAST & Container Scanning (DevSecOps)
        stage('Security Scans') {
            steps {
                script {

                    // Step 1: Install Trivy (container vulnerability scanner)
                    sh '''
                    echo "Installing Trivy..."
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.49.1 || true
                    trivy --version
                    '''

                    // Step 2: SCA & SAST — scan source code and dependencies
                    sh '''
                    echo "Running SCA and SAST within a temporary Node container"
                    docker run --rm -v "$(pwd):/workspace" -w /workspace node:20 bash -c "
                        echo 'Scanning Backend...' &&
                        cd backend && npm install --include=dev && npm run security &&
                        echo 'Scanning Frontend...' &&
                        cd ../frontend && npm install --include=dev && npm run security
                    "
                    '''

                    // Step 3: Build Docker images so Trivy can scan them
                    sh '''
                    echo "Building Docker images for container scanning..."
                    docker build --no-cache -t $IMAGE_BACKEND:$TAG ./backend
                    docker build --no-cache -t $IMAGE_FRONTEND:$TAG ./frontend
                    '''

                    // Step 4: Trivy container vulnerability scan (CRITICAL & HIGH)
                    sh '''
                    echo "Running Trivy vulnerability scan on backend image..."
                    trivy image --severity CRITICAL,HIGH --exit-code 1 --no-progress $IMAGE_BACKEND:$TAG || true

                    echo "Running Trivy vulnerability scan on frontend image..."
                    trivy image --severity CRITICAL,HIGH --exit-code 1 --no-progress $IMAGE_FRONTEND:$TAG || true
                    '''
                }
            }
        }

        // ✅ Push to Docker Hub
        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS}",
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

        // ✅ Cleanup old images (keep only latest)
        stage('Cleanup Old Images') {
            steps {
                sh '''
                docker images "$IMAGE_BACKEND" --format "{{.Repository}}:{{.Tag}}" \
                    | grep -v "$TAG" | xargs -r docker rmi -f || true

                docker images "$IMAGE_FRONTEND" --format "{{.Repository}}:{{.Tag}}" \
                    | grep -v "$TAG" | xargs -r docker rmi -f || true
                '''
            }
        }

        // ✅ Deploy using Ansible
        stage('Deploy with Ansible') {
            steps {
                sh '''
                ansible-playbook ansible/deploy.yml \
                    -i ansible/inventory.ini \
                    --extra-vars "tag=$TAG \
                        backend_port=${PORT} \
                        db_host=${DB_HOST} \
                        db_port=${DB_PORT} \
                        db_user=${DB_USER} \
                        db_password=${DB_PASSWORD} \
                        db_name=${DB_NAME} \
                        frontend_url=${FRONTEND_URL} \
                        jwt_secret=${JWT_SECRET} \
                        node_env=${NODE_ENV} \
                        backend_repo=${IMAGE_BACKEND} \
                        frontend_repo=${IMAGE_FRONTEND}"
                '''
            }
        }
    }
}