pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'hammad01011/webapp-deployed-using-kubernetes'
        DOCKER_TAG   = 'latest'
        FULL_IMAGE   = "${DOCKER_IMAGE}:${DOCKER_TAG}"
        GITHUB_REPO  = 'https://github.com/hammad0-dev/webapp-deployed-using-kubernetes.git'
    }

    stages {
        stage('Code Fetch') {
            steps {
                echo 'Fetching source code from GitHub...'
                git branch: 'main', url: "${GITHUB_REPO}"
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                script {
                    appImage = docker.build("${FULL_IMAGE}", '.')
                }
            }
        }

        stage('Docker Build') {
    steps {
        echo 'Building Docker image...'
        sh '''
            docker build -t ${FULL_IMAGE} .
        '''
    }
}

stage('Docker Push') {
    steps {
        echo 'Pushing Docker image to DockerHub...'
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
            sh '''
                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                docker push ${FULL_IMAGE}
            '''
        }
    }
}

        stage('Kubernetes Deploy') {
            steps {
                echo 'Deploying MySQL and application to Kubernetes...'
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        set -e
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        kubectl apply -f k8s/mysql-secret.yaml
                        kubectl apply -f k8s/mysql-pv.yaml
                        kubectl apply -f k8s/mysql-pvc.yaml
                        kubectl apply -f k8s/mysql-deployment.yaml
                        kubectl apply -f k8s/mysql-service.yaml

                        kubectl rollout status deployment/mysql-deployment --timeout=180s

                        kubectl apply -f k8s/app-deployment.yaml
                        kubectl apply -f k8s/app-service.yaml
                        kubectl apply -f k8s/app-hpa.yaml

                        kubectl rollout status deployment/app-deployment --timeout=180s

                        kubectl get pods
                        kubectl get svc
                        kubectl get pvc
                        kubectl get hpa
                    '''
                }
            }
        }

        stage('Prometheus Grafana Setup') {
            steps {
                echo 'Starting Prometheus and Grafana using Helm...'
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
                        set -e
                        export KUBECONFIG="$KUBECONFIG_FILE"

                        kubectl create namespace monitoring || true

                        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts || true
                        helm repo update

                        helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
                          --namespace monitoring \
                          --wait \
                          --timeout 10m

                        kubectl get pods -n monitoring
                        kubectl get svc -n monitoring
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded successfully."
            echo "Docker Image: ${FULL_IMAGE}"
        }

        failure {
            echo "Pipeline failed. Check Jenkins logs."
        }
    }
}
