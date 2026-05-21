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
                git branch: 'main', url: "${GITHUB_REPO}"
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t ${FULL_IMAGE} .'
            }
        }

        stage('Docker Push') {
            steps {
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
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
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
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    sh '''
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
        stage('Access Information') {
            steps {
                                echo '''
                        Application access:
                        kubectl port-forward svc/app-service 30030:3000 --address=0.0.0.0
                        
                        Grafana access:
                        kubectl --namespace monitoring port-forward svc/prometheus-grafana 3000:80 --address=0.0.0.0
                        
                        Grafana password:
                        kubectl get secret -n monitoring prometheus-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
                        
                        Grafana username:
                        admin
                        
                        Dashboard ID:
                        17685
                        '''
            }
        }
    }
}
