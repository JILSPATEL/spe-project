pipeline {
    agent any

    environment {
        TAG = "${BUILD_NUMBER}"
        SERVICES = "user-service seller-service product-service cart-service order-service api-gateway"
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

        // ✅ SCA — Software Composition Analysis (dependency vulnerability check)
        stage('SCA') {
            steps {
                script {
                    def scaCmds = ""
                    def servicesList = env.SERVICES.split(' ')
                    for (int i = 0; i < servicesList.size(); i++) {
                        def svc = servicesList[i]
                        scaCmds += "echo 'SCA: ${svc}...' && cd backend/${svc} && npm install --include=dev && npm run sca && cd ../../ && "
                    }
                    scaCmds += "echo 'SCA: Frontend...' && cd frontend && npm install --include=dev && npm run sca"
                    
                    sh """
                    echo "Running SCA (npm audit)..."
                    docker run --rm -v "\$(pwd):/workspace" -w /workspace node:20 bash -c "${scaCmds}"
                    """
                }
            }
        }

        // ✅ SAST — Static Application Security Testing (source code analysis)
        stage('SAST') {
            steps {
                script {
                    def sastCmds = ""
                    def servicesList = env.SERVICES.split(' ')
                    for (int i = 0; i < servicesList.size(); i++) {
                        def svc = servicesList[i]
                        sastCmds += "echo 'SAST: ${svc}...' && cd backend/${svc} && npm install --include=dev && npm run sast && cd ../../ && "
                    }
                    sastCmds += "echo 'SAST: Frontend...' && cd frontend && npm install --include=dev && npm run sast"
                    
                    sh """
                    echo "Running SAST (ESLint security plugin)..."
                    docker run --rm -v "\$(pwd):/workspace" -w /workspace node:20 bash -c "${sastCmds}"
                    """
                }
            }
        }

        // ✅ Build Docker images
        stage('Build Images') {
            steps {
                script {
                    sh "echo 'Building Docker images...'"
                    def servicesList = env.SERVICES.split(' ')
                    for (int i = 0; i < servicesList.size(); i++) {
                        def svc = servicesList[i]
                        sh "docker build --no-cache -t ${env.IMAGE_BACKEND}-${svc}:${env.TAG} ./backend/${svc}"
                    }
                    sh "docker build --no-cache -t ${env.IMAGE_FRONTEND}:${env.TAG} ./frontend"
                }
            }
        }

        // ✅ Container Scan — Trivy image vulnerability scan
        stage('Container Scan (Trivy)') {
            steps {
                script {
                    def servicesList = env.SERVICES.split(' ')
                    for (int i = 0; i < servicesList.size(); i++) {
                        def svc = servicesList[i]
                        sh """
                        echo "Running Trivy vulnerability scan on ${svc} image..."
                        docker run --rm \
                            -v /var/run/docker.sock:/var/run/docker.sock \
                            aquasec/trivy:0.49.1 image \
                            --severity CRITICAL,HIGH \
                            --exit-code 1 \
                            --no-progress \
                            ${env.IMAGE_BACKEND}-${svc}:${env.TAG} || true
                        """
                    }
                    sh """
                    echo "Running Trivy vulnerability scan on frontend image..."
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:0.49.1 image \
                        --severity CRITICAL,HIGH \
                        --exit-code 1 \
                        --no-progress \
                        ${env.IMAGE_FRONTEND}:${env.TAG} || true
                    """
                }
            }
        }

        // ✅ Push to Docker Hub (both versioned tag AND latest)
        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS}",
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    script {
                        sh "echo \$PASS | docker login -u \$USER --password-stdin"
                        def servicesList = env.SERVICES.split(' ')
                        for (int i = 0; i < servicesList.size(); i++) {
                            def svc = servicesList[i]
                            // Push versioned tag
                            sh "docker push ${env.IMAGE_BACKEND}-${svc}:${env.TAG}"
                            // Tag and push :latest so Kubernetes always pulls the newest image
                            sh "docker tag ${env.IMAGE_BACKEND}-${svc}:${env.TAG} ${env.IMAGE_BACKEND}-${svc}:latest"
                            sh "docker push ${env.IMAGE_BACKEND}-${svc}:latest"
                        }
                        // Push versioned tag
                        sh "docker push ${env.IMAGE_FRONTEND}:${env.TAG}"
                        // Tag and push :latest
                        sh "docker tag ${env.IMAGE_FRONTEND}:${env.TAG} ${env.IMAGE_FRONTEND}:latest"
                        sh "docker push ${env.IMAGE_FRONTEND}:latest"
                    }
                }
            }
        }

        // ✅ Sign Images — Cosign image signing
        stage('Sign Images') {
            steps {
                withCredentials([file(credentialsId: 'cosign-key', variable: 'COSIGN_KEY')]) {
                    script {
                        sh '''
                        echo "Installing Cosign to workspace..."
                        curl -sSfL https://github.com/sigstore/cosign/releases/download/v2.2.1/cosign-linux-amd64 -o ./cosign
                        chmod +x ./cosign

                        echo "Loading cosign private key from credentials..."
                        cp $COSIGN_KEY ./cosign.key
                        '''

                        def servicesList = env.SERVICES.split(' ')
                        for (int i = 0; i < servicesList.size(); i++) {
                            def svc = servicesList[i]
                            sh """
                            echo "Signing ${svc} image..."
                            COSIGN_PASSWORD="" ./cosign sign --key ./cosign.key --yes ${env.IMAGE_BACKEND}-${svc}:${env.TAG}
                            """
                        }
                        
                        sh """
                        echo "Signing frontend image..."
                        COSIGN_PASSWORD="" ./cosign sign --key ./cosign.key --yes ${env.IMAGE_FRONTEND}:${env.TAG}

                        echo "Cleaning up key file..."
                        rm -f ./cosign.key ./cosign
                        """
                    }
                }
            }
        }

        // ✅ Cleanup old images (keep current TAG and :latest)
        stage('Cleanup Old Images') {
            steps {
                script {
                    def servicesList = env.SERVICES.split(' ')
                    for (int i = 0; i < servicesList.size(); i++) {
                        def svc = servicesList[i]
                        sh """
                        docker images "${env.IMAGE_BACKEND}-${svc}" --format "{{.Repository}}:{{.Tag}}" \
                            | grep -v "${env.TAG}" | grep -v "latest" | xargs -r docker rmi -f || true
                        """
                    }
                    sh """
                    docker images "${env.IMAGE_FRONTEND}" --format "{{.Repository}}:{{.Tag}}" \
                        | grep -v "${env.TAG}" | grep -v "latest" | xargs -r docker rmi -f || true
                    """
                }
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