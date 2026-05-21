# Student Registration Web App — Jenkins CI/CD on Kubernetes

Node.js + Express + MySQL student registration application deployed with Jenkins, Docker, and Kubernetes. Prometheus and Grafana are installed via Helm in the Jenkins pipeline.

## Project Structure

```
├── app/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── public/
│       ├── index.html
│       ├── style.css
│       └── script.js
├── Dockerfile
├── .dockerignore
├── Jenkinsfile
├── README.md
└── k8s/
    ├── mysql-secret.yaml
    ├── mysql-pv.yaml
    ├── mysql-pvc.yaml
    ├── mysql-deployment.yaml
    ├── mysql-service.yaml
    ├── app-deployment.yaml
    ├── app-service.yaml
    └── app-hpa.yaml
```

## Features

- **Frontend:** Register students (name, email, department) and view all records
- **Backend API:**
  - `GET /` — Web UI
  - `POST /students` — Register a student
  - `GET /students` — List all students
  - `GET /health` — Health check (includes DB status)
  - `GET /metrics` — Prometheus metrics

## Local Development

```bash
cd app
npm install
npm start
```

App runs at `http://localhost:3000`. For local MySQL, set environment variables:

```bash
export DB_HOST=localhost
export DB_USER=appuser
export DB_PASSWORD=apppassword
export DB_NAME=studentdb
```

## Docker

```bash
docker build -t hammad01011/webapp-deployed-using-kubernetes:latest .
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=appuser \
  -e DB_PASSWORD=apppassword \
  -e DB_NAME=studentdb \
  hammad01011/webapp-deployed-using-kubernetes:latest
```

## Kubernetes

Deploy order (also used in Jenkinsfile):

1. `mysql-secret.yaml`
2. `mysql-pv.yaml` → `mysql-pvc.yaml`
3. `mysql-deployment.yaml` → `mysql-service.yaml`
4. `app-deployment.yaml` → `app-service.yaml` → `app-hpa.yaml`

| Resource | Details |
|----------|---------|
| MySQL service | `mysql-service:3306` |
| App image | `hammad01011/webapp-deployed-using-kubernetes:latest` |
| App NodePort | `30030` |
| HPA | Scales `app-deployment` from 1 to 5 pods at 50% CPU utilization |

Ensure `/data/mysql` exists on the cluster node for the `hostPath` volume.

**HPA note:** Requires [metrics-server](https://github.com/kubernetes-sigs/metrics-server) installed on the cluster.

## Jenkins Pipeline

**Repository:** https://github.com/hammad0-dev/webapp-deployed-using-kubernetes.git

**Credentials required:**

| ID | Type | Purpose |
|----|------|---------|
| `dockerhub-creds` | Username/password | Docker Hub login |
| `kubeconfig` | Secret file | Kubernetes cluster access |

**Stages:**

1. Code Fetch
2. Docker Build
3. Docker Push
4. Kubernetes Deploy (PV/PVC, MySQL, App, HPA)
5. Prometheus Grafana Setup (Helm only)

Install on Jenkins agent: Docker, `kubectl`, `helm`.

**Monitoring stage (Helm):**

```bash
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring
```

Access Grafana/Prometheus services from the `monitoring` namespace after install (`kubectl get svc -n monitoring`).

## GitHub Webhook

Configure a GitHub webhook pointing to your Jenkins job URL to trigger builds on push to `main`.

## Author
 hello
DevOps Lab Project — Student Management System
