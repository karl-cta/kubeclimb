const CHEATSHEET = [
  {
    title: "Contexte et cluster",
    items: [
      { cmd: "kubectl config get-contexts", desc: "Lister les contextes disponibles" },
      { cmd: "kubectl config current-context", desc: "Afficher le contexte actif" },
      { cmd: "kubectl config use-context <ctx>", desc: "Changer de cluster" },
      { cmd: "kubectl config set-context --current --namespace=dev", desc: "Changer le namespace par défaut" },
      { cmd: "kubectl cluster-info", desc: "Adresses du control plane" },
      { cmd: "kubectl api-resources", desc: "Types de ressources et leurs abréviations" },
      { cmd: "kubectl explain pod.spec.containers", desc: "Documentation d'un champ, hors ligne" },
      { cmd: "kubectl version", desc: "Versions du client et du serveur" }
    ]
  },
  {
    title: "Consulter",
    items: [
      { cmd: "kubectl get pods", desc: "Lister les Pods du namespace courant" },
      { cmd: "kubectl get pods -A", desc: "Lister les Pods de tous les namespaces" },
      { cmd: "kubectl get pods -o wide", desc: "Ajouter l'IP et le noeud d'exécution" },
      { cmd: "kubectl get pods -w", desc: "Suivre les changements en direct" },
      { cmd: "kubectl get pods --show-labels", desc: "Afficher les labels de chaque Pod" },
      { cmd: "kubectl get pods -l app=web", desc: "Filtrer par label" },
      { cmd: "kubectl get all", desc: "Pods, Services, Deployments, ReplicaSets" },
      { cmd: "kubectl describe pod <nom>", desc: "Détail complet, section Events incluse" },
      { cmd: "kubectl get pod <nom> -o yaml", desc: "Manifest tel que stocké par le cluster" },
      { cmd: "kubectl get pod <nom> -o jsonpath='{.status.podIP}'", desc: "Extraire un champ précis" },
      { cmd: "kubectl get events --sort-by=.lastTimestamp", desc: "Événements du namespace, du plus ancien au plus récent" }
    ]
  },
  {
    title: "Créer et modifier",
    items: [
      { cmd: "kubectl run web --image=nginx:1.30", desc: "Créer un Pod en impératif" },
      { cmd: "kubectl create deployment api --image=nginx:1.30 --replicas=3", desc: "Créer un Deployment" },
      { cmd: "kubectl apply -f manifest.yaml", desc: "Appliquer un manifest (création ou mise à jour)" },
      { cmd: "kubectl apply -f ./dossier/", desc: "Appliquer tous les manifests d'un dossier" },
      { cmd: "kubectl apply -k overlays/prod", desc: "Appliquer un overlay Kustomize" },
      { cmd: "kubectl delete -f manifest.yaml", desc: "Supprimer ce que le manifest décrit" },
      { cmd: "kubectl edit deployment api", desc: "Éditer une ressource dans $EDITOR" },
      { cmd: "kubectl patch service web -p '{\"spec\":{\"selector\":{\"app\":\"web\"}}}'", desc: "Modifier un champ précis" },
      { cmd: "kubectl label pod web env=prod", desc: "Ajouter un label (suffixer par - pour retirer)" },
      { cmd: "kubectl annotate deployment api kubernetes.io/change-cause=\"v2\"", desc: "Renseigner CHANGE-CAUSE" }
    ]
  },
  {
    title: "Générer du YAML",
    items: [
      { cmd: "kubectl run web --image=nginx:1.30 --dry-run=client -o yaml", desc: "Squelette de Pod, sans rien créer" },
      { cmd: "kubectl create deployment api --image=nginx:1.30 --dry-run=client -o yaml", desc: "Squelette de Deployment" },
      { cmd: "kubectl expose deployment api --port=80 --dry-run=client -o yaml", desc: "Squelette de Service" },
      { cmd: "kubectl create job test --image=busybox:1.37 --dry-run=client -o yaml", desc: "Squelette de Job" },
      { cmd: "kubectl apply -f app.yaml --dry-run=server", desc: "Valider côté API server sans appliquer" },
      { cmd: "kubectl kustomize overlays/prod", desc: "Rendre un overlay Kustomize sans l'appliquer" }
    ]
  },
  {
    title: "Deployments et scaling",
    items: [
      { cmd: "kubectl scale deployment api --replicas=5", desc: "Changer le nombre de réplicas" },
      { cmd: "kubectl set image deployment/api api=nginx:1.30", desc: "Déclencher un rolling update" },
      { cmd: "kubectl rollout status deployment/api", desc: "Suivre l'avancement d'un déploiement" },
      { cmd: "kubectl rollout history deployment/api", desc: "Historique des révisions" },
      { cmd: "kubectl rollout undo deployment/api", desc: "Revenir à la révision précédente" },
      { cmd: "kubectl rollout undo deployment/api --to-revision=2", desc: "Revenir à une révision précise" },
      { cmd: "kubectl rollout restart deployment/api", desc: "Recréer tous les Pods (recharge la config)" },
      { cmd: "kubectl autoscale deployment api --min=2 --max=10 --cpu-percent=70", desc: "Créer un HPA" },
      { cmd: "kubectl get hpa", desc: "État des autoscalers" }
    ]
  },
  {
    title: "Configuration et secrets",
    items: [
      { cmd: "kubectl create configmap app-conf --from-literal=LOG_LEVEL=debug", desc: "ConfigMap depuis une valeur" },
      { cmd: "kubectl create configmap app-conf --from-file=config.properties", desc: "ConfigMap depuis un fichier" },
      { cmd: "kubectl create secret generic db --from-literal=password=s3cret", desc: "Secret générique" },
      { cmd: "kubectl get secret db -o jsonpath='{.data.password}' | base64 -d", desc: "Décoder la valeur d'un Secret" },
      { cmd: "kubectl set env deployment/api LOG_LEVEL=debug", desc: "Poser une variable d'environnement" },
      { cmd: "kubectl set resources deployment/api --requests=cpu=100m --limits=cpu=500m", desc: "Poser requests et limits" }
    ]
  },
  {
    title: "Réseau",
    items: [
      { cmd: "kubectl expose deployment api --port=80 --target-port=8080", desc: "Créer un Service ClusterIP" },
      { cmd: "kubectl get svc", desc: "Lister les Services" },
      { cmd: "kubectl get endpoints web-svc", desc: "IPs des Pods derrière un Service" },
      { cmd: "kubectl port-forward svc/web-svc 8080:80", desc: "Rediriger un port local vers un Service" },
      { cmd: "kubectl port-forward pod/web 8080:80", desc: "Court-circuiter le Service pour tester un Pod" },
      { cmd: "kubectl get ingress", desc: "Lister les Ingress" },
      { cmd: "kubectl get networkpolicies -A", desc: "Lister les Network Policies" },
      { cmd: "kubectl run dns --rm -it --image=busybox:1.37 -- nslookup web-svc", desc: "Tester la résolution DNS interne" }
    ]
  },
  {
    title: "Diagnostic",
    items: [
      { cmd: "kubectl get pods -A | grep -v Running", desc: "Repérer ce qui ne va pas dans le cluster" },
      { cmd: "kubectl logs <pod>", desc: "Logs du conteneur" },
      { cmd: "kubectl logs <pod> --previous", desc: "Logs de l'instance précédente, après un crash" },
      { cmd: "kubectl logs <pod> -c <conteneur>", desc: "Logs d'un conteneur précis" },
      { cmd: "kubectl logs -f -l app=api", desc: "Suivre les logs de tous les Pods d'un label" },
      { cmd: "kubectl exec -it <pod> -- sh", desc: "Ouvrir un shell dans un conteneur" },
      { cmd: "kubectl debug <pod> -it --image=busybox:1.37 --target=<conteneur>", desc: "Conteneur éphémère de debug" },
      { cmd: "kubectl debug <pod> -it --copy-to=debug --image=busybox:1.37 -- sh", desc: "Copie inspectable d'un Pod qui crashe" },
      { cmd: "kubectl debug node/<noeud> -it --image=busybox:1.37", desc: "Shell sur le système de fichiers d'un noeud" },
      { cmd: "kubectl top pods", desc: "Consommation CPU et mémoire des Pods" },
      { cmd: "kubectl top nodes", desc: "Consommation CPU et mémoire des noeuds" },
      { cmd: "kubectl auth can-i create pods --as=system:serviceaccount:dev:sa", desc: "Vérifier un droit RBAC" }
    ]
  },
  {
    title: "Noeuds et maintenance",
    items: [
      { cmd: "kubectl get nodes", desc: "État des noeuds" },
      { cmd: "kubectl describe node <nom>", desc: "Conditions, capacité, Pods hébergés" },
      { cmd: "kubectl label node worker-1 disktype=ssd", desc: "Poser un label de noeud" },
      { cmd: "kubectl taint node worker-3 gpu=true:NoSchedule", desc: "Poser un taint (suffixer par - pour retirer)" },
      { cmd: "kubectl cordon worker-2", desc: "Interdire tout nouveau Pod sur un noeud" },
      { cmd: "kubectl drain worker-2 --ignore-daemonsets --delete-emptydir-data", desc: "Vider un noeud avant maintenance" },
      { cmd: "kubectl uncordon worker-2", desc: "Remettre un noeud en service" },
      { cmd: "kubectl get --raw='/readyz?verbose'", desc: "État de santé détaillé de l'API server" }
    ]
  },
  {
    title: "Helm",
    items: [
      { cmd: "helm repo add bitnami https://charts.bitnami.com/bitnami", desc: "Ajouter un dépôt de charts" },
      { cmd: "helm repo update", desc: "Rafraîchir l'index des dépôts" },
      { cmd: "helm search repo redis", desc: "Chercher un chart" },
      { cmd: "helm install cache bitnami/redis", desc: "Installer un chart" },
      { cmd: "helm template mon-app ./chart", desc: "Rendre les templates sans rien installer" },
      { cmd: "helm list -A", desc: "Releases de tous les namespaces" },
      { cmd: "helm upgrade mon-app ./chart --set replicaCount=3", desc: "Mettre à jour une release" },
      { cmd: "helm rollback mon-app 1", desc: "Revenir à une révision précédente" },
      { cmd: "helm uninstall mon-app", desc: "Supprimer une release" }
    ]
  },
  {
    title: "minikube",
    items: [
      { cmd: "minikube start", desc: "Démarrer le cluster local" },
      { cmd: "minikube status", desc: "État du cluster" },
      { cmd: "minikube stop", desc: "Arrêter sans supprimer" },
      { cmd: "minikube delete", desc: "Supprimer le cluster" },
      { cmd: "minikube addons list", desc: "Lister les modules disponibles" },
      { cmd: "minikube addons enable ingress", desc: "Activer le contrôleur Ingress nginx" },
      { cmd: "minikube addons enable metrics-server", desc: "Activer les métriques (requis par l'HPA)" },
      { cmd: "minikube service web-svc --url", desc: "URL d'accès à un Service NodePort" },
      { cmd: "minikube dashboard", desc: "Ouvrir le tableau de bord web" }
    ]
  }
];
