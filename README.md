# kubeclimb

Formation interactive Kubernetes en Français. Un binaire, un navigateur, c'est parti.

15 modules progressifs couvrant les fondamentaux jusqu'au déploiement complet d'une application. Les exercices se valident **contre ton vrai cluster**, pas en cochant une case. Aide-mémoire kubectl, mode révision, examen blanc CKA, progression sauvegardée localement et système de badges.

## Démarrage rapide

### Binaire pré-compilé

Télécharger le binaire correspondant à votre plateforme depuis les [Releases](../../releases), puis :

```sh
chmod +x kubeclimb-*
./kubeclimb-darwin-arm64   # macOS Apple Silicon
./kubeclimb-darwin-amd64   # macOS Intel
./kubeclimb-linux-amd64    # Linux
```

Chaque release publie aussi `SHA256SUMS.txt`. Pour vérifier le binaire téléchargé :

```sh
shasum -a 256 -c SHA256SUMS.txt --ignore-missing   # macOS
sha256sum -c SHA256SUMS.txt --ignore-missing       # Linux
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
- minikube + kubectl (installation guidée dans le module 2, indispensables pour la validation des exercices)

## Contenu

| # | Module | Sujet |
|---|--------|-------|
| 1 | Kubernetes, c'est quoi ? | Architecture et concepts |
| 2 | Installation | minikube, kubectl, contextes, outils |
| 3 | Pods | Création, lifecycle, sidecars natifs, debug |
| 4 | Deployments et Scaling | ReplicaSets, rolling updates, rollback |
| 5 | Configuration | ConfigMaps, Secrets |
| 6 | Services et Réseau | ClusterIP, NodePort, DNS |
| 7 | Stockage | PV, PVC, StorageClasses |
| 8 | Workloads avancés | StatefulSets, Jobs, probes, ressources |
| 9 | Ingress et Routage | nginx-ingress, Gateway API |
| 10 | Sécurité | RBAC, Network Policies, Pod Security Admission |
| 11 | Scheduling et placement | nodeSelector, affinités, taints, topology spread |
| 12 | Autoscaling et résilience | metrics-server, HPA, quotas, PodDisruptionBudget |
| 13 | Helm, Kustomize et Observabilité | Charts, overlays, Prometheus, Grafana |
| 14 | Troubleshooting méthodique | Diagnostic en couches, kubectl debug, chaîne réseau |
| 15 | Projet final | Application complète |

Chaque module comprend des sections théoriques, des exercices pratiques guidés, des commandes à pratiquer et un quiz de validation (seuil de réussite à 70%). Au total : 70 questions de quiz, 29 exercices et 54 commandes à saisir.

Trois vues transverses complètent le parcours :

- **Aide-mémoire** : une centaine de commandes kubectl, minikube et helm regroupées par usage, filtrables et copiables.
- **Révision** : rejoue toutes les questions dans le désordre, ou uniquement celles que tu as ratées.
- **Examen blanc CKA** : 20 questions tirées selon les pondérations officielles de l'examen (Troubleshooting 30%, Architecture 25%, Réseau 20%, Workloads 15%, Stockage 10%), 30 minutes au chronomètre, seuil de réussite à 66% et résultat détaillé par domaine.

## Validation sur ton cluster

Chaque exercice porte un bouton **Vérifier sur le cluster**. kubeclimb interroge alors ton cluster et te dit précisément ce qui manque :

```
ok      Le Deployment web-server est déclaré
ok      Il déploie bien nginx
échec   Au moins un réplica est prêt    trouvé : 0
```

Les commandes de vérification sont déclarées dans le contenu, jamais saisies dans le navigateur, et l'API n'accepte qu'une liste blanche de verbes en lecture seule (`get`, `describe`, `logs`, `top`, `version`...). kubeclimb ne peut rien créer, modifier ni supprimer dans ton cluster. Les requêtes venant d'une autre origine que localhost sont rejetées.

Si kubectl est absent ou qu'aucun cluster ne répond, l'interface le dit et le reste de la formation fonctionne normalement.

## Recherche

`⌘K` (ou `Ctrl+K`, ou simplement `/`) ouvre une recherche globale sur les titres de modules, les sections, le texte des cours et l'aide-mémoire. Entrée ouvre la section ; sur une commande, Entrée la copie.

## Progression

La progression est sauvegardée dans `~/.kubeclimb/progress.json`, en écriture atomique. Sont conservés : les modules terminés, les sections lues, les meilleurs scores de quiz, les exercices validés sur le cluster, les résultats d'examens blancs, les badges débloqués et la liste des questions à revoir.

Les boutons **Exporter** et **Importer** de la barre latérale permettent de sauvegarder sa progression et de la reprendre sur une autre machine.

Chaque vue a son URL (`#/module/7`, `#/aide-memoire`, `#/examen`) : les liens sont partageables et le bouton retour du navigateur fonctionne.

Raccourcis clavier : `⌘K` rechercher, `←` `→` naviguer entre les modules, `Échap` revenir au tableau de bord.

## Options

```
./kubeclimb -port 9090   # utiliser un port différent
```

## Développement

```sh
make run     # build + lance
make test    # go vet + tests
make release # cross-compile les 3 binaires et calcule les SHA256
```

Les tests vérifient la liste blanche kubectl et les invariants du contenu : ids de modules consécutifs, réponses de quiz dans les bornes, blocs de code tous munis d'un bouton Copier, commandes de validation toutes acceptées par l'API.

## Releases automatiques

Le dépôt inclut un workflow GitHub Actions qui, lors du push d'un tag `v*`, cross-compile le binaire pour macOS (Intel + Apple Silicon) et Linux, puis crée automatiquement une release GitHub avec les binaires et leurs empreintes SHA256 attachés.

```sh
git tag v1.1.0
git push origin v1.1.0   # déclenche le build et la release
```

## À propos

Ce projet a été généré avec l'aide de l'IA (Claude). Le contenu pédagogique a été vérifié pour son exactitude technique : commandes kubectl, manifests YAML, architecture Kubernetes et bonnes pratiques sont conformes à la documentation officielle.

Contenu à jour au 31 août 2026 : Kubernetes 1.36/1.37, minikube 1.38, Gateway API 1.5, Helm 3. Les API supprimées ou dépréciées (PodSecurityPolicy, `kubectl --record`) sont signalées comme telles plutôt que passées sous silence, car elles restent présentes dans beaucoup de tutoriels en ligne.

## Licence

MIT
