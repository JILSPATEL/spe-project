pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-creds'
        IMAGE_BACKEND = 'jilspatel/backend'
        IMAGE_FRONTEND = 'jilspatel/frontend'
        TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/JILSPATEL/spe-project.git'
            }
        }

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
                    credentialsId: 'dockerhub-creds',
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

        stage('Deploy with Ansible') {
            steps {
                sh '''
                ansible-playbook ansible/deploy.yml \
                -i ansible/inventory \
                --extra-vars "tag=$TAG"
                '''
            }
        }
    }
}