## Deploying api-gateway on Kubernetes

### 1. Prerequisites
- Docker images pushed to a registry the cluster can reach; update `image` in `k8s/api-gateway/deployment.yaml` if you tag differently.
- Eureka (`service-discovery`) reachable inside the cluster at `http://service-discovery:8761/eureka/` (create a Service with that DNS name or adjust the config map).
- An Ingress controller (example assumes NGINX) and a TLS secret named `api-gateway-tls` for `api.healthcare.local`.

### 2. Apply manifests
```
kubectl apply -f k8s/api-gateway/deployment.yaml
```
This creates:
- `ConfigMap api-gateway-config`
- `Deployment api-gateway` (2 replicas)
- `Service api-gateway` (ClusterIP, port 80)
- `Ingress api-gateway` (routes external traffic)

### 3. Verify rollout
```
kubectl get pods -l app=api-gateway
kubectl describe ingress api-gateway
```
Ensure readiness/liveness probes report healthy, then update DNS (or `/etc/hosts`) to point `api.healthcare.local` to the ingress load balancer IP.

### 4. Updating the deployment
Push a new image tag, edit `k8s/api-gateway/deployment.yaml` with the tag, and run:
```
kubectl apply -f k8s/api-gateway/deployment.yaml
kubectl rollout status deploy/api-gateway
```
For configuration changes, edit the ConfigMap and restart pods:
```
kubectl apply -f k8s/api-gateway/deployment.yaml
kubectl rollout restart deploy/api-gateway
```

