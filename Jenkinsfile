pipeline {
    agent any
    environment {
        DOCKERHUB_CREDENTIALS = "${env.JENKINS_CREDENTIALS_ID ?: 'dockerhub-cred'}"
        IMAGE_BACKEND = "${env.IMAGE_BACKEND ?: 'jilspatel/backend'}"
        IMAGE_FRONTEND = "${env.IMAGE_FRONTEND ?: 'jilspatel/frontend'}"
        TAG = "${BUILD_NUMBER}"
    }
    stages {
        stage('Build Images') {
            steps {
                sh '''
                docker build --no-cache -t $IMAGE_BACKEND:$TAG ./backend
                docker build --no-cache -t $IMAGE_FRONTEND:$TAG ./frontend
                '''
            }
        }
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
        stage('Deploy with Ansible') {
            steps {
                withCredentials([file(credentialsId: 'env-file', variable: 'ENV_FILE')]) {
                    sh '''
                    export $(grep -v '^#' $ENV_FILE | xargs)
                    ansible-playbook ansible/deploy.yml \
                        -i ansible/inventory.ini \
                        --extra-vars "tag=$TAG \
                            backend_port=${PORT:-5000} \
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
}