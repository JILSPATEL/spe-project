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

        // ✅ Build Docker images
        stage('Build Images') {
            steps {
                sh '''
                docker build --no-cache -t $IMAGE_BACKEND:$TAG ./backend
                docker build --no-cache -t $IMAGE_FRONTEND:$TAG ./frontend
                '''
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