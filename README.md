# kubeclimb

Formation interactive Kubernetes en Français. Un binaire, un navigateur, c'est parti.

12 modules progressifs couvrant les fondamentaux jusqu'au déploiement complet d'une application. Progression sauvegardée localement avec un système de badges.

## Démarrage rapide

### Binaire pré-compilé

Télécharger le binaire correspondant à votre plateforme depuis les [Releases](../../releases), puis :

```sh
chmod +x kubeclimb-*
./kubeclimb-darwin-arm64   # macOS Apple Silicon
./kubeclimb-darwin-amd64   # macOS Intel
./kubeclimb-linux-amd64    # Linux
```

Le navigateur s'ouvre automatiquement sur `http://localhost:8042`.

### Depuis les sources

```sh
git clone https://github.com/karl-cta/kubeclimb.git
cd kubeclimb
go build -o kubeclimb .
./kubeclimb
```

## Prérequis pour la formation

- Un terminal
- Un navigateur
- macOS ou Debian/Ubuntu
- minikube + kubectl (installation guidée dans le module 2)

## Contenu

| # | Module | Sujet |
|---|--------|-------|
| 1 | Kubernetes, c'est quoi ? | Architecture et concepts |
| 2 | Installation | minikube, kubectl |
| 3 | Pods | Création, lifecycle, debug |
| 4 | Deployments & Scaling | ReplicaSets, rolling updates |
| 5 | Configuration | ConfigMaps, Secrets |
| 6 | Services & Réseau | ClusterIP, NodePort, DNS |
| 7 | Stockage | PV, PVC, StorageClasses |
| 8 | Workloads avancés | StatefulSets, Jobs, probes |
| 9 | Ingress & Routage | nginx-ingress, Gateway API |
| 10 | Sécurité | RBAC, Network Policies |
| 11 | Helm & Observabilité | Helm, Prometheus, troubleshooting |
| 12 | Projet final | Application complète |

Chaque module comprend des sections théoriques, des exercices pratiques guidés, des commandes à pratiquer et un quiz de validation (seuil de réussite à 70%).

## Progression

La progression est sauvegardée dans `~/.kubeclimb/progress.json` et peut être exportée depuis l'interface.

## Options

```
./kubeclimb -port 9090   # utiliser un port différent
```

## Releases automatiques

Le dépôt inclut un workflow GitHub Actions qui, lors du push d'un tag `v*`, cross-compile le binaire pour macOS (Intel + Apple Silicon) et Linux, puis crée automatiquement une release GitHub avec les binaires attachés.

```sh
git tag v1.0.0
git push origin v1.0.0   # déclenche le build et la release
```

## À propos

Ce projet a été généré avec l'aide de l'IA (Claude). Le contenu pédagogique a été vérifié pour son exactitude technique : commandes kubectl, manifests YAML, architecture Kubernetes, et bonnes pratiques sont conformes à la documentation officielle Kubernetes. Les versions mentionnées (Kubernetes 1.31, minikube, Helm 3, Prometheus) sont à jour. L'ensemble peut servir de support fiable pour apprendre Kubernetes de zéro.

## Licence

MIT
