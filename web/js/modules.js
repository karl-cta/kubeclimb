const MODULES = [
{
    id: 1,
    title: "Kubernetes, c'est quoi ?",
    desc: "Pourquoi Kubernetes existe, son architecture et ses concepts fondamentaux",
    objectives: [
      "Comprendre le problème que Kubernetes résout",
      "Connaître l'architecture d'un cluster (control plane + workers)",
      "Maîtriser le vocabulaire de base (Pod, Service, Deployment)"
    ],
    sections: [
      {
        title: "Le problème",
        content: `<p>Imagine que tu as une application web. Au début, tu la lances sur un serveur. Ça marche. Mais un jour, le trafic explose et ton serveur ne suit plus. Tu ajoutes un deuxième serveur, puis un troisième. Maintenant tu dois gérer : quel serveur fait tourner quoi ? Que se passe-t-il si un serveur tombe ? Comment mettre à jour sans couper le service ?</p>
<p>C'est exactement le problème que <strong>Kubernetes</strong> (souvent abrégé <strong>K8s</strong>) résout. C'est un système d'<strong>orchestration de conteneurs</strong> : il prend tes conteneurs (tes applications empaquetées dans Docker par exemple) et les répartit intelligemment sur un ensemble de machines.</p>
<p>Kubernetes a été créé par Google en 2014, basé sur leur expérience interne avec un système appelé Borg. Aujourd'hui, c'est le standard de l'industrie pour déployer des applications en production.</p>
<div class="info-box note">K8s = K + 8 lettres + s. C'est juste un raccourci pour "Kubernetes". Tu verras les deux formes partout.</div>`
      },
      {
        title: "Architecture d'un cluster",
        content: `<p>Un <strong>cluster Kubernetes</strong> est un ensemble de machines (physiques ou virtuelles) organisées en deux types de nœuds :</p>
<div class="diagram">
<span class="d-accent">CONTROL PLANE</span>                        <span class="d-accent">WORKER NODES</span>
+---------------------------+         +---------------------------+
|  API Server               |         |  kubelet                  |
|  (point d'entrée unique)  |         |  (agent sur chaque nœud)  |
|                           |         |                           |
|  etcd                     |         |  kube-proxy               |
|  (base de données clé/val)|         |  (règles réseau)          |
|                           |         |                           |
|  Scheduler                |         |  Container Runtime        |
|  (place les Pods)         |         |  (Docker, containerd)     |
|                           |         |                           |
|  Controller Manager       |         |  [Pod] [Pod] [Pod]        |
|  (boucle de contrôle)     |         |                           |
+---------------------------+         +---------------------------+
</div>
<p><strong>Le Control Plane</strong> est le cerveau du cluster :</p>
<ul>
<li><strong>API Server</strong> : le point d'entrée unique. Toutes les commandes passent par lui (kubectl, interfaces, etc.)</li>
<li><strong>etcd</strong> : une base de données clé-valeur qui stocke tout l'état du cluster</li>
<li><strong>Scheduler</strong> : décide sur quel nœud placer un nouveau Pod (en fonction des ressources disponibles)</li>
<li><strong>Controller Manager</strong> : surveille en permanence l'état du cluster et agit pour le maintenir dans l'état désiré</li>
</ul>
<p><strong>Les Worker Nodes</strong> exécutent les applications :</p>
<ul>
<li><strong>kubelet</strong> : agent présent sur chaque nœud, il communique avec l'API Server et s'assure que les conteneurs tournent</li>
<li><strong>kube-proxy</strong> : gère les règles réseau pour que les Pods puissent communiquer entre eux et avec l'extérieur</li>
<li><strong>Container Runtime</strong> : le moteur qui fait tourner les conteneurs (containerd est le plus courant)</li>
</ul>`
      },
      {
        title: "Le modèle déclaratif",
        content: `<p>Kubernetes fonctionne sur un modèle <strong>déclaratif</strong>. Ça veut dire que tu ne dis pas "lance 3 conteneurs". Tu dis "je veux 3 réplicas de mon application". Kubernetes s'occupe du reste.</p>
<p>La différence est fondamentale :</p>
<ul>
<li><strong>Impératif</strong> : "Fais ceci, puis cela" (des ordres directs)</li>
<li><strong>Déclaratif</strong> : "Voilà l'état que je veux" (une description de l'objectif)</li>
</ul>
<p>Tu écris l'état désiré dans un fichier <strong>YAML</strong>, tu l'envoies à Kubernetes, et sa <strong>boucle de réconciliation</strong> travaille en continu pour maintenir cet état. Si un Pod tombe, Kubernetes en relance un automatiquement.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Exemple : je veux 3 réplicas de nginx</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-app</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">3</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">mon-app</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">mon-app</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">nginx</span>
        <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Tu n'as pas besoin de comprendre ce fichier en détail maintenant. On va tout découper dans les modules suivants. Retiens juste l'idée : tu <strong>déclares</strong> ce que tu veux, K8s <strong>s'en occupe</strong>.</div>`
      },
      {
        title: "Les objets Kubernetes",
        content: `<p>Tout dans Kubernetes est un <strong>objet</strong>. Voici les principaux que tu vas manipuler :</p>
<ul>
<li><strong>Pod</strong> : la plus petite unité déployable. Un Pod contient un ou plusieurs conteneurs qui partagent le même réseau et le même stockage</li>
<li><strong>Deployment</strong> : gère un ensemble de Pods identiques. S'occupe des mises à jour et du scaling</li>
<li><strong>Service</strong> : expose un ensemble de Pods sur le réseau. Donne une adresse stable pour y accéder</li>
<li><strong>ConfigMap</strong> : stocke de la configuration (variables d'environnement, fichiers de config)</li>
<li><strong>Secret</strong> : comme un ConfigMap, mais pour les données sensibles (mots de passe, clés API)</li>
<li><strong>Namespace</strong> : un espace isolé dans le cluster pour organiser les ressources</li>
</ul>
<p>Chaque objet est défini par un fichier YAML avec 4 champs obligatoires :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>          <span class="hl-comment"># version de l'API</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>               <span class="hl-comment"># type d'objet</span>
<span class="hl-key">metadata</span>:                <span class="hl-comment"># identité (nom, labels)</span>
  <span class="hl-key">name</span>: <span class="hl-str">mon-pod</span>
<span class="hl-key">spec</span>:                    <span class="hl-comment"># l'état désiré</span>
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">nginx</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx</span></code></pre><button class="copy-btn">Copier</button></div>`
      }
    ],
    exercises: [],
    commands: [],
    quiz: [
      {
        question: "Quel composant du Control Plane stocke tout l'état du cluster ?",
        options: ["API Server", "etcd", "Scheduler", "Controller Manager"],
        correct: 1,
        explanation: "etcd est la base de données clé-valeur qui stocke l'intégralité de l'état du cluster. C'est la source de vérité unique de Kubernetes."
      },
      {
        question: "Quelle est la différence entre le mode impératif et déclaratif ?",
        options: [
          "Impératif est plus rapide",
          "Déclaratif décrit l'état désiré, impératif donne des ordres directs",
          "Ils sont identiques",
          "Déclaratif ne fonctionne qu'avec YAML"
        ],
        correct: 1,
        explanation: "En mode déclaratif, on décrit l'état final souhaité et Kubernetes s'occupe d'y arriver. En mode impératif, on donne des commandes directes (crée ceci, supprime cela)."
      },
      {
        question: "Quel est le rôle du kubelet ?",
        options: [
          "Stocker l'état du cluster",
          "Exposer les Services sur le réseau",
          "S'assurer que les conteneurs tournent sur un nœud",
          "Décider sur quel nœud placer un Pod"
        ],
        correct: 2,
        explanation: "Le kubelet est l'agent présent sur chaque Worker Node. Il communique avec l'API Server et s'assure que les conteneurs spécifiés dans les Pods sont en cours d'exécution."
      },
      {
        question: "Quelle est la plus petite unité déployable dans Kubernetes ?",
        options: ["Conteneur", "Pod", "Deployment", "Node"],
        correct: 1,
        explanation: "Le Pod est la plus petite unité déployable. Un Pod peut contenir un ou plusieurs conteneurs qui partagent le même espace réseau et stockage."
      }
    ]
  },
{
  id: 2,
  title: "Installation de l'environnement",
  desc: "Installer minikube et kubectl pour créer ton premier cluster Kubernetes en local",
  objectives: [
    "Installer minikube sur macOS ou Debian/Ubuntu",
    "Installer kubectl et configurer l'autocomplétion",
    "Démarrer un cluster local et vérifier qu'il fonctionne",
    "Exécuter tes premières commandes kubectl"
  ],
  sections: [
    {
      title: "Prérequis",
      content: `<p>Avant d'installer quoi que ce soit, vérifions que ta machine est prête. Pour suivre ce module, tu as besoin de :</p>
<ul>
<li><strong>Un ordinateur</strong> sous macOS ou Linux (Debian/Ubuntu). Windows fonctionne aussi avec WSL2, mais on se concentrera sur macOS et Debian/Ubuntu ici.</li>
<li><strong>Un terminal</strong> : Terminal.app sur macOS, ou n'importe quel terminal sur Linux.</li>
<li><strong>Un hyperviseur ou un runtime de conteneurs</strong> : minikube a besoin d'un « driver » pour créer la machine virtuelle ou le conteneur qui hébergera ton cluster. Le plus simple est <strong>Docker Desktop</strong> sur macOS ou <strong>Docker Engine</strong> sur Linux.</li>
<li><strong>Au moins 2 Go de RAM disponibles</strong> et <strong>2 CPU</strong> pour le cluster.</li>
</ul>
<div class="info-box note">Si tu n'as pas encore Docker, installe-le d'abord. Sur macOS : télécharge Docker Desktop depuis docker.com. Sur Ubuntu/Debian : suis la documentation officielle de Docker Engine.</div>
<p>On va installer deux outils :</p>
<ul>
<li><strong>minikube</strong> : crée un cluster Kubernetes complet sur ta machine. C'est un cluster à un seul noeud, parfait pour apprendre.</li>
<li><strong>kubectl</strong> (prononcé « koube-control » ou « koube-c-t-l ») : l'outil en ligne de commande pour interagir avec n'importe quel cluster Kubernetes.</li>
</ul>
<div class="diagram">
  +------------------+         +---------------------+
  |  <span class="d-accent">Ton terminal</span>    | ------> |  <span class="d-accent">kubectl</span>             |
  +------------------+         +----------+----------+
                                          |
                                          v
                               +----------+----------+
                               |  <span class="d-accent">minikube</span>            |
                               |  (cluster local K8s) |
                               |  Control Plane       |
                               |  + Worker Node       |
                               +----------------------+
</div>`
    },
    {
      title: "Installer minikube",
      content: `<p>L'installation dépend de ton système d'exploitation. Suis la section qui te concerne.</p>
<h3>Sur macOS (avec Homebrew)</h3>
<p>Si tu n'as pas Homebrew, installe-le d'abord (voir brew.sh). Ensuite :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ brew install minikube</span></code></pre><button class="copy-btn">Copier</button></div>
<p>C'est tout. Homebrew s'occupe de télécharger le binaire et de le placer dans ton PATH.</p>
<h3>Sur Debian / Ubuntu (avec apt)</h3>
<p>Télécharge le paquet .deb et installe-le :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb</span>
<span class="hl-cmd">$ sudo dpkg -i minikube_latest_amd64.deb</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Sur une machine ARM (Raspberry Pi, Mac M1/M2/M3 sous Linux), remplace <code>amd64</code> par <code>arm64</code> dans l'URL.</div>
<h3>Vérifier l'installation</h3>
<p>Une fois installé, vérifie que minikube est bien accessible :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ minikube version</span>
minikube version: v1.34.0</code></pre><button class="copy-btn">Copier</button></div>
<h3>Démarrer ton premier cluster</h3>
<p>Lance la commande suivante pour créer et démarrer un cluster Kubernetes local :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ minikube start</span></code></pre><button class="copy-btn">Copier</button></div>
<p>La première exécution prend quelques minutes : minikube télécharge l'image du noeud Kubernetes, configure le réseau, démarre le control plane, etc. À la fin, tu devrais voir un message de succès indiquant que kubectl est configuré pour utiliser le cluster « minikube ».</p>
<div class="info-box note">Par défaut, minikube utilise le driver Docker. Si tu préfères un autre driver (VirtualBox, Hyper-V, etc.), tu peux le spécifier avec <code>minikube start --driver=virtualbox</code>.</div>
<p>Quelques commandes utiles pour gérer ton cluster minikube :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ minikube status</span>          <span class="hl-comment"># vérifier l'état du cluster</span>
<span class="hl-cmd">$ minikube stop</span>            <span class="hl-comment"># arrêter le cluster (sans le supprimer)</span>
<span class="hl-cmd">$ minikube delete</span>          <span class="hl-comment"># supprimer complètement le cluster</span>
<span class="hl-cmd">$ minikube dashboard</span>      <span class="hl-comment"># ouvrir le tableau de bord web</span></code></pre><button class="copy-btn">Copier</button></div>`
    },
    {
      title: "Installer kubectl",
      content: `<p><strong>kubectl</strong> est l'outil indispensable pour parler à ton cluster Kubernetes. Toutes les opérations passent par lui : créer des Pods, vérifier l'état du cluster, lire des logs, etc.</p>
<h3>Sur macOS (avec Homebrew)</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ brew install kubectl</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Sur Debian / Ubuntu (avec apt)</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Ajouter le dépôt officiel Kubernetes</span>
<span class="hl-cmd">$ sudo apt-get update</span>
<span class="hl-cmd">$ sudo apt-get install -y apt-transport-https ca-certificates curl</span>
<span class="hl-cmd">$ curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg</span>
<span class="hl-cmd">$ echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list</span>
<span class="hl-cmd">$ sudo apt-get update</span>
<span class="hl-cmd">$ sudo apt-get install -y kubectl</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Vérifier l'installation</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl version --client</span>
Client Version: v1.31.0
Kustomize Version: v5.4.2</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Note : minikube embarque sa propre copie de kubectl. Tu peux l'utiliser avec <code>minikube kubectl -- get pods</code>. Cependant, installer kubectl séparément est recommandé car tu l'utiliseras aussi avec de vrais clusters plus tard.</div>
<h3>Configurer l'autocomplétion</h3>
<p>L'autocomplétion te fait gagner un temps précieux. Elle complète automatiquement les noms de commandes, de ressources et même de Pods quand tu appuies sur Tab.</p>
<p><strong>Pour Bash :</strong></p>
<div class="code-block"><pre><code><span class="hl-cmd">$ echo 'source <(kubectl completion bash)' >> ~/.bashrc</span>
<span class="hl-cmd">$ source ~/.bashrc</span></code></pre><button class="copy-btn">Copier</button></div>
<p><strong>Pour Zsh :</strong></p>
<div class="code-block"><pre><code><span class="hl-cmd">$ echo 'source <(kubectl completion zsh)' >> ~/.zshrc</span>
<span class="hl-cmd">$ source ~/.zshrc</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Créer un alias</h3>
<p>La plupart des utilisateurs de Kubernetes créent un alias <code>k</code> pour taper plus vite :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ echo 'alias k=kubectl' >> ~/.bashrc</span>
<span class="hl-cmd">$ echo 'complete -o default -F __start_kubectl k' >> ~/.bashrc</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Après cela, <code>k get pods</code> équivaut à <code>kubectl get pods</code>.</p>`
    },
    {
      title: "Premiers pas",
      content: `<p>Ton cluster tourne, kubectl est installé. Lançons tes premières commandes pour vérifier que tout fonctionne.</p>
<h3>Vérifier la connexion au cluster</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl cluster-info</span>
Kubernetes control plane is running at https://127.0.0.1:49157
CoreDNS is running at https://127.0.0.1:49157/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy</code></pre><button class="copy-btn">Copier</button></div>
<p>Si tu vois ces informations, bravo : kubectl communique bien avec ton cluster minikube.</p>
<h3>Lister les noeuds</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get nodes</span>
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   2m    v1.31.0</code></pre><button class="copy-btn">Copier</button></div>
<p>Tu as un seul noeud nommé « minikube » avec le rôle <strong>control-plane</strong>. Dans un vrai cluster, tu verrais plusieurs noeuds ici.</p>
<h3>Explorer les ressources du système</h3>
<p>Kubernetes utilise un namespace spécial appelé <code>kube-system</code> pour ses propres composants. Jetons un oeil :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get pods -n kube-system</span>
NAME                               READY   STATUS    RESTARTS   AGE
coredns-7db6d8ff4d-abc12           1/1     Running   0          3m
etcd-minikube                      1/1     Running   0          3m
kube-apiserver-minikube            1/1     Running   0          3m
kube-controller-manager-minikube   1/1     Running   0          3m
kube-proxy-xyz45                   1/1     Running   0          3m
kube-scheduler-minikube            1/1     Running   0          3m</code></pre><button class="copy-btn">Copier</button></div>
<p>Tu reconnais les composants vus dans le module 1 : l'API Server, etcd, le Scheduler, le Controller Manager, kube-proxy et CoreDNS (le service DNS interne).</p>
<h3>Obtenir des informations détaillées</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl version</span>            <span class="hl-comment"># version du client et du serveur</span>
<span class="hl-cmd">$ kubectl get namespaces</span>     <span class="hl-comment"># lister les espaces de noms</span>
<span class="hl-cmd">$ kubectl api-resources</span>      <span class="hl-comment"># tous les types de ressources disponibles</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">La commande <code>kubectl api-resources</code> est très utile pour découvrir tous les types d'objets que ton cluster supporte. Elle affiche aussi les abréviations : par exemple, <code>po</code> pour Pods, <code>svc</code> pour Services, <code>deploy</code> pour Deployments.</div>`
    }
  ],
  exercises: [
    {
      title: "Exercice 1 : Installer minikube et démarrer un cluster",
      desc: "Installe minikube sur ta machine et lance ton premier cluster Kubernetes.",
      steps: [
        "Installe minikube avec la méthode adaptée à ton système (brew sur macOS, dpkg sur Debian/Ubuntu).",
        "Vérifie l'installation avec <code>minikube version</code>.",
        "Démarre un cluster avec <code>minikube start</code>.",
        "Vérifie que le cluster est en cours d'exécution avec <code>minikube status</code>."
      ],
      validation: "La commande <code>minikube status</code> doit afficher <code>host: Running</code>, <code>kubelet: Running</code> et <code>apiserver: Running</code>.",
      hint: "Si minikube start échoue, vérifie que Docker est bien lancé avec <code>docker ps</code>. Le driver Docker doit être actif."
    },
    {
      title: "Exercice 2 : Installer kubectl et vérifier la connexion",
      desc: "Installe kubectl et vérifie qu'il peut communiquer avec ton cluster minikube.",
      steps: [
        "Installe kubectl avec la méthode adaptée à ton système.",
        "Vérifie l'installation avec <code>kubectl version --client</code>.",
        "Teste la connexion au cluster avec <code>kubectl cluster-info</code>.",
        "Liste les noeuds du cluster avec <code>kubectl get nodes</code>.",
        "Configure l'autocomplétion pour ton shell (bash ou zsh)."
      ],
      validation: "La commande <code>kubectl get nodes</code> doit afficher un noeud <code>minikube</code> avec le statut <code>Ready</code>.",
      hint: "Si kubectl ne trouve pas le cluster, minikube a peut-être été arrêté. Relance-le avec <code>minikube start</code>."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande démarre un cluster minikube ?",
      answers: ["minikube start"]
    },
    {
      prompt: "Quelle commande liste tous les noeuds du cluster ?",
      answers: ["kubectl get nodes", "kubectl get node", "kubectl get no"]
    },
    {
      prompt: "Quelle commande affiche les informations de connexion au cluster ?",
      answers: ["kubectl cluster-info"]
    },
    {
      prompt: "Quelle commande affiche la version de kubectl et du serveur ?",
      answers: ["kubectl version"]
    }
  ],
  quiz: [
    {
      question: "Quel est le rôle de minikube ?",
      options: [
        "Déployer des applications en production",
        "Créer un cluster Kubernetes local pour le développement et l'apprentissage",
        "Remplacer Docker",
        "Gérer les serveurs cloud"
      ],
      correct: 1,
      explanation: "minikube crée un cluster Kubernetes complet sur ta machine locale. C'est un outil d'apprentissage et de développement, pas un outil de production."
    },
    {
      question: "Quelle commande permet d'activer l'autocomplétion de kubectl pour Bash ?",
      options: [
        "kubectl autocomplete bash",
        "kubectl enable completion",
        "source <(kubectl completion bash)",
        "kubectl --bash-completion"
      ],
      correct: 2,
      explanation: "La commande <code>source <(kubectl completion bash)</code> charge le script d'autocomplétion de kubectl dans ta session Bash courante. Pour la rendre permanente, on l'ajoute dans ~/.bashrc."
    },
    {
      question: "Quel namespace contient les composants internes de Kubernetes ?",
      options: [
        "default",
        "kube-public",
        "kube-system",
        "kubernetes-internal"
      ],
      correct: 2,
      explanation: "Le namespace <code>kube-system</code> contient tous les composants internes du cluster : l'API Server, etcd, le Scheduler, CoreDNS, kube-proxy, etc."
    },
    {
      question: "Que se passe-t-il quand tu exécutes 'minikube stop' ?",
      options: [
        "Le cluster est supprimé définitivement",
        "Le cluster est arrêté mais conservé, tu peux le relancer avec minikube start",
        "Seul kubectl est arrêté",
        "Le cluster continue en arrière-plan"
      ],
      correct: 1,
      explanation: "<code>minikube stop</code> arrête le cluster sans le supprimer. Toute ta configuration et tes données sont conservées. Pour tout supprimer, il faut utiliser <code>minikube delete</code>."
    }
  ]
},
{
  id: 3,
  title: "Les Pods",
  desc: "Comprendre le Pod, la brique fondamentale de Kubernetes, et apprendre à le créer et le débuguer",
  objectives: [
    "Comprendre ce qu'est un Pod et pourquoi c'est l'unité de base de Kubernetes",
    "Créer un Pod de manière impérative et déclarative (YAML)",
    "Comprendre le cycle de vie d'un Pod",
    "Découvrir les Pods multi-conteneurs et le pattern sidecar",
    "Savoir débuguer un Pod qui ne fonctionne pas"
  ],
  sections: [
    {
      title: "Qu'est-ce qu'un Pod ?",
      content: `<p>Un <strong>Pod</strong> est la plus petite unité que tu peux déployer dans Kubernetes. Ce n'est pas un conteneur : c'est une <strong>enveloppe</strong> autour d'un ou plusieurs conteneurs.</p>
<p>Pourquoi ne pas déployer des conteneurs directement ? Parce que Kubernetes a besoin d'une couche d'abstraction pour gérer :</p>
<ul>
<li><strong>Le réseau</strong> : chaque Pod reçoit sa propre adresse IP. Tous les conteneurs du Pod partagent cette adresse.</li>
<li><strong>Le stockage</strong> : les conteneurs d'un même Pod peuvent partager des volumes.</li>
<li><strong>Le cycle de vie</strong> : les conteneurs d'un même Pod démarrent et s'arrêtent ensemble.</li>
</ul>
<div class="diagram">
+-------------------------------------------+
|  <span class="d-accent">Pod</span> (adresse IP : 10.244.0.5)           |
|                                           |
|  +-----------------+  +-----------------+ |
|  | <span class="d-accent">Conteneur A</span>     |  | <span class="d-accent">Conteneur B</span>     | |
|  | (nginx)         |  | (log-collector) | |
|  | port 80         |  | port 9090       | |
|  +-----------------+  +-----------------+ |
|                                           |
|  +--------------------------------------+ |
|  | <span class="d-accent">Volume partagé</span> : /var/log             | |
|  +--------------------------------------+ |
+-------------------------------------------+
</div>
<p>Dans la grande majorité des cas, un Pod contient <strong>un seul conteneur</strong>. Les Pods multi-conteneurs sont réservés à des cas précis (qu'on verra plus loin dans ce module).</p>
<div class="info-box note">Retiens cette règle simple : <strong>un Pod = une instance de ton application</strong>. Si tu veux 3 instances de nginx, tu crées 3 Pods (en général via un Deployment, qu'on verra au module 4).</div>`
    },
    {
      title: "Créer un Pod",
      content: `<p>Il existe deux façons de créer un Pod : la méthode <strong>impérative</strong> (commande directe) et la méthode <strong>déclarative</strong> (fichier YAML).</p>
<h3>Méthode impérative</h3>
<p>La commande <code>kubectl run</code> crée un Pod directement :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl run mon-nginx --image=nginx:1.27</span>
pod/mon-nginx created</code></pre><button class="copy-btn">Copier</button></div>
<p>Vérifie que le Pod est créé :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get pods</span>
NAME        READY   STATUS    RESTARTS   AGE
mon-nginx   1/1     Running   0          10s</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">La méthode impérative est pratique pour tester rapidement. Mais en situation réelle, on utilise toujours la méthode déclarative pour pouvoir versionner les fichiers et reproduire les déploiements.</div>
<h3>Méthode déclarative (YAML)</h3>
<p>Crée un fichier <code>pod-nginx.yaml</code> :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-nginx</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">nginx</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">nginx</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">ports</span>:
    - <span class="hl-key">containerPort</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Détaillons chaque partie :</p>
<ul>
<li><strong>apiVersion: v1</strong> : les Pods font partie de l'API de base (core v1).</li>
<li><strong>kind: Pod</strong> : le type d'objet que l'on crée.</li>
<li><strong>metadata</strong> : le nom du Pod et ses labels (étiquettes pour l'identifier).</li>
<li><strong>spec</strong> : la spécification, c'est-à-dire ce qu'on veut. Ici, un conteneur nommé « nginx » basé sur l'image <code>nginx:1.27</code>, exposant le port 80.</li>
</ul>
<p>Applique ce fichier :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl apply -f pod-nginx.yaml</span>
pod/mon-nginx created</code></pre><button class="copy-btn">Copier</button></div>
<h3>Obtenir des détails sur un Pod</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl describe pod mon-nginx</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Cette commande affiche énormément d'informations : l'adresse IP du Pod, le noeud sur lequel il tourne, les événements (téléchargement de l'image, démarrage du conteneur, etc.), les volumes, et plus encore.</p>
<h3>Supprimer un Pod</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl delete pod mon-nginx</span>
pod "mon-nginx" deleted</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box warning">Quand tu supprimes un Pod créé manuellement, il disparaît définitivement. Kubernetes ne le recrée pas. C'est pour cela qu'en production on utilise des Deployments (module 4), qui recréent automatiquement les Pods supprimés.</div>`
    },
    {
      title: "Cycle de vie d'un Pod",
      content: `<p>Un Pod passe par plusieurs <strong>phases</strong> durant sa vie. Comprendre ces phases est essentiel pour diagnostiquer les problèmes.</p>
<div class="diagram">
  <span class="d-accent">Pending</span> -----> <span class="d-accent">Running</span> -----> <span class="d-accent">Succeeded</span>
     |               |
     |               +----------> <span class="d-accent">Failed</span>
     |
     +----------> <span class="d-accent">Unknown</span>
</div>
<ul>
<li><strong>Pending</strong> : le Pod a été accepté par Kubernetes, mais un ou plusieurs conteneurs ne sont pas encore prêts. Cela peut signifier que l'image est en cours de téléchargement, ou qu'aucun noeud n'a assez de ressources.</li>
<li><strong>Running</strong> : le Pod est assigné à un noeud et tous ses conteneurs sont en cours d'exécution (ou en train de démarrer/redémarrer).</li>
<li><strong>Succeeded</strong> : tous les conteneurs du Pod se sont terminés avec succès (code de sortie 0) et ne seront pas redémarrés. Typique des Jobs.</li>
<li><strong>Failed</strong> : tous les conteneurs se sont terminés, et au moins un a échoué (code de sortie non nul).</li>
<li><strong>Unknown</strong> : l'état du Pod ne peut pas être déterminé, généralement à cause d'un problème de communication avec le noeud.</li>
</ul>
<h3>Les états des conteneurs</h3>
<p>Au sein d'un Pod, chaque conteneur a aussi un état :</p>
<ul>
<li><strong>Waiting</strong> : le conteneur attend quelque chose (téléchargement de l'image, etc.). La raison est indiquée (par exemple <code>ContainerCreating</code> ou <code>ImagePullBackOff</code>).</li>
<li><strong>Running</strong> : le conteneur s'exécute normalement.</li>
<li><strong>Terminated</strong> : le conteneur s'est arrêté (soit avec succès, soit en erreur).</li>
</ul>
<h3>La politique de redémarrage</h3>
<p>Le champ <code>restartPolicy</code> détermine ce que Kubernetes fait quand un conteneur s'arrête :</p>
<div class="code-block"><pre><code><span class="hl-key">spec</span>:
  <span class="hl-key">restartPolicy</span>: <span class="hl-str">Always</span>     <span class="hl-comment"># par défaut : redémarre toujours</span>
  <span class="hl-comment"># Autres options :</span>
  <span class="hl-comment"># restartPolicy: OnFailure  (redémarre seulement en cas d'erreur)</span>
  <span class="hl-comment"># restartPolicy: Never      (ne redémarre jamais)</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note">Avec <code>restartPolicy: Always</code> (la valeur par défaut), si ton conteneur plante, Kubernetes le redémarre automatiquement. Le délai entre les tentatives augmente progressivement (10s, 20s, 40s... jusqu'à 5 minutes). C'est ce qu'on appelle le <strong>backoff exponentiel</strong>.</div>`
    },
    {
      title: "Pods multi-conteneurs",
      content: `<p>La plupart des Pods contiennent un seul conteneur. Mais parfois, il est utile de regrouper plusieurs conteneurs dans un même Pod parce qu'ils sont <strong>fortement couplés</strong> et doivent partager des ressources.</p>
<h3>Le pattern Sidecar</h3>
<p>Le pattern le plus courant est le <strong>sidecar</strong> (littéralement « side-car de moto »). Un conteneur principal fait le travail, et un conteneur secondaire l'assiste :</p>
<div class="diagram">
+--------------------------------------------------+
|  <span class="d-accent">Pod</span>                                             |
|                                                  |
|  +-------------------+  +----------------------+ |
|  | <span class="d-accent">app</span> (principal)    |  | <span class="d-accent">log-shipper</span> (sidecar)| |
|  | Écrit dans         |  | Lit depuis            | |
|  | /var/log/app.log   |->| /var/log/app.log      | |
|  +-------------------+  | Envoie vers ELK       | |
|                          +----------------------+ |
|  +----------------------------------------------+ |
|  | <span class="d-accent">Volume partagé</span> : logs                        | |
|  +----------------------------------------------+ |
+--------------------------------------------------+
</div>
<p>Exemples concrets de sidecars :</p>
<ul>
<li><strong>Collecteur de logs</strong> : lit les fichiers de log du conteneur principal et les envoie vers un système centralisé.</li>
<li><strong>Proxy réseau</strong> : gère le trafic réseau (chiffrement TLS, routage, etc.).</li>
<li><strong>Synchroniseur de données</strong> : télécharge régulièrement des fichiers de configuration depuis un dépôt Git.</li>
</ul>
<h3>Exemple YAML d'un Pod multi-conteneurs</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-avec-sidecar</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">busybox</span>
    <span class="hl-key">command</span>: [<span class="hl-str">"sh"</span>, <span class="hl-str">"-c"</span>, <span class="hl-str">"while true; do echo $(date) - Salut >> /var/log/app.log; sleep 5; done"</span>]
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">logs</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/var/log</span>
  - <span class="hl-key">name</span>: <span class="hl-str">sidecar</span>
    <span class="hl-key">image</span>: <span class="hl-str">busybox</span>
    <span class="hl-key">command</span>: [<span class="hl-str">"sh"</span>, <span class="hl-str">"-c"</span>, <span class="hl-str">"tail -f /var/log/app.log"</span>]
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">logs</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/var/log</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">logs</span>
    <span class="hl-key">emptyDir</span>: {}</code></pre><button class="copy-btn">Copier</button></div>
<p>Dans cet exemple, le conteneur <code>app</code> écrit des logs dans un fichier, et le conteneur <code>sidecar</code> lit ce fichier en continu. Ils partagent le volume <code>logs</code>.</p>
<div class="info-box note">Règle d'or : place plusieurs conteneurs dans un même Pod uniquement s'ils <strong>doivent</strong> partager des ressources (réseau, stockage). Si deux conteneurs peuvent fonctionner indépendamment, mets-les dans des Pods séparés.</div>`
    },
    {
      title: "Débuguer un Pod",
      content: `<p>Quand un Pod ne fonctionne pas, Kubernetes te donne plusieurs outils pour comprendre ce qui se passe.</p>
<h3>Étape 1 : Vérifier le statut</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get pods</span>
NAME        READY   STATUS             RESTARTS   AGE
mon-app     0/1     ImagePullBackOff   0          2m</code></pre><button class="copy-btn">Copier</button></div>
<p>Les statuts problématiques les plus courants :</p>
<ul>
<li><strong>ImagePullBackOff / ErrImagePull</strong> : Kubernetes n'arrive pas à télécharger l'image. Vérifie le nom et le tag de l'image.</li>
<li><strong>CrashLoopBackOff</strong> : le conteneur démarre, plante, est redémarré, plante à nouveau... en boucle. Vérifie les logs.</li>
<li><strong>Pending</strong> prolongé : aucun noeud ne peut accueillir le Pod (ressources insuffisantes, contraintes non satisfaites).</li>
<li><strong>ContainerCreating</strong> prolongé : souvent un problème de montage de volume ou de téléchargement d'image.</li>
</ul>
<h3>Étape 2 : Regarder les événements</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl describe pod mon-app</span></code></pre><button class="copy-btn">Copier</button></div>
<p>La section <strong>Events</strong> tout en bas de la sortie est ta meilleure amie pour le debug. Elle montre chronologiquement ce que Kubernetes a essayé de faire et les erreurs rencontrées.</p>
<h3>Étape 3 : Lire les logs</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl logs mon-app</span>                    <span class="hl-comment"># logs du conteneur principal</span>
<span class="hl-cmd">$ kubectl logs mon-app -c sidecar</span>          <span class="hl-comment"># logs d'un conteneur spécifique</span>
<span class="hl-cmd">$ kubectl logs mon-app --previous</span>          <span class="hl-comment"># logs du conteneur précédent (après un crash)</span>
<span class="hl-cmd">$ kubectl logs mon-app -f</span>                  <span class="hl-comment"># suivre les logs en temps réel</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Étape 4 : Se connecter au conteneur</h3>
<p>Si le conteneur tourne mais se comporte bizarrement, tu peux ouvrir un shell à l'intérieur :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl exec -it mon-app -- /bin/bash</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Tu te retrouves dans le conteneur et tu peux explorer : vérifier les fichiers, tester la connectivité réseau, examiner les processus, etc.</p>
<div class="info-box tip">Si le conteneur n'a pas bash, essaie <code>/bin/sh</code>. Certaines images minimalistes (comme Alpine) n'ont que sh.</div>
<h3>Résumé du workflow de debug</h3>
<div class="diagram">
<span class="d-accent">kubectl get pods</span>       Est-ce que le Pod tourne ?
        |
        v
<span class="d-accent">kubectl describe pod</span>   Que disent les événements ?
        |
        v
<span class="d-accent">kubectl logs</span>           Que dit l'application ?
        |
        v
<span class="d-accent">kubectl exec -it</span>      Explorer l'intérieur du conteneur
</div>`
    }
  ],
  exercises: [
    {
      title: "Exercice 1 : Créer un Pod à partir d'un fichier YAML",
      desc: "Crée un fichier YAML décrivant un Pod et déploie-le dans ton cluster.",
      steps: [
        "Crée un fichier <code>mon-pod.yaml</code> décrivant un Pod nommé <code>web-test</code> utilisant l'image <code>nginx:1.27</code> avec le port 80 exposé.",
        "Applique le fichier avec <code>kubectl apply -f mon-pod.yaml</code>.",
        "Vérifie que le Pod est en cours d'exécution avec <code>kubectl get pods</code>.",
        "Affiche les détails du Pod avec <code>kubectl describe pod web-test</code>.",
        "Consulte les logs du Pod avec <code>kubectl logs web-test</code>.",
        "Supprime le Pod avec <code>kubectl delete pod web-test</code>."
      ],
      validation: "Après <code>kubectl apply</code>, le Pod doit apparaître avec le statut <code>Running</code> dans la sortie de <code>kubectl get pods</code>.",
      hint: "N'oublie pas les 4 champs obligatoires dans le YAML : apiVersion (v1), kind (Pod), metadata (avec name), et spec (avec containers)."
    },
    {
      title: "Exercice 2 : Débuguer un Pod défaillant",
      desc: "Crée volontairement un Pod avec une erreur et utilise les outils de debug pour identifier le problème.",
      steps: [
        "Crée un Pod avec une image inexistante : <code>kubectl run bug-test --image=nginx:version-inexistante</code>.",
        "Observe le statut avec <code>kubectl get pods</code> (tu devrais voir <code>ImagePullBackOff</code> ou <code>ErrImagePull</code>).",
        "Utilise <code>kubectl describe pod bug-test</code> et lis la section Events pour comprendre l'erreur.",
        "Supprime le Pod : <code>kubectl delete pod bug-test</code>.",
        "Crée maintenant un Pod avec la bonne image : <code>kubectl run bug-test --image=nginx:1.27</code>.",
        "Vérifie qu'il fonctionne correctement."
      ],
      validation: "Tu dois être capable d'identifier l'erreur <code>ImagePullBackOff</code> dans les événements du Pod et comprendre qu'elle est causée par un nom d'image incorrect.",
      hint: "La section Events de <code>kubectl describe pod</code> affiche les messages d'erreur détaillés. Cherche les lignes contenant « Failed » ou « Error »."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande crée un Pod nommé 'test' avec l'image nginx ?",
      answers: ["kubectl run test --image=nginx", "kubectl run test --image nginx"]
    },
    {
      prompt: "Quelle commande liste tous les Pods du namespace par défaut ?",
      answers: ["kubectl get pods", "kubectl get pod", "kubectl get po"]
    },
    {
      prompt: "Quelle commande affiche les détails complets d'un Pod nommé 'mon-app' ?",
      answers: ["kubectl describe pod mon-app", "kubectl describe pods mon-app", "kubectl describe po mon-app"]
    },
    {
      prompt: "Quelle commande affiche les logs d'un Pod nommé 'mon-app' ?",
      answers: ["kubectl logs mon-app"]
    }
  ],
  quiz: [
    {
      question: "Qu'est-ce qu'un Pod dans Kubernetes ?",
      options: [
        "Un serveur physique",
        "Un conteneur Docker",
        "La plus petite unité déployable, une enveloppe autour d'un ou plusieurs conteneurs",
        "Un fichier de configuration"
      ],
      correct: 2,
      explanation: "Un Pod est la plus petite unité déployable dans Kubernetes. Ce n'est pas un conteneur en soi, mais une enveloppe qui peut contenir un ou plusieurs conteneurs partageant le même réseau et stockage."
    },
    {
      question: "Que signifie le statut 'CrashLoopBackOff' ?",
      options: [
        "Le Pod fonctionne correctement",
        "L'image Docker n'existe pas",
        "Le conteneur démarre, plante, et Kubernetes le redémarre en boucle",
        "Le Pod attend d'être assigné à un noeud"
      ],
      correct: 2,
      explanation: "CrashLoopBackOff signifie que le conteneur plante de manière répétée. Kubernetes continue de le redémarrer avec un délai croissant entre chaque tentative (backoff exponentiel). Il faut regarder les logs pour comprendre pourquoi il plante."
    },
    {
      question: "Quelle est la restartPolicy par défaut d'un Pod ?",
      options: [
        "Never",
        "OnFailure",
        "Always",
        "Sometimes"
      ],
      correct: 2,
      explanation: "Par défaut, la restartPolicy est <code>Always</code>. Cela signifie que Kubernetes redémarrera toujours le conteneur quand il s'arrête, que ce soit un succès ou un échec."
    },
    {
      question: "Quel est le pattern multi-conteneur le plus courant ?",
      options: [
        "Le pattern Ambassador",
        "Le pattern Sidecar",
        "Le pattern Adapter",
        "Le pattern Singleton"
      ],
      correct: 1,
      explanation: "Le pattern Sidecar est le plus répandu. Un conteneur secondaire (le sidecar) accompagne le conteneur principal pour l'assister : collecte de logs, proxy réseau, synchronisation de données, etc."
    },
    {
      question: "Quelle commande permet de se connecter à l'intérieur d'un conteneur en cours d'exécution ?",
      options: [
        "kubectl connect pod mon-app",
        "kubectl ssh mon-app",
        "kubectl exec -it mon-app -- /bin/bash",
        "kubectl enter mon-app"
      ],
      correct: 2,
      explanation: "La commande <code>kubectl exec -it mon-app -- /bin/bash</code> ouvre un shell interactif dans le conteneur. Le flag <code>-it</code> signifie interactif + terminal. Le <code>--</code> sépare les arguments de kubectl de la commande à exécuter dans le conteneur."
    }
  ]
},
{
  id: 4,
  title: "Deployments et Scaling",
  desc: "Gérer des applications avec les Deployments, mettre à l'échelle, effectuer des mises à jour progressives et organiser les ressources",
  objectives: [
    "Comprendre pourquoi les Deployments sont préférés aux Pods seuls",
    "Créer un Deployment et le mettre à l'échelle",
    "Effectuer une mise à jour progressive (rolling update) et un rollback",
    "Utiliser les labels et les sélecteurs pour organiser les ressources",
    "Comprendre et utiliser les Namespaces"
  ],
  sections: [
    {
      title: "Pourquoi les Deployments ?",
      content: `<p>Au module précédent, tu as appris à créer des Pods. Mais en production, on ne crée <strong>jamais</strong> de Pods directement. Pourquoi ?</p>
<ul>
<li><strong>Pas de redémarrage automatique</strong> : si tu supprimes un Pod créé manuellement, il disparaît pour toujours.</li>
<li><strong>Pas de scaling</strong> : impossible de dire « je veux 5 copies de ce Pod ».</li>
<li><strong>Pas de mise à jour progressive</strong> : pour changer l'image, tu dois supprimer le Pod et en recréer un (avec une coupure de service).</li>
</ul>
<p>C'est là qu'intervient le <strong>Deployment</strong>. C'est l'objet Kubernetes qui gère un ensemble de Pods identiques. Il s'appuie sur un objet intermédiaire appelé <strong>ReplicaSet</strong>.</p>
<div class="diagram">
+---------------------------+
|  <span class="d-accent">Deployment</span>               |
|  (gère les mises à jour)  |
+------------+--------------+
             |
             v
+------------+--------------+
|  <span class="d-accent">ReplicaSet</span>                |
|  (maintient N réplicas)   |
+--+--------+--------+-----+
   |        |        |
   v        v        v
+------+ +------+ +------+
| <span class="d-accent">Pod</span>  | | <span class="d-accent">Pod</span>  | | <span class="d-accent">Pod</span>  |
+------+ +------+ +------+
</div>
<p>La chaîne de responsabilité :</p>
<ul>
<li><strong>Deployment</strong> : définit l'état désiré (quelle image, combien de réplicas) et gère les mises à jour.</li>
<li><strong>ReplicaSet</strong> : s'assure que le bon nombre de Pods est en cours d'exécution à tout moment. Si un Pod tombe, le ReplicaSet en crée un nouveau.</li>
<li><strong>Pod</strong> : exécute effectivement le conteneur.</li>
</ul>
<div class="info-box note">Tu ne crées jamais de ReplicaSet directement. C'est le Deployment qui s'en charge. Tu interagis uniquement avec le Deployment, et lui gère tout le reste.</div>`
    },
    {
      title: "Créer un Deployment",
      content: `<h3>Méthode impérative</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl create deployment mon-app --image=nginx:1.27 --replicas=3</span>
deployment.apps/mon-app created</code></pre><button class="copy-btn">Copier</button></div>
<p>Vérifie l'état :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get deployments</span>
NAME      READY   UP-TO-DATE   AVAILABLE   AGE
mon-app   3/3     3            3           30s

<span class="hl-cmd">$ kubectl get replicasets</span>
NAME                 DESIRED   CURRENT   READY   AGE
mon-app-6d9f8b5c7d   3         3         3       30s

<span class="hl-cmd">$ kubectl get pods</span>
NAME                       READY   STATUS    RESTARTS   AGE
mon-app-6d9f8b5c7d-abc12   1/1     Running   0          30s
mon-app-6d9f8b5c7d-def34   1/1     Running   0          30s
mon-app-6d9f8b5c7d-ghi56   1/1     Running   0          30s</code></pre><button class="copy-btn">Copier</button></div>
<p>Observe les noms : chaque Pod a le nom du ReplicaSet suivi d'un identifiant aléatoire. Le ReplicaSet a le nom du Deployment suivi d'un hash.</p>
<h3>Méthode déclarative (YAML)</h3>
<p>Crée un fichier <code>deployment-nginx.yaml</code> :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-app</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">3</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">mon-app</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">mon-app</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">nginx</span>
        <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Analysons la structure :</p>
<ul>
<li><strong>apiVersion: apps/v1</strong> : les Deployments font partie du groupe d'API <code>apps</code>.</li>
<li><strong>replicas: 3</strong> : on veut 3 copies de notre Pod.</li>
<li><strong>selector.matchLabels</strong> : le Deployment utilise ce sélecteur pour savoir quels Pods il gère. Il doit correspondre aux labels du template.</li>
<li><strong>template</strong> : c'est le modèle de Pod. C'est exactement la même structure qu'un Pod (metadata + spec), mais sans apiVersion ni kind.</li>
</ul>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl apply -f deployment-nginx.yaml</span>
deployment.apps/mon-app created</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Le champ <code>selector.matchLabels</code> doit absolument correspondre aux labels définis dans <code>template.metadata.labels</code>. Si les deux ne correspondent pas, Kubernetes refusera de créer le Deployment.</div>
<h3>Mettre à l'échelle (scaling)</h3>
<p>Tu peux changer le nombre de réplicas à tout moment :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl scale deployment mon-app --replicas=5</span>
deployment.apps/mon-app scaled

<span class="hl-cmd">$ kubectl get pods</span>
NAME                       READY   STATUS    RESTARTS   AGE
mon-app-6d9f8b5c7d-abc12   1/1     Running   0          5m
mon-app-6d9f8b5c7d-def34   1/1     Running   0          5m
mon-app-6d9f8b5c7d-ghi56   1/1     Running   0          5m
mon-app-6d9f8b5c7d-jkl78   1/1     Running   0          10s
mon-app-6d9f8b5c7d-mno90   1/1     Running   0          10s</code></pre><button class="copy-btn">Copier</button></div>
<p>Deux nouveaux Pods ont été créés en quelques secondes. Tu peux aussi réduire le nombre de réplicas de la même façon (scale down).</p>`
    },
    {
      title: "Mise à jour et rollback",
      content: `<p>L'un des plus grands avantages des Deployments est la <strong>mise à jour progressive</strong> (rolling update). Au lieu de couper tous les Pods d'un coup et de les remplacer, Kubernetes les remplace un par un.</p>
<h3>Rolling update</h3>
<p>Pour mettre à jour l'image de ton application :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl set image deployment/mon-app nginx=nginx:1.28</span>
deployment.apps/mon-app image updated</code></pre><button class="copy-btn">Copier</button></div>
<p>Suis la mise à jour en temps réel :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl rollout status deployment/mon-app</span>
Waiting for deployment "mon-app" rollout to finish: 1 out of 3 new replicas have been updated...
Waiting for deployment "mon-app" rollout to finish: 2 out of 3 new replicas have been updated...
deployment "mon-app" successfully rolled out</code></pre><button class="copy-btn">Copier</button></div>
<p>Voici ce qui se passe en coulisses :</p>
<div class="diagram">
<span class="d-accent">Avant la mise à jour :</span>
ReplicaSet-v1 (nginx:1.27) : Pod Pod Pod    [3 réplicas]

<span class="d-accent">Pendant la mise à jour :</span>
ReplicaSet-v1 (nginx:1.27) : Pod Pod         [2 réplicas, en réduction]
ReplicaSet-v2 (nginx:1.28) : Pod             [1 réplica, en augmentation]

<span class="d-accent">Après la mise à jour :</span>
ReplicaSet-v1 (nginx:1.27) :                 [0 réplicas, conservé pour rollback]
ReplicaSet-v2 (nginx:1.28) : Pod Pod Pod     [3 réplicas]
</div>
<p>Le Deployment crée un <strong>nouveau ReplicaSet</strong> avec la nouvelle image, puis augmente progressivement ses réplicas tout en réduisant ceux de l'ancien ReplicaSet. L'ancien ReplicaSet est conservé (avec 0 réplicas) pour permettre un rollback.</p>
<h3>Consulter l'historique</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl rollout history deployment/mon-app</span>
REVISION  CHANGE-CAUSE
1         &lt;none&gt;
2         &lt;none&gt;</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Pour que la colonne CHANGE-CAUSE soit remplie, ajoute le flag <code>--record</code> à tes commandes (par exemple <code>kubectl set image ... --record</code>), ou annote ton Deployment manuellement avec <code>kubectl annotate deployment/mon-app kubernetes.io/change-cause="Mise à jour vers nginx 1.28"</code>.</div>
<h3>Rollback</h3>
<p>Si la nouvelle version pose problème, tu peux revenir à la version précédente instantanément :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl rollout undo deployment/mon-app</span>
deployment.apps/mon-app rolled back</code></pre><button class="copy-btn">Copier</button></div>
<p>Tu peux aussi revenir à une révision spécifique :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl rollout undo deployment/mon-app --to-revision=1</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Kubernetes réactive simplement l'ancien ReplicaSet et réduit le nouveau. C'est pourquoi les anciens ReplicaSets sont conservés.</p>
<div class="info-box warning">Par défaut, Kubernetes conserve les 10 dernières révisions d'un Deployment. Tu peux modifier cette valeur avec le champ <code>spec.revisionHistoryLimit</code> dans le YAML.</div>
<h3>Stratégie de mise à jour dans le YAML</h3>
<p>Tu peux configurer finement la stratégie de rolling update :</p>
<div class="code-block"><pre><code><span class="hl-key">spec</span>:
  <span class="hl-key">strategy</span>:
    <span class="hl-key">type</span>: <span class="hl-str">RollingUpdate</span>
    <span class="hl-key">rollingUpdate</span>:
      <span class="hl-key">maxSurge</span>: <span class="hl-num">1</span>            <span class="hl-comment"># combien de Pods en plus du total pendant la mise à jour</span>
      <span class="hl-key">maxUnavailable</span>: <span class="hl-num">0</span>      <span class="hl-comment"># combien de Pods peuvent être indisponibles</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Avec <code>maxSurge: 1</code> et <code>maxUnavailable: 0</code>, Kubernetes ne supprimera jamais un ancien Pod tant que le nouveau n'est pas prêt. C'est la configuration la plus sûre (zéro temps d'arrêt).</p>`
    },
    {
      title: "Labels et sélecteurs",
      content: `<p>Les <strong>labels</strong> (étiquettes) sont au coeur de Kubernetes. Ce sont des paires clé-valeur que tu attaches à n'importe quel objet. Les <strong>sélecteurs</strong> permettent ensuite de filtrer les objets par leurs labels.</p>
<h3>Ajouter des labels</h3>
<p>Dans un YAML :</p>
<div class="code-block"><pre><code><span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-app</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">frontend</span>
    <span class="hl-key">env</span>: <span class="hl-str">production</span>
    <span class="hl-key">version</span>: <span class="hl-str">v2.1</span></code></pre><button class="copy-btn">Copier</button></div>
<p>En ligne de commande :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl label pod mon-app team=backend</span>
pod/mon-app labeled</code></pre><button class="copy-btn">Copier</button></div>
<h3>Filtrer avec les sélecteurs</h3>
<p>Les sélecteurs te permettent de cibler des objets par leurs labels :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Tous les Pods avec le label app=frontend</span>
<span class="hl-cmd">$ kubectl get pods -l app=frontend</span>

<span class="hl-comment"># Tous les Pods dans l'environnement production</span>
<span class="hl-cmd">$ kubectl get pods -l env=production</span>

<span class="hl-comment"># Combinaison de labels (ET logique)</span>
<span class="hl-cmd">$ kubectl get pods -l app=frontend,env=production</span>

<span class="hl-comment"># Négation : tous les Pods qui ne sont PAS en production</span>
<span class="hl-cmd">$ kubectl get pods -l env!=production</span>

<span class="hl-comment"># Opérateur "in" : env vaut staging OU production</span>
<span class="hl-cmd">$ kubectl get pods -l 'env in (staging,production)'</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Afficher les labels</h3>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get pods --show-labels</span>
NAME                       READY   STATUS    LABELS
mon-app-6d9f8b5c7d-abc12   1/1     Running   app=mon-app,pod-template-hash=6d9f8b5c7d</code></pre><button class="copy-btn">Copier</button></div>
<h3>Pourquoi les labels sont importants</h3>
<p>Les labels ne sont pas juste des étiquettes décoratives. Ils sont utilisés partout dans Kubernetes :</p>
<ul>
<li><strong>Deployments</strong> : le <code>selector.matchLabels</code> identifie les Pods gérés par le Deployment.</li>
<li><strong>Services</strong> : un Service utilise un sélecteur pour router le trafic vers les bons Pods.</li>
<li><strong>Scheduling</strong> : tu peux forcer des Pods à tourner sur des noeuds ayant certains labels.</li>
</ul>
<div class="info-box note">Convention courante pour les labels : <code>app</code> (nom de l'application), <code>env</code> (environnement), <code>version</code> (version de l'app), <code>team</code> (équipe responsable), <code>tier</code> (frontend, backend, database).</div>`
    },
    {
      title: "Namespaces",
      content: `<p>Un <strong>Namespace</strong> est un espace isolé dans ton cluster. C'est comme un dossier virtuel qui regroupe des ressources liées.</p>
<h3>Pourquoi utiliser des Namespaces ?</h3>
<ul>
<li><strong>Organiser</strong> : séparer les environnements (dev, staging, production) ou les équipes.</li>
<li><strong>Isoler</strong> : les noms de ressources doivent être uniques seulement au sein d'un même Namespace. Tu peux avoir un Pod « mon-app » dans le namespace dev ET un Pod « mon-app » dans le namespace prod.</li>
<li><strong>Contrôler les accès</strong> : tu peux appliquer des politiques de sécurité et des quotas de ressources par Namespace.</li>
</ul>
<h3>Les Namespaces par défaut</h3>
<p>Kubernetes crée automatiquement plusieurs Namespaces :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl get namespaces</span>
NAME              STATUS   AGE
default           Active   10m    <span class="hl-comment"># là où vont tes ressources si tu ne précises pas</span>
kube-system       Active   10m    <span class="hl-comment"># composants internes de Kubernetes</span>
kube-public       Active   10m    <span class="hl-comment"># ressources accessibles publiquement</span>
kube-node-lease   Active   10m    <span class="hl-comment"># utilisé pour les heartbeats des noeuds</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Créer et utiliser un Namespace</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Créer un namespace</span>
<span class="hl-cmd">$ kubectl create namespace dev</span>
namespace/dev created

<span class="hl-comment"># Créer un Pod dans ce namespace</span>
<span class="hl-cmd">$ kubectl run test --image=nginx --namespace=dev</span>

<span class="hl-comment"># Lister les Pods du namespace dev</span>
<span class="hl-cmd">$ kubectl get pods -n dev</span>

<span class="hl-comment"># Lister les Pods de TOUS les namespaces</span>
<span class="hl-cmd">$ kubectl get pods --all-namespaces</span>
<span class="hl-comment"># ou en abrégé :</span>
<span class="hl-cmd">$ kubectl get pods -A</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Namespace en YAML</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Namespace</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">production</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Changer le namespace par défaut</h3>
<p>Taper <code>-n mon-namespace</code> à chaque commande est fastidieux. Tu peux changer le namespace par défaut :</p>
<div class="code-block"><pre><code><span class="hl-cmd">$ kubectl config set-context --current --namespace=dev</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Après cette commande, toutes tes commandes kubectl cibleront le namespace <code>dev</code> par défaut.</p>
<div class="info-box warning">Attention : certaines ressources ne sont pas liées à un Namespace. C'est le cas des Nodes, des PersistentVolumes et des Namespaces eux-mêmes. On les appelle des ressources « cluster-scoped ».</div>`
    }
  ],
  exercises: [
    {
      title: "Exercice 1 : Créer un Deployment et le mettre à l'échelle",
      desc: "Crée un Deployment, vérifie ses composants, puis ajuste le nombre de réplicas.",
      steps: [
        "Crée un Deployment nommé <code>web-server</code> avec l'image <code>nginx:1.27</code> et 2 réplicas : <code>kubectl create deployment web-server --image=nginx:1.27 --replicas=2</code>.",
        "Vérifie le Deployment : <code>kubectl get deployment web-server</code>.",
        "Vérifie le ReplicaSet créé : <code>kubectl get replicasets</code>.",
        "Vérifie les Pods créés : <code>kubectl get pods</code>.",
        "Augmente le nombre de réplicas à 5 : <code>kubectl scale deployment web-server --replicas=5</code>.",
        "Observe les nouveaux Pods apparaître : <code>kubectl get pods -w</code> (Ctrl+C pour quitter).",
        "Réduis à 1 réplica : <code>kubectl scale deployment web-server --replicas=1</code>.",
        "Supprime le Deployment : <code>kubectl delete deployment web-server</code>."
      ],
      validation: "Après le scale à 5, <code>kubectl get deployment web-server</code> doit afficher <code>5/5</code> dans la colonne READY. Après le scale à 1, il doit afficher <code>1/1</code>.",
      hint: "Utilise <code>kubectl get pods -w</code> pour observer en temps réel la création et la suppression des Pods pendant le scaling."
    },
    {
      title: "Exercice 2 : Rolling update et rollback",
      desc: "Effectue une mise à jour progressive puis annule-la avec un rollback.",
      steps: [
        "Crée un Deployment : <code>kubectl create deployment rolling-test --image=nginx:1.26 --replicas=3</code>.",
        "Vérifie que les 3 Pods sont en cours d'exécution.",
        "Lance une mise à jour vers nginx:1.27 : <code>kubectl set image deployment/rolling-test nginx=nginx:1.27</code>.",
        "Suis la progression : <code>kubectl rollout status deployment/rolling-test</code>.",
        "Vérifie l'historique : <code>kubectl rollout history deployment/rolling-test</code>.",
        "Simule un problème en mettant une mauvaise image : <code>kubectl set image deployment/rolling-test nginx=nginx:inexistante</code>.",
        "Observe les Pods en erreur : <code>kubectl get pods</code>.",
        "Annule la mise à jour : <code>kubectl rollout undo deployment/rolling-test</code>.",
        "Vérifie que tout est revenu à la normale : <code>kubectl get pods</code>.",
        "Nettoie : <code>kubectl delete deployment rolling-test</code>."
      ],
      validation: "Après le rollback, tous les Pods doivent être en statut <code>Running</code> avec l'image <code>nginx:1.27</code>. Vérifie avec <code>kubectl describe deployment rolling-test</code>.",
      hint: "Pour voir l'image utilisée par un Deployment, utilise <code>kubectl describe deployment rolling-test</code> et cherche la ligne « Image »."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande crée un Deployment nommé 'api' avec l'image node:20 ?",
      answers: ["kubectl create deployment api --image=node:20", "kubectl create deployment api --image node:20"]
    },
    {
      prompt: "Quelle commande met à l'échelle le Deployment 'api' à 4 réplicas ?",
      answers: ["kubectl scale deployment api --replicas=4", "kubectl scale deployment/api --replicas=4", "kubectl scale deploy api --replicas=4", "kubectl scale deploy/api --replicas=4"]
    },
    {
      prompt: "Quelle commande affiche la progression d'une mise à jour du Deployment 'api' ?",
      answers: ["kubectl rollout status deployment api", "kubectl rollout status deployment/api", "kubectl rollout status deploy api", "kubectl rollout status deploy/api"]
    },
    {
      prompt: "Quelle commande annule la dernière mise à jour du Deployment 'api' ?",
      answers: ["kubectl rollout undo deployment api", "kubectl rollout undo deployment/api", "kubectl rollout undo deploy api", "kubectl rollout undo deploy/api"]
    }
  ],
  quiz: [
    {
      question: "Quel objet Kubernetes est responsable de maintenir le bon nombre de Pods en exécution ?",
      options: [
        "Le Deployment",
        "Le ReplicaSet",
        "Le Service",
        "Le Namespace"
      ],
      correct: 1,
      explanation: "Le ReplicaSet est directement responsable de maintenir le nombre désiré de Pods. Le Deployment, lui, gère les ReplicaSets (et donc indirectement les Pods). En pratique, on interagit avec le Deployment et non le ReplicaSet."
    },
    {
      question: "Que se passe-t-il pendant un rolling update ?",
      options: [
        "Tous les Pods sont supprimés puis recréés d'un coup",
        "Les Pods sont remplacés progressivement, un par un, sans coupure de service",
        "Le cluster est arrêté pendant la mise à jour",
        "Un nouveau Deployment est créé à côté de l'ancien"
      ],
      correct: 1,
      explanation: "Lors d'un rolling update, un nouveau ReplicaSet est créé. Kubernetes augmente progressivement les réplicas du nouveau ReplicaSet tout en réduisant ceux de l'ancien. Le service reste disponible pendant toute l'opération."
    },
    {
      question: "À quoi servent les labels dans Kubernetes ?",
      options: [
        "Uniquement à documenter les ressources",
        "À identifier et sélectionner des groupes de ressources pour les Deployments, Services, etc.",
        "À stocker des données sensibles",
        "À définir les permissions d'accès"
      ],
      correct: 1,
      explanation: "Les labels sont des paires clé-valeur utilisées pour identifier et sélectionner des objets. Les Deployments les utilisent pour trouver leurs Pods, les Services pour router le trafic, etc. Ce sont des mécanismes de sélection, pas juste de la documentation."
    },
    {
      question: "Quelle commande permet de lister les Pods de tous les Namespaces ?",
      options: [
        "kubectl get pods --global",
        "kubectl get pods --all-namespaces",
        "kubectl get pods --everywhere",
        "kubectl get pods --cluster-wide"
      ],
      correct: 1,
      explanation: "Le flag <code>--all-namespaces</code> (ou <code>-A</code> en abrégé) permet de lister les ressources de tous les Namespaces d'un seul coup. Sans ce flag, kubectl ne montre que les ressources du namespace courant (par défaut : « default »)."
    },
    {
      question: "Pourquoi ne crée-t-on pas de Pods directement en production ?",
      options: [
        "Parce que les Pods sont trop lents",
        "Parce que les Pods ne supportent pas Docker",
        "Parce qu'un Pod seul n'a pas de redémarrage automatique, pas de scaling et pas de mise à jour progressive",
        "Parce que les Pods ne fonctionnent que dans minikube"
      ],
      correct: 2,
      explanation: "Un Pod créé manuellement n'est pas surveillé : si on le supprime ou s'il plante, Kubernetes ne le recréera pas. Les Deployments apportent le redémarrage automatique (via les ReplicaSets), le scaling et les mises à jour progressives."
    }
  ]
},
{
  id: 5,
  title: "Configuration : ConfigMaps et Secrets",
  desc: "Externaliser la configuration avec les ConfigMaps et protéger les données sensibles avec les Secrets.",
  objectives: [
    "Créer des ConfigMaps de plusieurs façons (littéral, fichier, YAML déclaratif)",
    "Injecter la configuration dans les Pods via variables d'environnement et volumes",
    "Gérer les données sensibles avec les Secrets (types, création, utilisation)",
    "Appliquer les bonnes pratiques : immutabilité, sécurité, versionnement"
  ],
  sections: [
    {
      title: "ConfigMaps : externaliser la configuration",
      content: `<p>Un <strong>ConfigMap</strong> est un objet Kubernetes qui stocke de la configuration non-sensible sous forme de paires clé/valeur. Il permet de <strong>séparer la configuration du code</strong> de l'image Docker.</p>
<p>Pourquoi c'est important ? Parce que la même image Docker doit pouvoir tourner en développement, en staging et en production avec des configurations différentes : URL de base de données, niveau de log, feature flags, etc. Sans ConfigMap, il faudrait reconstruire l'image à chaque changement de configuration.</p>
<h3>Créer un ConfigMap depuis des valeurs littérales</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Créer un ConfigMap avec des paires clé=valeur</span>
<span class="hl-cmd">$ kubectl create configmap app-config \\
    --from-literal=DB_HOST=mysql.default.svc.cluster.local \\
    --from-literal=DB_PORT=3306 \\
    --from-literal=LOG_LEVEL=info \\
    --from-literal=APP_ENV=production</span>

<span class="hl-comment"># Voir le ConfigMap créé</span>
<span class="hl-cmd">$ kubectl get configmap app-config -o yaml</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Créer un ConfigMap depuis un fichier</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Créer un fichier de configuration</span>
<span class="hl-cmd">$ cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
    location /api {
        proxy_pass http://api-service:3000;
    }
}
EOF</span>

<span class="hl-comment"># Créer le ConfigMap depuis le fichier</span>
<span class="hl-cmd">$ kubectl create configmap nginx-config <span class="hl-flag">--from-file</span>=nginx.conf</span>

<span class="hl-comment"># La clé sera le nom du fichier (nginx.conf)</span>
<span class="hl-comment"># La valeur sera le contenu du fichier</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>ConfigMap en YAML déclaratif</h3>
<p>La méthode recommandée en production est d'écrire le ConfigMap dans un fichier YAML versionné avec ton code :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">ConfigMap</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-config</span>
<span class="hl-key">data</span>:
  <span class="hl-comment"># Paires clé/valeur simples</span>
  <span class="hl-key">DB_HOST</span>: <span class="hl-str">mysql.default.svc.cluster.local</span>
  <span class="hl-key">DB_PORT</span>: <span class="hl-str">"3306"</span>
  <span class="hl-key">LOG_LEVEL</span>: <span class="hl-str">info</span>
  <span class="hl-comment"># Valeur multi-lignes (fichier complet)</span>
  <span class="hl-key">app.properties</span>: |
    <span class="hl-str">server.port=8080</span>
    <span class="hl-str">cache.enabled=true</span>
    <span class="hl-str">cache.ttl=300</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note">Les valeurs dans un ConfigMap sont toujours des chaînes de caractères. C'est pourquoi les nombres doivent être entre guillemets dans le YAML (<code>"3306"</code> et non <code>3306</code>). Le caractère <code>|</code> permet d'inclure du texte multi-lignes.</div>`
    },
    {
      title: "Utiliser les ConfigMaps dans les Pods",
      content: `<p>Il y a deux façons d'injecter un ConfigMap dans un Pod : via des <strong>variables d'environnement</strong> ou via un <strong>volume monté</strong>. Chaque méthode a ses avantages.</p>
<h3>Méthode 1 : Variables d'environnement</h3>
<p>Tu peux injecter une clé spécifique ou toutes les clés d'un coup :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-avec-config</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">env</span>:
    <span class="hl-comment"># Injecter UNE clé spécifique</span>
    - <span class="hl-key">name</span>: <span class="hl-str">DATABASE_HOST</span>
      <span class="hl-key">valueFrom</span>:
        <span class="hl-key">configMapKeyRef</span>:
          <span class="hl-key">name</span>: <span class="hl-str">app-config</span>
          <span class="hl-key">key</span>: <span class="hl-str">DB_HOST</span>
    <span class="hl-comment"># Injecter TOUTES les clés d'un coup</span>
    <span class="hl-key">envFrom</span>:
    - <span class="hl-key">configMapRef</span>:
        <span class="hl-key">name</span>: <span class="hl-str">app-config</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Avec <code>envFrom</code>, chaque clé du ConfigMap devient une variable d'environnement. Par exemple, la clé <code>DB_HOST</code> devient la variable <code>$DB_HOST</code> dans le conteneur.</p>
<h3>Méthode 2 : Montage en volume</h3>
<p>Chaque clé du ConfigMap devient un fichier dans le répertoire monté :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-avec-volume</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">config-volume</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/etc/config</span>
      <span class="hl-key">readOnly</span>: <span class="hl-bool">true</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">config-volume</span>
    <span class="hl-key">configMap</span>:
      <span class="hl-key">name</span>: <span class="hl-str">app-config</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Avec ce montage, tu trouveras les fichiers <code>/etc/config/DB_HOST</code>, <code>/etc/config/DB_PORT</code>, etc. contenant chacun la valeur correspondante.</p>
<h3>Quelle méthode choisir ?</h3>
<div class="diagram">
  Variables d'environnement          vs         Volumes montés

  + Simple à utiliser                           + Mise à jour automatique
  + Compatible avec toutes les apps             + Supporte les fichiers complets
  - Pas de mise à jour sans restart             + Pas besoin de redémarrer le Pod
  - Visible dans kubectl describe               - Plus complexe à configurer
  - Limitées en taille                          - L'app doit relire les fichiers
</div>
<div class="info-box tip">Si tu veux que ton application détecte les changements de configuration sans redémarrage, utilise le montage en volume. Le kubelet synchronise les fichiers montés périodiquement (délai d'environ 1 minute par défaut). Les variables d'environnement, elles, ne changent pas sans redémarrer le Pod.</div>`
    },
    {
      title: "Secrets : protéger les données sensibles",
      content: `<p>Les <strong>Secrets</strong> sont similaires aux ConfigMaps mais destinés aux données sensibles : mots de passe, tokens API, clés SSH, certificats TLS. Les valeurs sont encodées en base64 dans etcd.</p>
<h3>Types de Secrets</h3>
<ul>
<li><code>Opaque</code> (défaut) : données arbitraires (mot de passe, token, etc.)</li>
<li><code>kubernetes.io/tls</code> : certificat et clé TLS</li>
<li><code>kubernetes.io/dockerconfigjson</code> : credentials de registre Docker privé</li>
<li><code>kubernetes.io/basic-auth</code> : credentials basiques (username/password)</li>
<li><code>kubernetes.io/ssh-auth</code> : clé SSH</li>
</ul>
<h3>Créer des Secrets</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Secret Opaque depuis des valeurs littérales</span>
<span class="hl-comment"># kubectl encode automatiquement en base64</span>
<span class="hl-cmd">$ kubectl create secret generic db-creds \\
    --from-literal=username=admin \\
    --from-literal=password='S3cur3P@ss!'</span>

<span class="hl-comment"># Secret TLS depuis des fichiers de certificat</span>
<span class="hl-cmd">$ kubectl create secret tls app-tls \\
    --cert=tls.crt \\
    --key=tls.key</span>

<span class="hl-comment"># Secret pour un registre Docker privé</span>
<span class="hl-cmd">$ kubectl create secret docker-registry my-registry \\
    --docker-server=registry.example.com \\
    --docker-username=user \\
    --docker-password=pass</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Secret en YAML déclaratif</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Secret</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">db-creds</span>
<span class="hl-key">type</span>: <span class="hl-str">Opaque</span>
<span class="hl-key">data</span>:
  <span class="hl-comment"># Valeurs encodées en base64</span>
  <span class="hl-comment"># echo -n "admin" | base64 donne YWRtaW4=</span>
  <span class="hl-key">username</span>: <span class="hl-str">YWRtaW4=</span>
  <span class="hl-key">password</span>: <span class="hl-str">UzNjdXIzUEBzcyE=</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Pour éviter d'encoder en base64 toi-même, utilise <code>stringData</code> :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Secret</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">db-creds</span>
<span class="hl-key">type</span>: <span class="hl-str">Opaque</span>
<span class="hl-key">stringData</span>:
  <span class="hl-comment"># Valeurs en clair, K8s encode en base64 automatiquement</span>
  <span class="hl-key">username</span>: <span class="hl-str">admin</span>
  <span class="hl-key">password</span>: <span class="hl-str">S3cur3P@ss!</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Injecter un Secret dans un Pod</h3>
<p>Les deux mêmes méthodes que pour les ConfigMaps fonctionnent :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-avec-secret</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">env</span>:
    <span class="hl-comment"># Variable d'environnement depuis un Secret</span>
    - <span class="hl-key">name</span>: <span class="hl-str">DB_PASSWORD</span>
      <span class="hl-key">valueFrom</span>:
        <span class="hl-key">secretKeyRef</span>:
          <span class="hl-key">name</span>: <span class="hl-str">db-creds</span>
          <span class="hl-key">key</span>: <span class="hl-str">password</span>
    <span class="hl-comment"># Ou toutes les clés d'un coup</span>
    <span class="hl-key">envFrom</span>:
    - <span class="hl-key">secretRef</span>:
        <span class="hl-key">name</span>: <span class="hl-str">db-creds</span>
    <span class="hl-comment"># Montage en volume</span>
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">secret-vol</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/etc/secrets</span>
      <span class="hl-key">readOnly</span>: <span class="hl-bool">true</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">secret-vol</span>
    <span class="hl-key">secret</span>:
      <span class="hl-key">secretName</span>: <span class="hl-str">db-creds</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Lire et décoder un Secret</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Voir le Secret (valeurs en base64)</span>
<span class="hl-cmd">$ kubectl get secret db-creds -o yaml</span>

<span class="hl-comment"># Décoder une valeur spécifique</span>
<span class="hl-cmd">$ kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 -d</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box warning"><strong>Les Secrets Kubernetes ne sont PAS chiffrés par défaut.</strong> Ils sont seulement encodés en base64 (ce n'est PAS du chiffrement, n'importe qui peut décoder). En production, active le chiffrement at rest avec <code>EncryptionConfiguration</code> ou utilise un gestionnaire de secrets externe comme HashiCorp Vault ou AWS Secrets Manager.</div>`
    },
    {
      title: "Bonnes pratiques",
      content: `<p>Voici les bonnes pratiques essentielles pour gérer la configuration et les secrets dans Kubernetes.</p>
<h3>ConfigMaps et Secrets immutables</h3>
<p>Depuis Kubernetes v1.21, tu peux marquer un ConfigMap ou un Secret comme <strong>immutable</strong>. Une fois marqué, il ne peut plus être modifié. Il faut le supprimer et en créer un nouveau avec un nom différent.</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">ConfigMap</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-config-v1</span>
<span class="hl-key">data</span>:
  <span class="hl-key">DB_HOST</span>: <span class="hl-str">mysql.production</span>
  <span class="hl-key">LOG_LEVEL</span>: <span class="hl-str">warn</span>
<span class="hl-key">immutable</span>: <span class="hl-bool">true</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Avantages des ressources immutables :</p>
<ul>
<li><strong>Protection contre les modifications accidentelles</strong> en production</li>
<li><strong>Performance</strong> : le kubelet n'a plus besoin de surveiller les changements. Sur un cluster avec des milliers de ConfigMaps, cela réduit la charge sur l'API Server</li>
<li><strong>Meilleure gouvernance</strong> : chaque changement nécessite un nouveau ConfigMap avec un nouveau nom, ce qui facilite l'audit et le rollback</li>
</ul>
<h3>Le pattern de versionnement</h3>
<div class="code-block"><pre><code><span class="hl-comment"># 1. Créer un ConfigMap avec un nom versionné</span>
<span class="hl-cmd">$ kubectl create configmap app-config-v2 \\
    --from-literal=DB_HOST=mysql.production \\
    --from-literal=LOG_LEVEL=debug</span>

<span class="hl-comment"># 2. Mettre à jour le Deployment pour pointer vers le nouveau ConfigMap</span>
<span class="hl-comment">#    (modifier le YAML : app-config-v1 vers app-config-v2)</span>
<span class="hl-cmd">$ kubectl apply -f deployment.yaml</span>

<span class="hl-comment"># 3. Le Deployment fait un rolling update vers la nouvelle config</span>

<span class="hl-comment"># 4. Supprimer l'ancien ConfigMap quand il n'est plus utilisé</span>
<span class="hl-cmd">$ kubectl delete configmap app-config-v1</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Règles de sécurité pour les Secrets</h3>
<ul>
<li><strong>Ne commite jamais de Secrets en clair</strong> dans Git. Utilise des outils comme Sealed Secrets (Bitnami) ou SOPS pour chiffrer avant de commiter</li>
<li><strong>Limite l'accès aux Secrets</strong> avec RBAC : seuls les Pods et utilisateurs qui en ont besoin doivent pouvoir les lire</li>
<li><strong>Active le chiffrement at rest</strong> dans etcd avec <code>EncryptionConfiguration</code></li>
<li><strong>Préfère monter les Secrets en volume</strong> plutôt qu'en variables d'environnement : les variables apparaissent dans <code>kubectl describe pod</code> et dans les logs de crash, alors que les fichiers montés sont plus discrets</li>
</ul>
<div class="diagram">
  ConfigMap vs Secret : quand utiliser quoi ?

  <span class="d-accent">ConfigMap</span>                              <span class="d-accent">Secret</span>
  URLs de base de données                  Mots de passe
  Niveaux de log                           Tokens API
  Feature flags                            Clés SSH
  Fichiers de config (nginx, etc.)         Certificats TLS
  Variables d'environnement                Credentials de registre Docker
</div>
<div class="info-box tip">Ce pattern "ConfigMap versionné + Deployment rolling update" est considéré comme la meilleure pratique en production. Il garantit que chaque changement de configuration est un déploiement explicite, avec possibilité de rollback via <code>kubectl rollout undo</code>.</div>`
    }
  ],
  exercises: [
    {
      title: "Créer et utiliser un ConfigMap",
      desc: "Crée un ConfigMap, injecte-le dans un Pod de deux façons (variables d'environnement et volume), puis vérifie que la configuration est bien accessible.",
      steps: [
        "Crée un ConfigMap : <code>kubectl create configmap app-config --from-literal=APP_ENV=dev --from-literal=LOG_LEVEL=debug --from-literal=APP_PORT=8080</code>",
        "Vérifie le contenu : <code>kubectl get configmap app-config -o yaml</code>",
        "Crée un Pod qui injecte le ConfigMap en variables d'environnement. Génère le YAML de base : <code>kubectl run test-env --image=busybox:1.36 --dry-run=client -o yaml -- sleep 3600</code>, puis ajoute une section <code>envFrom</code> avec <code>configMapRef</code> pointant vers <code>app-config</code>",
        "Applique le YAML : <code>kubectl apply -f pod-env.yaml</code>",
        "Vérifie les variables : <code>kubectl exec test-env -- env | grep -E 'APP_|LOG_'</code>",
        "Crée un second Pod qui monte le ConfigMap en volume au chemin <code>/etc/config</code>",
        "Vérifie les fichiers : <code>kubectl exec test-vol -- ls /etc/config/</code> puis <code>kubectl exec test-vol -- cat /etc/config/APP_ENV</code>",
        "Nettoie : <code>kubectl delete pod test-env test-vol && kubectl delete configmap app-config</code>"
      ],
      validation: "Tu dois voir les variables APP_ENV=dev, LOG_LEVEL=debug et APP_PORT=8080 dans le premier Pod, et les fichiers correspondants dans /etc/config/ du second Pod.",
      hint: "Pour le Pod avec envFrom, ajoute ceci dans la spec du conteneur :<br><code>envFrom:<br>- configMapRef:<br>&nbsp;&nbsp;&nbsp;&nbsp;name: app-config</code>"
    },
    {
      title: "Créer et utiliser un Secret",
      desc: "Crée un Secret pour des credentials de base de données, injecte-le dans un Pod et vérifie que les valeurs sont accessibles mais protégées.",
      steps: [
        "Crée un Secret : <code>kubectl create secret generic db-creds --from-literal=DB_USER=admin --from-literal=DB_PASS=secret123</code>",
        "Inspecte le Secret : <code>kubectl get secret db-creds -o yaml</code> (note que les valeurs sont en base64)",
        "Décode une valeur : <code>kubectl get secret db-creds -o jsonpath='{.data.DB_PASS}' | base64 -d</code>",
        "Crée un Pod qui injecte le Secret en variables d'environnement avec <code>secretRef</code>",
        "Vérifie : <code>kubectl exec test-secret -- env | grep DB_</code>",
        "Crée un second Pod qui monte le Secret en volume au chemin <code>/etc/secrets</code> en lecture seule",
        "Vérifie : <code>kubectl exec test-secret-vol -- cat /etc/secrets/DB_PASS</code>",
        "Nettoie : <code>kubectl delete pod test-secret test-secret-vol && kubectl delete secret db-creds</code>"
      ],
      validation: "Tu dois pouvoir lire les credentials dans le Pod (via env ou fichier), et vérifier que les valeurs dans le YAML du Secret sont bien encodées en base64.",
      hint: "Pour monter un Secret en volume, utilise la section <code>volumes</code> avec <code>secret: secretName: db-creds</code> et un <code>volumeMount</code> avec <code>readOnly: true</code>."
    }
  ],
  commands: [
    {
      prompt: "Crée un ConfigMap nommé 'redis-config' avec les clés REDIS_HOST=redis.cache et REDIS_PORT=6379 :",
      answers: [
        "kubectl create configmap redis-config --from-literal=REDIS_HOST=redis.cache --from-literal=REDIS_PORT=6379"
      ]
    },
    {
      prompt: "Affiche la liste de tous les ConfigMaps du namespace courant :",
      answers: [
        "kubectl get configmaps",
        "kubectl get configmap",
        "kubectl get cm"
      ]
    },
    {
      prompt: "Crée un Secret générique nommé 'api-key' avec la clé TOKEN=abc123 :",
      answers: [
        "kubectl create secret generic api-key --from-literal=TOKEN=abc123"
      ]
    },
    {
      prompt: "Affiche les détails du Secret 'db-creds' (métadonnées, type, taille des données) :",
      answers: [
        "kubectl describe secret db-creds"
      ]
    }
  ],
  quiz: [
    {
      question: "Les Secrets Kubernetes sont-ils chiffrés par défaut ?",
      options: [
        "Oui, avec AES-256",
        "Non, ils sont seulement encodés en base64",
        "Oui, avec la clé du cluster",
        "Oui, avec le certificat TLS du cluster"
      ],
      correct: 1,
      explanation: "Les Secrets ne sont PAS chiffrés par défaut, seulement encodés en base64 (ce qui n'est PAS du chiffrement, n'importe qui peut décoder). Pour le chiffrement, il faut activer EncryptionConfiguration ou utiliser un gestionnaire de secrets externe (Vault, AWS Secrets Manager)."
    },
    {
      question: "Quel avantage a le montage en volume par rapport aux variables d'environnement pour injecter un ConfigMap ?",
      options: [
        "C'est plus rapide",
        "Le ConfigMap est mis à jour automatiquement sans redémarrer le Pod",
        "C'est plus sécurisé",
        "Cela consomme moins de mémoire"
      ],
      correct: 1,
      explanation: "Quand un ConfigMap est monté en volume, le kubelet synchronise les fichiers automatiquement (avec un délai d'environ 1 minute). Les variables d'environnement, elles, ne changent PAS sans redémarrer le Pod."
    },
    {
      question: "Comment injecter TOUTES les clés d'un ConfigMap comme variables d'environnement d'un coup ?",
      options: [
        "env: configMapRef: name: mon-config",
        "envFrom: - configMapRef: name: mon-config",
        "volumeMount: configMap: mon-config",
        "inject: configMap: mon-config"
      ],
      correct: 1,
      explanation: "envFrom avec configMapRef injecte toutes les paires clé/valeur du ConfigMap comme variables d'environnement. Chaque clé du ConfigMap devient le nom de la variable, et sa valeur devient la valeur de la variable."
    },
    {
      question: "Quel est l'intérêt de marquer un ConfigMap comme immutable ?",
      options: [
        "Il devient chiffré",
        "Il est protégé contre les modifications accidentelles et améliore les performances du cluster",
        "Il est automatiquement sauvegardé",
        "Il ne peut être lu que par un seul Pod"
      ],
      correct: 1,
      explanation: "Un ConfigMap immutable ne peut plus être modifié (protection contre les erreurs en production) et le kubelet n'a plus besoin de surveiller ses changements, ce qui réduit la charge sur l'API Server dans les gros clusters."
    }
  ]
},

{
  id: 6,
  title: "Services et Réseau",
  desc: "Comprendre le modèle réseau de Kubernetes et exposer tes applications avec les Services.",
  objectives: [
    "Comprendre pourquoi les Services existent (les Pods sont éphémères)",
    "Maîtriser les types de Services : ClusterIP, NodePort, LoadBalancer",
    "Utiliser le DNS interne (CoreDNS) pour le service discovery",
    "Comprendre les Endpoints et le mécanisme de load balancing"
  ],
  sections: [
    {
      title: "Le problème du réseau",
      content: `<p>Avant de parler des Services, il faut comprendre un problème fondamental. Dans Kubernetes, les Pods sont <strong>éphémères</strong> : ils peuvent être créés, supprimés et recréés à tout moment (crash, scaling, rolling update). À chaque recréation, un Pod reçoit une <strong>nouvelle adresse IP</strong>.</p>
<p>Imagine la situation suivante : ton application frontend doit communiquer avec un backend. Si tu utilises l'IP directe du Pod backend, la connexion casse dès que le Pod est recréé.</p>
<div class="diagram">
  Le problème des IPs éphémères

  Avant le crash :
  Frontend ──────> <span class="d-accent">Pod Backend (10.244.1.5)</span>     OK

  Après le crash et recréation :
  Frontend ──────> <span class="d-accent">10.244.1.5</span>                    ERREUR (IP disparue)
                   Pod Backend (<span class="d-accent">10.244.2.9</span>)     Nouvelle IP !
</div>
<p>Le <strong>Service</strong> résout ce problème en fournissant :</p>
<ul>
<li>Une <strong>adresse IP virtuelle stable</strong> (ClusterIP) qui ne change jamais tant que le Service existe</li>
<li>Un <strong>nom DNS</strong> qui pointe vers cette IP stable</li>
<li>Du <strong>load balancing</strong> automatique entre les Pods cibles</li>
</ul>
<h3>Le modèle réseau Kubernetes</h3>
<p>Le réseau de K8s repose sur 3 règles fondamentales :</p>
<ul>
<li><strong>Chaque Pod a sa propre adresse IP</strong> (pas de partage d'IP entre Pods)</li>
<li><strong>Tous les Pods peuvent communiquer entre eux sans NAT</strong> (réseau plat)</li>
<li><strong>Tous les Nodes peuvent communiquer avec tous les Pods</strong></li>
</ul>
<div class="diagram">
  Réseau plat Kubernetes

  +────── Node 1 ──────+    +────── Node 2 ──────+
  |                     |    |                     |
  |  Pod A              |    |  Pod C              |
  |  <span class="d-accent">10.244.1.5</span>        |    |  <span class="d-accent">10.244.2.8</span>        |
  |                     |    |                     |
  |  Pod B              |    |  Pod D              |
  |  <span class="d-accent">10.244.1.6</span>        |    |  <span class="d-accent">10.244.2.9</span>        |
  |                     |    |                     |
  +─────────────────────+    +─────────────────────+
            |                          |
  ──────────┴──────────────────────────┴────────────
            Réseau plat (CNI plugin)
            Pod A peut contacter Pod D directement
</div>
<p>Ce réseau plat est implémenté par un <strong>plugin CNI</strong> (Container Network Interface). Les plus courants sont Calico, Cilium et Flannel.</p>
<div class="info-box note">minikube utilise son propre plugin réseau par défaut. Tu n'as pas besoin de configurer un CNI pour apprendre. En production, le choix du CNI est important car il impacte les performances et les fonctionnalités réseau disponibles.</div>`
    },
    {
      title: "Types de Services",
      content: `<p>Kubernetes propose 4 types de Services. Voici les trois principaux que tu dois maîtriser.</p>
<h3>1. ClusterIP (type par défaut)</h3>
<p>Le Service reçoit une IP virtuelle accessible <strong>uniquement depuis l'intérieur du cluster</strong>. C'est le type le plus courant pour la communication entre services (frontend vers backend, backend vers base de données).</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">backend-svc</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">type</span>: <span class="hl-str">ClusterIP</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">backend</span>          <span class="hl-comment"># Cible les Pods avec le label app=backend</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">80</span>               <span class="hl-comment"># Port du Service (celui qu'on appelle)</span>
    <span class="hl-key">targetPort</span>: <span class="hl-num">3000</span>        <span class="hl-comment"># Port du conteneur dans le Pod</span>
    <span class="hl-key">protocol</span>: <span class="hl-str">TCP</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Créer un Service en impératif</span>
<span class="hl-cmd">$ kubectl expose deployment backend <span class="hl-flag">--port</span>=80 <span class="hl-flag">--target-port</span>=3000 <span class="hl-flag">--name</span>=backend-svc</span>

<span class="hl-comment"># Vérifier</span>
<span class="hl-cmd">$ kubectl get svc backend-svc</span>
<span class="hl-comment"># NAME          TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE</span>
<span class="hl-comment"># backend-svc   ClusterIP   10.96.45.123   &lt;none&gt;        80/TCP    5s</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>2. NodePort</h3>
<p>Expose le Service sur un port statique de <strong>chaque Node</strong> du cluster (plage 30000-32767). Accessible depuis l'extérieur via <code>&lt;NodeIP&gt;:&lt;NodePort&gt;</code>. Utile pour le développement et les tests.</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">backend-nodeport</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">type</span>: <span class="hl-str">NodePort</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">backend</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">80</span>               <span class="hl-comment"># Port du Service (interne)</span>
    <span class="hl-key">targetPort</span>: <span class="hl-num">3000</span>        <span class="hl-comment"># Port du conteneur</span>
    <span class="hl-key">nodePort</span>: <span class="hl-num">30080</span>         <span class="hl-comment"># Port sur le Node (optionnel, sinon auto)</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Créer en impératif</span>
<span class="hl-cmd">$ kubectl expose deployment backend <span class="hl-flag">--type</span>=NodePort <span class="hl-flag">--port</span>=80 <span class="hl-flag">--target-port</span>=3000</span>

<span class="hl-comment"># Accéder au service sur minikube</span>
<span class="hl-cmd">$ minikube service backend-nodeport <span class="hl-flag">--url</span></span>
<span class="hl-comment"># Retourne une URL comme http://192.168.49.2:30080</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>3. LoadBalancer</h3>
<p>Provisionne un <strong>load balancer externe</strong> via le cloud provider (AWS ELB, GCP Cloud LB, Azure LB). Le Service reçoit une IP publique. C'est le type utilisé en production sur le cloud.</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">backend-lb</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">type</span>: <span class="hl-str">LoadBalancer</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">backend</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">80</span>
    <span class="hl-key">targetPort</span>: <span class="hl-num">3000</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note">Sur minikube, le type LoadBalancer fonctionne en lançant <code>minikube tunnel</code> dans un terminal séparé. Cette commande crée un tunnel réseau qui simule un load balancer externe et attribue une IP externe au Service.</div>
<div class="diagram">
  Résumé des types de Services

  <span class="d-accent">ClusterIP</span>       IP interne, accessible depuis le cluster uniquement
  <span class="d-accent">NodePort</span>        ClusterIP + port ouvert sur chaque Node (30000-32767)
  <span class="d-accent">LoadBalancer</span>    NodePort + load balancer externe (cloud)
  <span class="d-accent">ExternalName</span>    Alias DNS vers un service externe (pas de proxy)
</div>`
    },
    {
      title: "DNS et service discovery",
      content: `<p>Kubernetes intègre un serveur DNS interne : <strong>CoreDNS</strong>. Il tourne dans le namespace <code>kube-system</code> et fournit la résolution de noms pour tous les Services du cluster.</p>
<h3>Format DNS des Services</h3>
<p>Chaque Service crée automatiquement une entrée DNS au format :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Format complet (FQDN)</span>
&lt;nom-du-service&gt;.&lt;namespace&gt;.svc.cluster.local

<span class="hl-comment"># Exemples concrets :</span>
backend-svc.default.svc.cluster.local     <span class="hl-comment"># Service "backend-svc" dans "default"</span>
mysql.database.svc.cluster.local          <span class="hl-comment"># Service "mysql" dans "database"</span>
redis.cache.svc.cluster.local             <span class="hl-comment"># Service "redis" dans "cache"</span></code></pre><button class="copy-btn">Copier</button></div>
<p>En pratique, tu n'as pas besoin d'utiliser le FQDN complet :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Depuis un Pod dans le MÊME namespace :</span>
curl backend-svc                    <span class="hl-comment"># Suffisant ! K8s résout automatiquement</span>
curl backend-svc:80

<span class="hl-comment"># Depuis un Pod dans un AUTRE namespace :</span>
curl backend-svc.default             <span class="hl-comment"># Nom du service + namespace</span>
curl backend-svc.default.svc         <span class="hl-comment"># Marche aussi</span>
curl backend-svc.default.svc.cluster.local  <span class="hl-comment"># FQDN complet</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Tester le DNS depuis un Pod</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Lancer un Pod de debug avec les outils réseau</span>
<span class="hl-cmd">$ kubectl run dns-test <span class="hl-flag">--rm</span> <span class="hl-flag">-it</span> <span class="hl-flag">--image</span>=busybox:1.36 -- /bin/sh</span>

<span class="hl-comment"># Dans le shell du Pod :</span>
<span class="hl-comment"># Résoudre un nom de Service</span>
nslookup backend-svc
nslookup backend-svc.default.svc.cluster.local

<span class="hl-comment"># Tester la connectivité HTTP</span>
wget -qO- backend-svc

<span class="hl-comment"># Voir la configuration DNS du Pod</span>
cat /etc/resolv.conf
<span class="hl-comment"># nameserver 10.96.0.10 (IP de CoreDNS)</span>
<span class="hl-comment"># search default.svc.cluster.local svc.cluster.local cluster.local</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Le fichier <code>/etc/resolv.conf</code> de chaque Pod est configuré automatiquement par K8s. La directive <code>search</code> explique pourquoi tu peux utiliser juste le nom du Service sans le namespace : K8s essaie automatiquement les suffixes dans l'ordre.</p>
<h3>Headless Service (clusterIP: None)</h3>
<p>Un <strong>Headless Service</strong> est un Service sans ClusterIP. Au lieu de renvoyer l'IP du Service, le DNS renvoie directement les IPs de tous les Pods. C'est utile pour les StatefulSets :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">db-headless</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">clusterIP</span>: <span class="hl-str">None</span>            <span class="hl-comment"># Headless : pas d'IP virtuelle</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">database</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">5432</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Pour le CKA, retiens le format DNS : <code>&lt;service&gt;.&lt;namespace&gt;.svc.cluster.local</code>. C'est une question classique. Et souviens-toi : dans le même namespace, le nom du Service seul suffit.</div>`
    },
    {
      title: "Endpoints",
      content: `<p>Quand tu crées un Service avec un <code>selector</code>, Kubernetes crée automatiquement un objet <strong>Endpoints</strong> qui contient la liste des IPs des Pods correspondants au selector.</p>
<div class="diagram">
  Service backend-svc (selector: app=backend)
     |
     +── <span class="d-accent">Endpoints</span>
            +-- 10.244.1.5:3000  (Pod backend-abc12)
            +-- 10.244.2.8:3000  (Pod backend-def34)
            +-- 10.244.1.9:3000  (Pod backend-ghi56)

  Le trafic vers backend-svc est réparti entre ces 3 IPs
</div>
<div class="code-block"><pre><code><span class="hl-comment"># Voir les Endpoints d'un Service</span>
<span class="hl-cmd">$ kubectl get endpoints backend-svc</span>

<span class="hl-comment"># Voir les EndpointSlices (format plus moderne et performant)</span>
<span class="hl-cmd">$ kubectl get endpointslices <span class="hl-flag">-l</span> kubernetes.io/service-name=backend-svc</span>

<span class="hl-comment"># Détails complets</span>
<span class="hl-cmd">$ kubectl describe endpoints backend-svc</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Quand un Pod est ajouté ou supprimé (scaling, crash, rolling update), les Endpoints sont automatiquement mis à jour. C'est ce mécanisme qui permet au load balancing de fonctionner de manière dynamique.</p>
<h3>EndpointSlices vs Endpoints</h3>
<p>Les <strong>EndpointSlices</strong> sont le remplacement moderne des Endpoints. Un objet Endpoints contient TOUTES les IPs dans un seul objet. Quand tu as 5000 Pods derrière un Service, cet objet devient énorme. Les EndpointSlices découpent la liste en morceaux de 100 IPs, ce qui est beaucoup plus efficace.</p>
<h3>Services sans selector</h3>
<p>Tu peux créer un Service sans selector pour définir les Endpoints manuellement. C'est utile pour pointer vers un service externe avec une IP fixe :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">external-db</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">5432</span>
---
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Endpoints</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">external-db</span>         <span class="hl-comment"># Doit avoir le même nom que le Service</span>
<span class="hl-key">subsets</span>:
- <span class="hl-key">addresses</span>:
  - <span class="hl-key">ip</span>: <span class="hl-str">192.168.1.100</span>       <span class="hl-comment"># IP du serveur externe</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">5432</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">En pratique, tu n'as pas besoin de créer des EndpointSlices manuellement. K8s les gère automatiquement. Mais savoir les lire est utile pour le debug : si un Pod ne reçoit pas de trafic, vérifie s'il apparaît dans les Endpoints du Service avec <code>kubectl get endpoints</code>.</div>`
    }
  ],
  exercises: [
    {
      title: "Exposer un Deployment avec un ClusterIP",
      desc: "Crée un Deployment nginx, expose-le avec un Service ClusterIP, puis vérifie la connectivité depuis un Pod de test.",
      steps: [
        "Crée un Deployment : <code>kubectl create deployment web --image=nginx:1.27 --replicas=3</code>",
        "Expose le Deployment en ClusterIP : <code>kubectl expose deployment web --port=80 --name=web-clusterip</code>",
        "Vérifie le Service : <code>kubectl get svc web-clusterip</code> (note l'IP attribuée)",
        "Vérifie les Endpoints : <code>kubectl get endpoints web-clusterip</code> (tu dois voir 3 IPs)",
        "Teste le DNS depuis un Pod : <code>kubectl run test --rm -it --image=busybox:1.36 -- wget -qO- web-clusterip</code>",
        "Scale le Deployment à 5 réplicas : <code>kubectl scale deployment web --replicas=5</code>",
        "Revérifie les Endpoints : <code>kubectl get endpoints web-clusterip</code> (tu dois voir 5 IPs maintenant)",
        "Nettoie : <code>kubectl delete deployment web && kubectl delete svc web-clusterip</code>"
      ],
      validation: "Tu dois pouvoir accéder à la page d'accueil nginx depuis le Pod de test via le nom DNS web-clusterip, et les Endpoints doivent refléter le nombre de réplicas.",
      hint: "Si wget ne fonctionne pas, assure-toi que les Pods du Deployment sont bien en état Running avec <code>kubectl get pods</code>. Le Service met quelques secondes à détecter les Endpoints."
    },
    {
      title: "Créer un Service NodePort",
      desc: "Expose un Deployment nginx via un NodePort et accède à l'application depuis l'extérieur du cluster.",
      steps: [
        "Crée un Deployment : <code>kubectl create deployment web-public --image=nginx:1.27 --replicas=2</code>",
        "Expose en NodePort : <code>kubectl expose deployment web-public --type=NodePort --port=80 --name=web-nodeport</code>",
        "Vérifie le Service : <code>kubectl get svc web-nodeport</code> (note le port dans la plage 30000-32767)",
        "Accède au service : <code>minikube service web-nodeport --url</code> puis ouvre l'URL dans ton navigateur",
        "Alternative : utilise port-forward : <code>kubectl port-forward svc/web-nodeport 8080:80</code> puis ouvre http://localhost:8080",
        "Nettoie : <code>kubectl delete deployment web-public && kubectl delete svc web-nodeport</code>"
      ],
      validation: "Tu dois pouvoir accéder à la page nginx depuis ton navigateur via le NodePort ou via port-forward.",
      hint: "Si <code>minikube service</code> ne fonctionne pas, utilise <code>kubectl port-forward svc/web-nodeport 8080:80</code> qui redirige le port 8080 de ta machine locale vers le port 80 du Service."
    }
  ],
  commands: [
    {
      prompt: "Expose le Deployment 'api' en ClusterIP sur le port 3000 :",
      answers: [
        "kubectl expose deployment api --port=3000",
        "kubectl expose deployment api --port=3000 --target-port=3000"
      ]
    },
    {
      prompt: "Affiche la liste de tous les Services du namespace courant :",
      answers: [
        "kubectl get services",
        "kubectl get svc",
        "kubectl get service"
      ]
    },
    {
      prompt: "Affiche les Endpoints (IPs des Pods cibles) du Service 'web-svc' :",
      answers: [
        "kubectl get endpoints web-svc",
        "kubectl get ep web-svc"
      ]
    },
    {
      prompt: "Redirige le port local 8080 vers le port 80 du Service 'web-svc' :",
      answers: [
        "kubectl port-forward svc/web-svc 8080:80",
        "kubectl port-forward service/web-svc 8080:80"
      ]
    }
  ],
  quiz: [
    {
      question: "Pourquoi les Services existent-ils dans Kubernetes ?",
      options: [
        "Pour accélérer le réseau",
        "Parce que les Pods ont des IPs éphémères qui changent à chaque recréation",
        "Pour chiffrer le trafic entre les Pods",
        "Pour limiter la bande passante des Pods"
      ],
      correct: 1,
      explanation: "Les Pods reçoivent une nouvelle IP à chaque recréation (crash, scaling, rolling update). Le Service fournit une IP stable et un nom DNS qui ne changent pas, permettant une communication fiable entre les applications."
    },
    {
      question: "Quel type de Service est accessible uniquement depuis l'intérieur du cluster ?",
      options: ["NodePort", "LoadBalancer", "ClusterIP", "ExternalName"],
      correct: 2,
      explanation: "ClusterIP est le type par défaut. Il crée une IP virtuelle interne accessible uniquement depuis les Pods du cluster. C'est le type utilisé pour la communication inter-services."
    },
    {
      question: "Quelle plage de ports est utilisée par les Services de type NodePort ?",
      options: ["1-1024", "8000-9999", "30000-32767", "49152-65535"],
      correct: 2,
      explanation: "NodePort ouvre un port sur chaque Node du cluster dans la plage 30000-32767. Tu peux spécifier un port dans cette plage avec nodePort:, sinon K8s en choisit un automatiquement."
    },
    {
      question: "Comment un Pod dans le namespace 'frontend' peut-il contacter le Service 'api' dans le namespace 'backend' ?",
      options: [
        "C'est impossible, les namespaces sont isolés",
        "En utilisant le nom DNS 'api.backend' ou le FQDN 'api.backend.svc.cluster.local'",
        "En utilisant uniquement le nom 'api'",
        "En utilisant l'IP du Pod directement"
      ],
      correct: 1,
      explanation: "Pour contacter un Service dans un autre namespace, il faut ajouter le namespace au nom DNS : 'api.backend'. Le FQDN complet est 'api.backend.svc.cluster.local'. Le nom seul ('api') ne fonctionne que dans le même namespace."
    },
    {
      question: "Qu'est-ce qu'un Headless Service (clusterIP: None) ?",
      options: [
        "Un Service sans port",
        "Un Service qui renvoie directement les IPs des Pods au lieu d'une IP de Service",
        "Un Service qui ne supporte pas le DNS",
        "Un Service supprimé mais dont le nom est réservé"
      ],
      correct: 1,
      explanation: "Un Headless Service n'a pas d'IP virtuelle (clusterIP: None). Quand on fait un nslookup, le DNS renvoie directement les IPs de tous les Pods cibles au lieu d'une seule IP de Service. C'est utile pour les StatefulSets."
    }
  ]
},

{
  id: 7,
  title: "Stockage et Persistance",
  desc: "Comprendre les volumes éphémères et persistants, maîtriser PV, PVC et StorageClasses.",
  objectives: [
    "Comprendre la différence entre stockage éphémère et persistant",
    "Utiliser emptyDir et hostPath pour les volumes de base",
    "Créer et utiliser des PersistentVolumes (PV) et PersistentVolumeClaims (PVC)",
    "Comprendre les StorageClasses et le provisionnement dynamique"
  ],
  sections: [
    {
      title: "Le problème du stockage",
      content: `<p>Par défaut, tout ce qui se passe à l'intérieur d'un conteneur est <strong>éphémère</strong>. Si le conteneur redémarre ou si le Pod est supprimé, toutes les données écrites dans le système de fichiers du conteneur disparaissent. C'est un problème pour beaucoup d'applications : bases de données, fichiers uploadés, caches partagés entre conteneurs.</p>
<p>Kubernetes propose un système de <strong>volumes</strong> pour résoudre ce problème. Un volume est un répertoire accessible aux conteneurs d'un Pod. Il existe deux grandes catégories :</p>
<ul>
<li><strong>Volumes éphémères</strong> : leur durée de vie est liée à celle du Pod. Quand le Pod disparaît, les données aussi</li>
<li><strong>Volumes persistants</strong> : les données survivent à la suppression du Pod. Indispensable pour les bases de données</li>
</ul>
<div class="diagram">
                POD
+-------------------------------+
|                               |
|  <span class="d-accent">Conteneur A</span>    <span class="d-accent">Conteneur B</span>  |
|    /data ──────── /data       |
|         \\      /              |
|          \\    /               |
|       [ Volume ]              |
|                               |
+-------------------------------+
        |
        v
  Éphémère : disparaît avec le Pod
  Persistant : survit à la suppression
</div>
<div class="info-box note">Le stockage est un domaine qui représente environ <strong>10% de l'examen CKA</strong>. Les concepts PV, PVC et StorageClass sont des incontournables à maîtriser.</div>`
    },
    {
      title: "Volumes de base : emptyDir et hostPath",
      content: `<p>Les volumes de base sont simples à utiliser et couvrent de nombreux cas courants.</p>
<h3>emptyDir</h3>
<p>Un <code>emptyDir</code> est un répertoire vide créé quand le Pod est assigné à un noeud. Tous les conteneurs du Pod peuvent y lire et écrire. Le cas d'usage classique : <strong>partager des fichiers entre deux conteneurs d'un même Pod</strong>.</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">partage-fichiers</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">ecrivain</span>
    <span class="hl-key">image</span>: <span class="hl-str">busybox</span>
    <span class="hl-key">command</span>: [<span class="hl-str">"sh"</span>, <span class="hl-str">"-c"</span>, <span class="hl-str">"while true; do date >> /cache/log.txt; sleep 5; done"</span>]
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">cache-vol</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/cache</span>
  - <span class="hl-key">name</span>: <span class="hl-str">lecteur</span>
    <span class="hl-key">image</span>: <span class="hl-str">busybox</span>
    <span class="hl-key">command</span>: [<span class="hl-str">"sh"</span>, <span class="hl-str">"-c"</span>, <span class="hl-str">"tail -f /cache/log.txt"</span>]
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">cache-vol</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/cache</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">cache-vol</span>
    <span class="hl-key">emptyDir</span>: {}</code></pre><button class="copy-btn">Copier</button></div>
<p>Le conteneur "ecrivain" écrit la date toutes les 5 secondes dans un fichier. Le conteneur "lecteur" lit ce même fichier en continu. Ils partagent le volume <code>cache-vol</code>.</p>
<p>Tu peux aussi utiliser <code>emptyDir</code> avec un support en mémoire (RAM) pour des caches ultra-rapides :</p>
<div class="code-block"><pre><code><span class="hl-key">volumes</span>:
- <span class="hl-key">name</span>: <span class="hl-str">cache-ram</span>
  <span class="hl-key">emptyDir</span>:
    <span class="hl-key">medium</span>: <span class="hl-str">Memory</span>
    <span class="hl-key">sizeLimit</span>: <span class="hl-str">256Mi</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>hostPath</h3>
<p>Un <code>hostPath</code> monte un fichier ou répertoire du <strong>système de fichiers du Node</strong> dans le Pod. Les données persistent tant que le Node existe, mais attention : si le Pod est replanifié sur un autre Node, il ne retrouvera pas ses données.</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">pod-hostpath</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">host-data</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/data</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">host-data</span>
    <span class="hl-key">hostPath</span>:
      <span class="hl-key">path</span>: <span class="hl-str">/mnt/data</span>
      <span class="hl-key">type</span>: <span class="hl-str">DirectoryOrCreate</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box warning"><code>hostPath</code> est à éviter en production pour les données applicatives. Il crée un couplage fort entre le Pod et le Node, empêche la replanification, et pose des problèmes de sécurité (accès au système de fichiers du Node). Il est surtout utilisé par les composants système (DaemonSets qui lisent les logs du Node par exemple).</div>`
    },
    {
      title: "PersistentVolumes (PV) et PersistentVolumeClaims (PVC)",
      content: `<p>Pour du stockage véritablement persistant et découplé du Node, Kubernetes introduit deux objets complémentaires : le <strong>PersistentVolume</strong> (PV) et le <strong>PersistentVolumeClaim</strong> (PVC).</p>
<div class="diagram">
  Modèle PV / PVC

  <span class="d-accent">Administrateur</span>                      <span class="d-accent">Développeur</span>

  Crée le PersistentVolume          Crée le PersistentVolumeClaim
  (le stockage physique)            (la demande de stockage)
         |                                   |
         v                                   v
  +──────────────+                  +──────────────────+
  | PV           |  <-- binding --> | PVC              |
  | 10Gi, RWO    |                  | Demande 5Gi, RWO |
  | NFS, iSCSI...|                  |                  |
  +──────────────+                  +──────────────────+
                                             |
                                             v
                                    +──────────────────+
                                    | Pod              |
                                    | volumeMount: PVC |
                                    +──────────────────+
</div>
<p>L'idée est de <strong>séparer les responsabilités</strong> :</p>
<ul>
<li><strong>L'administrateur</strong> crée les PV (il connaît l'infrastructure de stockage : NFS, iSCSI, EBS, etc.)</li>
<li><strong>Le développeur</strong> crée les PVC (il sait de combien d'espace il a besoin, sans se soucier du stockage sous-jacent)</li>
</ul>
<h3>Créer un PersistentVolume</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">PersistentVolume</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">pv-data</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">capacity</span>:
    <span class="hl-key">storage</span>: <span class="hl-str">10Gi</span>
  <span class="hl-key">accessModes</span>:
  - <span class="hl-str">ReadWriteOnce</span>            <span class="hl-comment"># Un seul Node peut monter en lecture/écriture</span>
  <span class="hl-key">persistentVolumeReclaimPolicy</span>: <span class="hl-str">Retain</span>   <span class="hl-comment"># Garder les données après suppression du PVC</span>
  <span class="hl-key">hostPath</span>:                     <span class="hl-comment"># Type de stockage (hostPath pour minikube)</span>
    <span class="hl-key">path</span>: <span class="hl-str">/mnt/data</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Les Access Modes</h3>
<ul>
<li><strong>ReadWriteOnce (RWO)</strong> : un seul Node peut monter le volume en lecture/écriture. Le plus courant pour les bases de données</li>
<li><strong>ReadOnlyMany (ROX)</strong> : plusieurs Nodes peuvent monter le volume en lecture seule. Utile pour partager des données statiques</li>
<li><strong>ReadWriteMany (RWX)</strong> : plusieurs Nodes peuvent monter le volume en lecture/écriture. Nécessite un stockage réseau (NFS, CephFS)</li>
</ul>
<h3>Les Reclaim Policies</h3>
<ul>
<li><strong>Retain</strong> : les données sont conservées après la suppression du PVC. L'administrateur doit nettoyer manuellement</li>
<li><strong>Delete</strong> : le PV et les données sont supprimés automatiquement quand le PVC est supprimé</li>
<li><strong>Recycle</strong> (obsolète) : les données sont effacées et le PV est rendu disponible</li>
</ul>
<h3>Créer un PersistentVolumeClaim</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">PersistentVolumeClaim</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">pvc-data</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">accessModes</span>:
  - <span class="hl-str">ReadWriteOnce</span>
  <span class="hl-key">resources</span>:
    <span class="hl-key">requests</span>:
      <span class="hl-key">storage</span>: <span class="hl-str">5Gi</span>            <span class="hl-comment"># Demande 5Gi (le PV de 10Gi sera lié)</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Kubernetes cherche automatiquement un PV compatible (même access mode, capacité suffisante) et les lie ensemble. Le PVC passe en état <code>Bound</code>.</p>
<h3>Utiliser un PVC dans un Pod</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-avec-stockage</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">data-vol</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/usr/share/nginx/html</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">data-vol</span>
    <span class="hl-key">persistentVolumeClaim</span>:
      <span class="hl-key">claimName</span>: <span class="hl-str">pvc-data</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Vérifier l'état du PV et du PVC</span>
<span class="hl-cmd">$ kubectl get pv</span>
<span class="hl-comment"># NAME      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM             AGE</span>
<span class="hl-comment"># pv-data   10Gi       RWO            Retain           Bound    default/pvc-data  30s</span>

<span class="hl-cmd">$ kubectl get pvc</span>
<span class="hl-comment"># NAME       STATUS   VOLUME    CAPACITY   ACCESS MODES   AGE</span>
<span class="hl-comment"># pvc-data   Bound    pv-data   10Gi       RWO            25s</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Le Pod ne référence jamais directement le PV. Il référence toujours le PVC. C'est le PVC qui est lié au PV. Ce découplage permet de changer le stockage sous-jacent sans modifier les Pods.</div>`
    },
    {
      title: "StorageClasses et provisionnement dynamique",
      content: `<p>Créer manuellement des PV pour chaque demande de stockage ne passe pas à l'échelle. Imagine devoir créer un PV à la main chaque fois qu'un développeur a besoin de stockage. Les <strong>StorageClasses</strong> résolvent ce problème grâce au <strong>provisionnement dynamique</strong>.</p>
<p>Avec une StorageClass, Kubernetes crée automatiquement le PV quand un PVC est créé. Tu n'as plus besoin de créer les PV manuellement.</p>
<div class="diagram">
  Provisionnement statique vs dynamique

  <span class="d-accent">Statique</span> (sans StorageClass) :
  Admin crée PV  -->  Dev crée PVC  -->  K8s lie PV et PVC

  <span class="d-accent">Dynamique</span> (avec StorageClass) :
  Dev crée PVC avec storageClassName  -->  K8s crée le PV automatiquement
</div>
<h3>Créer une StorageClass</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">storage.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">StorageClass</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">fast-ssd</span>
<span class="hl-key">provisioner</span>: <span class="hl-str">kubernetes.io/no-provisioner</span>   <span class="hl-comment"># Pour du stockage local</span>
<span class="hl-key">volumeBindingMode</span>: <span class="hl-str">WaitForFirstConsumer</span>    <span class="hl-comment"># Attendre qu'un Pod utilise le PVC</span>
<span class="hl-key">reclaimPolicy</span>: <span class="hl-str">Delete</span></code></pre><button class="copy-btn">Copier</button></div>
<p>En production sur le cloud, les provisioners sont fournis par les cloud providers :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Exemple AWS EBS</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">storage.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">StorageClass</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">gp3</span>
<span class="hl-key">provisioner</span>: <span class="hl-str">ebs.csi.aws.com</span>
<span class="hl-key">parameters</span>:
  <span class="hl-key">type</span>: <span class="hl-str">gp3</span>
  <span class="hl-key">encrypted</span>: <span class="hl-str">"true"</span>
<span class="hl-key">reclaimPolicy</span>: <span class="hl-str">Delete</span>
<span class="hl-key">volumeBindingMode</span>: <span class="hl-str">WaitForFirstConsumer</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Utiliser le provisionnement dynamique</h3>
<p>Il suffit de spécifier le <code>storageClassName</code> dans le PVC. Kubernetes crée le PV automatiquement :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">PersistentVolumeClaim</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">db-storage</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">storageClassName</span>: <span class="hl-str">fast-ssd</span>     <span class="hl-comment"># Référence la StorageClass</span>
  <span class="hl-key">accessModes</span>:
  - <span class="hl-str">ReadWriteOnce</span>
  <span class="hl-key">resources</span>:
    <span class="hl-key">requests</span>:
      <span class="hl-key">storage</span>: <span class="hl-str">20Gi</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>StorageClass par défaut</h3>
<p>La plupart des clusters ont une StorageClass par défaut (marquée avec l'annotation <code>storageclass.kubernetes.io/is-default-class: "true"</code>). Si tu crées un PVC sans spécifier de <code>storageClassName</code>, la StorageClass par défaut est utilisée.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Voir les StorageClasses disponibles</span>
<span class="hl-cmd">$ kubectl get storageclasses</span>
<span class="hl-comment"># NAME                 PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE</span>
<span class="hl-comment"># standard (default)   k8s.io/minikube-hostpath   Delete          Immediate</span>

<span class="hl-comment"># Sur minikube, "standard" est la StorageClass par défaut</span>
<span class="hl-comment"># Elle utilise le provisioner minikube-hostpath</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Sur minikube, tu peux profiter du provisionnement dynamique sans rien configurer. Crée simplement un PVC sans storageClassName (ou avec <code>storageClassName: standard</code>), et minikube crée automatiquement le PV correspondant. C'est très pratique pour apprendre et tester.</div>`
    }
  ],
  exercises: [
    {
      title: "Utiliser emptyDir pour des données temporaires",
      desc: "Crée un Pod multi-conteneurs qui partage des données via un volume emptyDir entre un conteneur écrivain et un conteneur lecteur.",
      steps: [
        "Crée un fichier pod-emptydir.yaml avec le Pod multi-conteneurs suivant : un conteneur 'ecrivain' (busybox) qui écrit la date toutes les 5 secondes dans /cache/log.txt, et un conteneur 'lecteur' (busybox) qui fait tail -f /cache/log.txt. Les deux montent un volume emptyDir au chemin /cache",
        "Applique le YAML : <code>kubectl apply -f pod-emptydir.yaml</code>",
        "Vérifie que le Pod tourne : <code>kubectl get pod partage-fichiers</code>",
        "Lis les logs du conteneur lecteur : <code>kubectl logs partage-fichiers -c lecteur</code>",
        "Vérifie le contenu du fichier partagé : <code>kubectl exec partage-fichiers -c ecrivain -- cat /cache/log.txt</code>",
        "Supprime le Pod : <code>kubectl delete pod partage-fichiers</code> (les données disparaissent avec le Pod)"
      ],
      validation: "Tu dois voir les dates s'accumuler dans les logs du conteneur lecteur, prouvant que les deux conteneurs partagent bien le même volume.",
      hint: "Utilise l'exemple YAML de la section 'emptyDir' ci-dessus. Les deux conteneurs doivent référencer le même nom de volume dans leurs volumeMounts."
    },
    {
      title: "Créer un PV et un PVC pour du stockage persistant",
      desc: "Crée un PersistentVolume, un PersistentVolumeClaim, et un Pod qui utilise le stockage persistant. Vérifie que les données survivent à la suppression du Pod.",
      steps: [
        "Crée un fichier pv.yaml avec un PersistentVolume de 1Gi en hostPath (/mnt/data), access mode ReadWriteOnce, reclaim policy Retain",
        "Applique : <code>kubectl apply -f pv.yaml</code> et vérifie : <code>kubectl get pv</code> (état Available)",
        "Crée un fichier pvc.yaml avec un PersistentVolumeClaim demandant 500Mi en ReadWriteOnce",
        "Applique : <code>kubectl apply -f pvc.yaml</code> et vérifie : <code>kubectl get pvc</code> (état Bound)",
        "Crée un Pod nginx qui monte le PVC au chemin /usr/share/nginx/html",
        "Écris un fichier dans le volume : <code>kubectl exec app-avec-stockage -- sh -c 'echo Bonjour depuis le PV > /usr/share/nginx/html/index.html'</code>",
        "Supprime le Pod : <code>kubectl delete pod app-avec-stockage</code>",
        "Recrée le Pod avec le même PVC, puis vérifie que le fichier existe toujours : <code>kubectl exec app-avec-stockage -- cat /usr/share/nginx/html/index.html</code>",
        "Nettoie : <code>kubectl delete pod app-avec-stockage && kubectl delete pvc pvc-data && kubectl delete pv pv-data</code>"
      ],
      validation: "Après avoir supprimé et recréé le Pod, tu dois retrouver le fichier index.html avec le contenu 'Bonjour depuis le PV'. Les données ont survécu à la suppression du Pod.",
      hint: "Assure-toi que le PV et le PVC ont le même access mode (ReadWriteOnce) et que la capacité du PV est supérieure ou égale à la demande du PVC. Sur minikube, hostPath fonctionne parfaitement pour cet exercice."
    }
  ],
  commands: [
    {
      prompt: "Affiche la liste de tous les PersistentVolumes du cluster :",
      answers: [
        "kubectl get pv",
        "kubectl get persistentvolumes",
        "kubectl get persistentvolume"
      ]
    },
    {
      prompt: "Affiche la liste de tous les PersistentVolumeClaims du namespace courant :",
      answers: [
        "kubectl get pvc",
        "kubectl get persistentvolumeclaims",
        "kubectl get persistentvolumeclaim"
      ]
    },
    {
      prompt: "Affiche les détails complets du PersistentVolume 'pv-data' (capacité, access mode, état, claim) :",
      answers: [
        "kubectl describe pv pv-data",
        "kubectl describe persistentvolume pv-data"
      ]
    }
  ],
  quiz: [
    {
      question: "Que se passe-t-il avec les données d'un volume emptyDir quand le Pod est supprimé ?",
      options: [
        "Les données sont sauvegardées automatiquement",
        "Les données sont transférées vers un autre Pod",
        "Les données sont supprimées définitivement",
        "Les données sont conservées sur le Node"
      ],
      correct: 2,
      explanation: "Un emptyDir a la même durée de vie que le Pod. Quand le Pod est supprimé, le volume emptyDir et toutes ses données sont supprimés définitivement. C'est pour cela qu'on l'appelle 'éphémère'."
    },
    {
      question: "Quel access mode permet à plusieurs Nodes de monter un volume en lecture/écriture ?",
      options: [
        "ReadWriteOnce (RWO)",
        "ReadOnlyMany (ROX)",
        "ReadWriteMany (RWX)",
        "ReadWriteSingle (RWS)"
      ],
      correct: 2,
      explanation: "ReadWriteMany (RWX) permet à plusieurs Nodes de monter le volume en lecture ET écriture simultanément. Cela nécessite un stockage réseau comme NFS ou CephFS. ReadWriteOnce ne permet qu'un seul Node, et ReadOnlyMany permet plusieurs Nodes mais en lecture seule."
    },
    {
      question: "Quel est le rôle d'une StorageClass ?",
      options: [
        "Classer les volumes par taille",
        "Permettre le provisionnement dynamique de PersistentVolumes",
        "Chiffrer les données stockées",
        "Limiter l'accès aux volumes par namespace"
      ],
      correct: 1,
      explanation: "Une StorageClass permet le provisionnement dynamique : quand un PVC référence une StorageClass, Kubernetes crée automatiquement le PV correspondant sans intervention manuelle de l'administrateur."
    },
    {
      question: "Que signifie la reclaim policy 'Retain' pour un PersistentVolume ?",
      options: [
        "Le PV est supprimé quand le PVC est supprimé",
        "Les données sont conservées après la suppression du PVC, l'administrateur doit nettoyer manuellement",
        "Le PV est recyclé et rendu disponible pour un autre PVC",
        "Le PV est automatiquement sauvegardé"
      ],
      correct: 1,
      explanation: "Avec la policy 'Retain', quand le PVC est supprimé, le PV passe en état 'Released' mais les données sont conservées. L'administrateur doit manuellement supprimer ou nettoyer le PV. C'est la policy la plus sûre pour les données critiques."
    }
  ]
},
{
  id: 8,
  title: "Workloads avancés",
  desc: "StatefulSets, DaemonSets, Jobs, CronJobs, probes de santé et gestion des ressources",
  objectives: [
    "Déployer des applications stateful avec les StatefulSets",
    "Comprendre les DaemonSets et leurs cas d'usage",
    "Exécuter des tâches batch avec Jobs et CronJobs",
    "Configurer les probes de santé (liveness, readiness, startup)",
    "Gérer les ressources CPU et mémoire avec requests et limits"
  ],
  sections: [
    {
      title: "StatefulSets : identité stable et déploiement ordonné",
      content: `<p>Tu as vu que les Deployments sont parfaits pour les applications <strong>stateless</strong> (sans état) : les Pods sont interchangeables, ils peuvent être supprimés et recréés dans n'importe quel ordre. Mais certaines applications ont besoin de plus de garanties.</p>
<p>Pense à une base de données comme MySQL ou PostgreSQL. Chaque instance a besoin d'un <strong>nom stable</strong> (pour que les autres instances sachent à qui parler), d'un <strong>stockage dédié</strong> (ses données ne doivent pas être mélangées avec celles d'une autre instance), et d'un <strong>ordre de démarrage prévisible</strong> (le primaire avant les réplicas).</p>
<p>Un <strong>StatefulSet</strong> fournit exactement ces garanties :</p>
<ul>
<li><strong>Des noms de Pods stables et prévisibles</strong> : <code>mysql-0</code>, <code>mysql-1</code>, <code>mysql-2</code> (au lieu de noms aléatoires comme <code>mysql-7f8b9d-xk2p4</code>)</li>
<li><strong>Un stockage persistant par réplica</strong> : chaque Pod a son propre PVC, qui reste même si le Pod est supprimé</li>
<li><strong>Un déploiement et scaling ordonnés</strong> : les Pods sont créés dans l'ordre (0, puis 1, puis 2) et supprimés dans l'ordre inverse</li>
<li><strong>Un nom DNS stable</strong> : chaque Pod est accessible via <code>nom-pod.nom-service.namespace.svc.cluster.local</code></li>
</ul>
<div class="diagram">
        <span class="d-accent">StatefulSet "mysql"</span>

  mysql-0              mysql-1              mysql-2
  +--------+           +--------+           +--------+
  |  Pod   |           |  Pod   |           |  Pod   |
  | mysql  |           | mysql  |           | mysql  |
  +--------+           +--------+           +--------+
      |                    |                    |
  +--------+           +--------+           +--------+
  | PVC    |           | PVC    |           | PVC    |
  | data-0 |           | data-1 |           | data-2 |
  +--------+           +--------+           +--------+

  Créé en premier      Créé en deuxième     Créé en dernier
  Supprimé en dernier  Supprimé en deuxième Supprimé en premier
</div>
<p>Un StatefulSet nécessite un <strong>Headless Service</strong> (un Service sans ClusterIP) pour gérer les enregistrements DNS des Pods :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Le Headless Service (clusterIP: None)</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mysql-headless</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">clusterIP</span>: <span class="hl-str">None</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">mysql</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">port</span>: <span class="hl-num">3306</span>
---
<span class="hl-comment"># Le StatefulSet</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">StatefulSet</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mysql</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">serviceName</span>: <span class="hl-str">mysql-headless</span>
  <span class="hl-key">replicas</span>: <span class="hl-num">3</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">mysql</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">mysql</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">mysql</span>
        <span class="hl-key">image</span>: <span class="hl-str">mysql:8.0</span>
        <span class="hl-key">env</span>:
        - <span class="hl-key">name</span>: <span class="hl-str">MYSQL_ROOT_PASSWORD</span>
          <span class="hl-key">value</span>: <span class="hl-str">secret123</span>
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: <span class="hl-num">3306</span>
        <span class="hl-key">volumeMounts</span>:
        - <span class="hl-key">name</span>: <span class="hl-str">data</span>
          <span class="hl-key">mountPath</span>: <span class="hl-str">/var/lib/mysql</span>
  <span class="hl-key">volumeClaimTemplates</span>:
  - <span class="hl-key">metadata</span>:
      <span class="hl-key">name</span>: <span class="hl-str">data</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">accessModes</span>: [<span class="hl-str">"ReadWriteOnce"</span>]
      <span class="hl-key">resources</span>:
        <span class="hl-key">requests</span>:
          <span class="hl-key">storage</span>: <span class="hl-str">5Gi</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Le champ <code>volumeClaimTemplates</code> est propre aux StatefulSets. Il crée automatiquement un PVC par réplica. Le PVC de <code>mysql-0</code> s'appellera <code>data-mysql-0</code>, celui de <code>mysql-1</code> s'appellera <code>data-mysql-1</code>, etc.</p>
<p>Pour accéder à un Pod spécifique d'un StatefulSet via DNS :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Accéder au Pod mysql-0 depuis un autre Pod du même namespace</span>
mysql-0.mysql-headless.default.svc.cluster.local

<span class="hl-comment"># Format général :</span>
nom-du-pod.nom-du-service.namespace.svc.cluster.local</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box warning">N'utilise un StatefulSet que quand c'est vraiment nécessaire (bases de données, systèmes de cache distribués, files de messages). Pour les applications web classiques, un Deployment suffit et est beaucoup plus simple à gérer.</div>`
    },
    {
      title: "DaemonSets : un Pod par noeud",
      content: `<p>Un <strong>DaemonSet</strong> garantit qu'une copie d'un Pod tourne sur <strong>chaque noeud</strong> du cluster (ou sur un sous-ensemble de noeuds). Quand un nouveau noeud est ajouté au cluster, le DaemonSet y déploie automatiquement un Pod. Quand un noeud est retiré, le Pod est supprimé.</p>
<div class="diagram">
        <span class="d-accent">DaemonSet "log-collector"</span>

  Node 1               Node 2               Node 3
  +--------+           +--------+           +--------+
  | Pod    |           | Pod    |           | Pod    |
  | logs   |           | logs   |           | logs   |
  +--------+           +--------+           +--------+

  Nouveau noeud ajouté ?  ---->  Pod déployé automatiquement
  Noeud retiré ?          ---->  Pod supprimé automatiquement
</div>
<p>Les cas d'usage typiques :</p>
<ul>
<li><strong>Collecte de logs</strong> : Fluentd, Filebeat sur chaque noeud pour centraliser les logs</li>
<li><strong>Monitoring</strong> : Node Exporter (Prometheus) pour collecter les métriques de chaque noeud</li>
<li><strong>Réseau</strong> : les plugins CNI (Calico, Cilium) sont eux-mêmes des DaemonSets</li>
<li><strong>Stockage</strong> : agents de stockage distribué (Ceph, Longhorn)</li>
</ul>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">DaemonSet</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">log-collector</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">log-collector</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">log-collector</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">fluentd</span>
        <span class="hl-key">image</span>: <span class="hl-str">fluentd:v1.17</span>
        <span class="hl-key">resources</span>:
          <span class="hl-key">requests</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">100m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">200Mi</span>
          <span class="hl-key">limits</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">200m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">400Mi</span>
        <span class="hl-key">volumeMounts</span>:
        - <span class="hl-key">name</span>: <span class="hl-str">varlog</span>
          <span class="hl-key">mountPath</span>: <span class="hl-str">/var/log</span>
          <span class="hl-key">readOnly</span>: <span class="hl-bool">true</span>
      <span class="hl-key">volumes</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">varlog</span>
        <span class="hl-key">hostPath</span>:
          <span class="hl-key">path</span>: <span class="hl-str">/var/log</span></code></pre><button class="copy-btn">Copier</button></div>
<p>La structure ressemble beaucoup à un Deployment, mais sans le champ <code>replicas</code>. Le nombre de Pods est déterminé automatiquement par le nombre de noeuds.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Voir les DaemonSets (il y en a déjà dans kube-system)</span>
<span class="hl-cmd">$ kubectl get daemonsets -n kube-system</span>

<span class="hl-comment"># Voir sur quel noeud tourne chaque Pod du DaemonSet</span>
<span class="hl-cmd">$ kubectl get pods -l app=log-collector -o wide</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note">Sur minikube avec un seul noeud, un DaemonSet ne crée qu'un seul Pod. En production avec 10 noeuds, il en créerait 10 automatiquement. Tu peux utiliser des <code>nodeSelector</code> ou des <code>tolerations</code> pour cibler un sous-ensemble de noeuds.</div>`
    },
    {
      title: "Jobs et CronJobs : tâches batch",
      content: `<p>Tous les workloads ne sont pas des serveurs qui tournent en continu. Parfois tu as besoin d'exécuter une <strong>tâche ponctuelle</strong> (migration de base de données, traitement d'images, calcul scientifique) ou une <strong>tâche planifiée</strong> (backup quotidien, nettoyage, rapports). C'est le rôle des <strong>Jobs</strong> et des <strong>CronJobs</strong>.</p>
<h3>Job : tâche unique</h3>
<p>Un Job crée un ou plusieurs Pods et s'assure qu'un nombre spécifié d'entre eux se terminent avec succès. Une fois terminé, le Pod n'est pas relancé, mais il n'est pas supprimé non plus (pour que tu puisses consulter les logs).</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">batch/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Job</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">compteur</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">completions</span>: <span class="hl-num">1</span>          <span class="hl-comment"># nombre de Pods qui doivent réussir</span>
  <span class="hl-key">backoffLimit</span>: <span class="hl-num">3</span>         <span class="hl-comment"># nombre de tentatives avant abandon</span>
  <span class="hl-key">activeDeadlineSeconds</span>: <span class="hl-num">60</span> <span class="hl-comment"># timeout global du Job</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">compteur</span>
        <span class="hl-key">image</span>: <span class="hl-str">busybox</span>
        <span class="hl-key">command</span>: [<span class="hl-str">"sh"</span>, <span class="hl-str">"-c"</span>, <span class="hl-str">"for i in $(seq 1 10); do echo $i; sleep 1; done"</span>]
      <span class="hl-key">restartPolicy</span>: <span class="hl-str">Never</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Les paramètres importants :</p>
<ul>
<li><code>completions</code> : combien de Pods doivent terminer avec succès (défaut : 1)</li>
<li><code>parallelism</code> : combien de Pods peuvent tourner en parallèle (défaut : 1)</li>
<li><code>backoffLimit</code> : nombre de tentatives en cas d'échec avant d'abandonner</li>
<li><code>activeDeadlineSeconds</code> : durée maximale du Job</li>
<li><code>restartPolicy</code> : doit être <code>Never</code> ou <code>OnFailure</code> pour les Jobs (pas <code>Always</code>)</li>
</ul>
<h3>CronJob : tâche planifiée</h3>
<p>Un CronJob crée des Jobs à intervalles réguliers, en suivant la syntaxe cron classique :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">batch/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">CronJob</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">backup-quotidien</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">schedule</span>: <span class="hl-str">"0 2 * * *"</span>           <span class="hl-comment"># tous les jours à 2h du matin</span>
  <span class="hl-key">successfulJobsHistoryLimit</span>: <span class="hl-num">3</span>   <span class="hl-comment"># garder les 3 derniers Jobs réussis</span>
  <span class="hl-key">failedJobsHistoryLimit</span>: <span class="hl-num">1</span>       <span class="hl-comment"># garder le dernier Job en échec</span>
  <span class="hl-key">concurrencyPolicy</span>: <span class="hl-str">Forbid</span>       <span class="hl-comment"># ne pas lancer si le précédent tourne encore</span>
  <span class="hl-key">jobTemplate</span>:
    <span class="hl-key">spec</span>:
      <span class="hl-key">template</span>:
        <span class="hl-key">spec</span>:
          <span class="hl-key">containers</span>:
          - <span class="hl-key">name</span>: <span class="hl-str">backup</span>
            <span class="hl-key">image</span>: <span class="hl-str">busybox</span>
            <span class="hl-key">command</span>: [<span class="hl-str">"sh"</span>, <span class="hl-str">"-c"</span>, <span class="hl-str">"echo Backup du $(date)"</span>]
          <span class="hl-key">restartPolicy</span>: <span class="hl-str">OnFailure</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Syntaxe cron : minute heure jour-du-mois mois jour-de-la-semaine</span>
<span class="hl-comment"># "0 2 * * *"   --> tous les jours à 2h du matin</span>
<span class="hl-comment"># "*/5 * * * *" --> toutes les 5 minutes</span>
<span class="hl-comment"># "0 0 * * 0"  --> tous les dimanches à minuit</span>

<span class="hl-comment"># Voir les CronJobs</span>
<span class="hl-cmd">$ kubectl get cronjobs</span>

<span class="hl-comment"># Déclencher manuellement un CronJob pour tester</span>
<span class="hl-cmd">$ kubectl create job test-backup --from=cronjob/backup-quotidien</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">La commande <code>kubectl create job --from=cronjob/</code> est très utile pour tester un CronJob sans attendre la prochaine exécution planifiée. Elle crée immédiatement un Job à partir du template du CronJob.</div>`
    },
    {
      title: "Probes de santé : liveness, readiness, startup",
      content: `<p>Comment Kubernetes sait-il si ton application fonctionne correctement ? Grâce aux <strong>probes</strong> (sondes de santé). Il en existe trois types, chacun avec un rôle différent :</p>
<div class="diagram">
  Démarrage du Pod
        |
        v
  <span class="d-accent">startupProbe</span>  <---- "L'app a-t-elle démarré ?"
        |                (désactive les autres probes pendant le démarrage)
        | succès
        v
  <span class="d-accent">readinessProbe</span> <---- "L'app est-elle prête à recevoir du trafic ?"
        |                (ajoute/retire le Pod des endpoints du Service)
        | succès
        v
  <span class="d-accent">livenessProbe</span>  <---- "L'app est-elle encore vivante ?"
                         (redémarre le conteneur si échec)
</div>
<ul>
<li><strong>livenessProbe</strong> : vérifie si le conteneur est vivant. Si la probe échoue, Kubernetes <strong>redémarre</strong> le conteneur. Utile pour détecter les deadlocks ou les états bloqués</li>
<li><strong>readinessProbe</strong> : vérifie si le conteneur est prêt à recevoir du trafic. Si la probe échoue, le Pod est <strong>retiré des endpoints du Service</strong> (plus de trafic) mais il n'est pas redémarré</li>
<li><strong>startupProbe</strong> : pour les applications lentes à démarrer. Désactive les livenessProbe et readinessProbe tant que la startupProbe n'a pas réussi. Évite que l'app soit tuée avant d'avoir eu le temps de démarrer</li>
</ul>
<p>Il existe trois <strong>méthodes</strong> de vérification :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-avec-probes</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">ports</span>:
    - <span class="hl-key">containerPort</span>: <span class="hl-num">80</span>
    <span class="hl-comment"># Méthode 1 : HTTP GET (appelle un endpoint)</span>
    <span class="hl-key">livenessProbe</span>:
      <span class="hl-key">httpGet</span>:
        <span class="hl-key">path</span>: <span class="hl-str">/healthz</span>
        <span class="hl-key">port</span>: <span class="hl-num">80</span>
      <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">10</span>
      <span class="hl-key">periodSeconds</span>: <span class="hl-num">5</span>
      <span class="hl-key">failureThreshold</span>: <span class="hl-num">3</span>
    <span class="hl-comment"># Méthode 2 : TCP Socket (vérifie qu'un port est ouvert)</span>
    <span class="hl-key">readinessProbe</span>:
      <span class="hl-key">tcpSocket</span>:
        <span class="hl-key">port</span>: <span class="hl-num">80</span>
      <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">5</span>
      <span class="hl-key">periodSeconds</span>: <span class="hl-num">3</span>
    <span class="hl-comment"># Méthode 3 : Exec (exécute une commande dans le conteneur)</span>
    <span class="hl-key">startupProbe</span>:
      <span class="hl-key">exec</span>:
        <span class="hl-key">command</span>:
        - <span class="hl-str">cat</span>
        - <span class="hl-str">/tmp/ready</span>
      <span class="hl-key">failureThreshold</span>: <span class="hl-num">30</span>
      <span class="hl-key">periodSeconds</span>: <span class="hl-num">10</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Les paramètres importants :</p>
<ul>
<li><code>initialDelaySeconds</code> : temps d'attente avant la première vérification</li>
<li><code>periodSeconds</code> : intervalle entre deux vérifications</li>
<li><code>failureThreshold</code> : nombre d'échecs consécutifs avant d'agir</li>
<li><code>successThreshold</code> : nombre de succès consécutifs pour considérer le conteneur comme sain (défaut : 1)</li>
<li><code>timeoutSeconds</code> : délai maximum pour une réponse (défaut : 1s)</li>
</ul>
<div class="info-box warning">Ne confonds pas liveness et readiness. Une erreur classique : utiliser une livenessProbe qui vérifie les dépendances externes (base de données, API tierce). Si la base tombe, tous les Pods sont redémarrés en boucle alors qu'ils n'y sont pour rien. Utilise une readinessProbe pour les dépendances et réserve la livenessProbe uniquement à la santé du conteneur lui-même.</div>`
    },
    {
      title: "Ressources : requests et limits",
      content: `<p>Sans limites de ressources, un seul Pod pourrait consommer tout le CPU et toute la mémoire d'un noeud, affectant tous les autres Pods. Kubernetes offre des mécanismes pour contrôler la consommation.</p>
<h3>Requests et Limits</h3>
<ul>
<li><strong>Requests</strong> : le minimum garanti. Kubernetes utilise cette valeur pour le scheduling (placer le Pod sur un noeud qui a assez de ressources libres)</li>
<li><strong>Limits</strong> : le maximum autorisé. Si un conteneur dépasse sa limite mémoire, il est <strong>OOMKilled</strong> (Out of Memory). Si un conteneur dépasse sa limite CPU, il est <strong>throttlé</strong> (ralenti, mais pas tué)</li>
</ul>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-limitee</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-key">resources</span>:
      <span class="hl-key">requests</span>:
        <span class="hl-key">cpu</span>: <span class="hl-str">100m</span>       <span class="hl-comment"># 100 millicores = 0.1 CPU</span>
        <span class="hl-key">memory</span>: <span class="hl-str">128Mi</span>   <span class="hl-comment"># 128 Mebibytes</span>
      <span class="hl-key">limits</span>:
        <span class="hl-key">cpu</span>: <span class="hl-str">500m</span>       <span class="hl-comment"># 500 millicores = 0.5 CPU</span>
        <span class="hl-key">memory</span>: <span class="hl-str">256Mi</span>   <span class="hl-comment"># 256 Mebibytes</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note"><strong>Unités</strong> :<br>CPU : <code>1</code> = 1 vCPU complet, <code>100m</code> = 0.1 vCPU (100 millicores). Un noeud avec 4 CPU a 4000m disponibles.<br>Mémoire : <code>Mi</code> = Mebioctets (base 1024), <code>Gi</code> = Gibioctets. Ne pas confondre avec MB/GB (base 1000).</div>
<div class="diagram">
  <span class="d-accent">Requests vs Limits</span>

  Mémoire disponible sur le noeud : 8 Gi
  +-------------------------------------------------+
  |                                                 |
  |  Pod A : request 1Gi / limit 2Gi               |
  |  [====request====|----limit----|                |
  |                                                 |
  |  Pod B : request 2Gi / limit 4Gi               |
  |  [========request========|--------limit--------|
  |                                                 |
  |  Scheduler : 8 - 1 - 2 = 5 Gi encore dispo     |
  |  (se base sur les requests, pas les limits)     |
  +-------------------------------------------------+
</div>
<p>Pour voir la consommation réelle des Pods :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Voir la consommation CPU et mémoire des Pods</span>
<span class="hl-cmd">$ kubectl top pods</span>

<span class="hl-comment"># Voir la consommation des noeuds</span>
<span class="hl-cmd">$ kubectl top nodes</span>

<span class="hl-comment"># Activer le metrics-server sur minikube si nécessaire</span>
<span class="hl-cmd">$ minikube addons enable metrics-server</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Bonne pratique : toujours définir des requests et limits pour chaque conteneur. En l'absence de requests, le scheduler ne peut pas prendre de bonnes décisions. En l'absence de limits, un conteneur défaillant peut consommer toutes les ressources du noeud et impacter les autres applications.</div>`
    }
  ],
  exercises: [
    {
      title: "Créer un Job qui compte jusqu'à 10",
      desc: "Crée un Job Kubernetes qui lance un conteneur comptant de 1 à 10, puis vérifie qu'il se termine avec succès.",
      steps: [
        "Crée un fichier <code>job-compteur.yaml</code> avec un Job nommé <code>compteur</code> utilisant l'image <code>busybox</code>",
        "La commande du conteneur doit être : <code>[\"sh\", \"-c\", \"for i in $(seq 1 10); do echo Compteur: $i; sleep 1; done\"]</code>",
        "Configure <code>backoffLimit: 3</code> et <code>restartPolicy: Never</code>",
        "Applique le fichier : <code>kubectl apply -f job-compteur.yaml</code>",
        "Surveille l'exécution : <code>kubectl get jobs -w</code>",
        "Attends que le Job soit terminé (colonne COMPLETIONS passe à 1/1)",
        "Consulte les logs du Pod créé par le Job : <code>kubectl logs job/compteur</code>",
        "Vérifie le statut du Pod : <code>kubectl get pods</code> (il doit être en status Completed)",
        "Nettoie : <code>kubectl delete job compteur</code>"
      ],
      validation: "Les logs doivent afficher 'Compteur: 1' jusqu'à 'Compteur: 10'. Le Job doit montrer COMPLETIONS 1/1 et le Pod doit être en status Completed.",
      hint: "N'oublie pas que le <code>restartPolicy</code> pour un Job doit être <code>Never</code> ou <code>OnFailure</code>. Si tu utilises <code>Always</code>, Kubernetes refusera de créer le Job."
    },
    {
      title: "Ajouter des probes de santé à un Deployment",
      desc: "Déploie nginx avec des probes liveness et readiness, puis observe le comportement quand une probe échoue.",
      steps: [
        "Crée un fichier <code>deploy-probes.yaml</code> avec un Deployment nommé <code>web-sain</code> (1 réplica, image <code>nginx:1.27</code>)",
        "Ajoute une <code>livenessProbe</code> de type httpGet sur le path <code>/</code> port 80, avec <code>initialDelaySeconds: 5</code> et <code>periodSeconds: 5</code>",
        "Ajoute une <code>readinessProbe</code> de type tcpSocket sur le port 80, avec <code>initialDelaySeconds: 3</code> et <code>periodSeconds: 3</code>",
        "Applique : <code>kubectl apply -f deploy-probes.yaml</code>",
        "Vérifie que le Pod est Ready (1/1) : <code>kubectl get pods</code>",
        "Inspecte les événements des probes : <code>kubectl describe pod -l app=web-sain</code>",
        "Maintenant, modifie la livenessProbe pour pointer vers <code>/chemin-inexistant</code> et réapplique",
        "Observe les redémarrages : <code>kubectl get pods -w</code> (la colonne RESTARTS va augmenter)",
        "Vérifie les événements : <code>kubectl describe pod -l app=web-sain</code> et cherche les messages d'échec de la liveness probe"
      ],
      validation: "Quand la livenessProbe pointe vers un chemin valide, le Pod est stable. Quand elle pointe vers un chemin inexistant, le conteneur est redémarré automatiquement (RESTARTS augmente).",
      hint: "La livenessProbe de type httpGet considère tout code HTTP entre 200 et 399 comme un succès. Un 404 est un échec qui provoque le redémarrage du conteneur."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande pour lister tous les Jobs du namespace courant ?",
      answers: ["kubectl get jobs", "kubectl get job"]
    },
    {
      prompt: "Quelle commande pour lister tous les CronJobs du namespace courant ?",
      answers: ["kubectl get cronjobs", "kubectl get cronjob", "kubectl get cj"]
    },
    {
      prompt: "Quelle commande pour lister tous les DaemonSets dans tous les namespaces ?",
      answers: ["kubectl get daemonsets -A", "kubectl get daemonsets --all-namespaces", "kubectl get ds -A", "kubectl get ds --all-namespaces"]
    },
    {
      prompt: "Quelle commande pour voir la consommation CPU et mémoire des Pods ?",
      answers: ["kubectl top pods", "kubectl top pod"]
    }
  ],
  quiz: [
    {
      question: "Quelle est la principale différence entre un Deployment et un StatefulSet ?",
      options: [
        "Le Deployment est plus rapide à déployer",
        "Le StatefulSet fournit des identités stables, du stockage persistant par réplica et un déploiement ordonné",
        "Le StatefulSet ne supporte pas les rolling updates",
        "Le Deployment ne peut pas utiliser de volumes"
      ],
      correct: 1,
      explanation: "Un StatefulSet garantit des noms de Pods stables (pod-0, pod-1...), un PVC par réplica qui persiste même après suppression du Pod, et un déploiement/suppression ordonnés. Un Deployment traite les Pods comme interchangeables."
    },
    {
      question: "Que fait un DaemonSet ?",
      options: [
        "Il crée un nombre fixe de réplicas répartis aléatoirement",
        "Il garantit qu'un Pod tourne sur chaque noeud du cluster",
        "Il exécute une tâche périodique selon un planning cron",
        "Il gère les secrets et la configuration du cluster"
      ],
      correct: 1,
      explanation: "Un DaemonSet s'assure qu'une copie du Pod tourne sur chaque noeud (ou un sous-ensemble). Quand un noeud est ajouté au cluster, le Pod est automatiquement déployé dessus. C'est idéal pour les agents de monitoring, les collecteurs de logs, etc."
    },
    {
      question: "Que se passe-t-il quand une livenessProbe échoue ?",
      options: [
        "Le Pod est supprimé définitivement du cluster",
        "Le conteneur est redémarré par kubelet",
        "Le Pod est retiré du Service mais continue de tourner",
        "Rien, c'est juste un avertissement dans les logs"
      ],
      correct: 1,
      explanation: "Quand la livenessProbe échoue (après failureThreshold tentatives consécutives), kubelet redémarre le conteneur. C'est différent de la readinessProbe qui retire le Pod du trafic sans le redémarrer."
    },
    {
      question: "Quelle est la différence entre requests et limits pour les ressources ?",
      options: [
        "Requests est le maximum, limits est le minimum",
        "Requests est le minimum garanti (scheduling), limits est le maximum autorisé (enforcement)",
        "Requests concerne uniquement le CPU, limits concerne uniquement la mémoire",
        "Il n'y a pas de différence, les deux termes sont interchangeables"
      ],
      correct: 1,
      explanation: "Les requests sont le minimum garanti : Kubernetes les utilise pour décider sur quel noeud placer le Pod. Les limits sont le maximum autorisé : dépasser la limite mémoire provoque un OOMKill, dépasser la limite CPU provoque du throttling."
    },
    {
      question: "Quelle restartPolicy est valide pour un Job ?",
      options: [
        "Always (la valeur par défaut des Pods)",
        "Never ou OnFailure uniquement",
        "Restart ou Retry",
        "OnSuccess ou OnFailure"
      ],
      correct: 1,
      explanation: "Un Job doit utiliser restartPolicy Never (le Pod terminé n'est pas relancé) ou OnFailure (le Pod est relancé uniquement en cas d'échec). La valeur Always (défaut pour les Pods normaux) n'est pas autorisée car un Job est censé se terminer."
    }
  ]
},

{
  id: 9,
  title: "Ingress et Routage",
  desc: "Router le trafic HTTP vers tes Services avec Ingress et découvrir la Gateway API",
  objectives: [
    "Comprendre pourquoi l'Ingress est nécessaire (vs NodePort et LoadBalancer)",
    "Installer et configurer le contrôleur Ingress nginx sur minikube",
    "Créer des règles Ingress par path et par host, avec TLS/HTTPS",
    "Découvrir la Gateway API, le successeur moderne d'Ingress"
  ],
  sections: [
    {
      title: "Le besoin d'un Ingress",
      content: `<p>Tu connais déjà les Services (module 4). Un Service de type <strong>ClusterIP</strong> n'est accessible qu'à l'intérieur du cluster. Un <strong>NodePort</strong> expose un port sur chaque noeud (entre 30000 et 32767), mais c'est peu pratique en production. Un <strong>LoadBalancer</strong> crée un point d'entrée externe, mais chaque Service a besoin de sa propre adresse IP publique.</p>
<p>Imagine 20 microservices, chacun avec son LoadBalancer. Cela fait 20 adresses IP publiques et 20 load balancers à payer chez ton fournisseur cloud. C'est coûteux et difficile à gérer.</p>
<div class="diagram">
  Sans Ingress (1 LoadBalancer par service) :

  <span class="d-accent">Internet</span>
     |         |         |
  [LB $$$]  [LB $$$]  [LB $$$]
     |         |         |
  Service A Service B Service C


  Avec Ingress (1 seul point d'entrée) :

  <span class="d-accent">Internet</span>
       |
  [ <span class="d-accent">Ingress Controller</span> ]
    /api    /web    /admin
     |        |        |
  Service A Service B Service C
</div>
<p><strong>Ingress</strong> résout ce problème en centralisant le routage HTTP/HTTPS. Un seul point d'entrée redirige le trafic vers les bons Services en fonction de l'URL ou du nom de domaine.</p>
<p>L'Ingress fonctionne au <strong>niveau 7 du modèle OSI</strong> (couche application / HTTP). Il peut inspecter les headers HTTP, l'URL, le nom de domaine pour prendre ses décisions de routage. C'est la grande différence avec un LoadBalancer classique qui opère au niveau 4 (TCP/UDP) et ne comprend pas le contenu des requêtes.</p>
<p>L'Ingress se compose de deux éléments :</p>
<ul>
<li><strong>Ingress Controller</strong> : le reverse proxy (nginx, Traefik, HAProxy) qui fait le travail réel de routage. Il faut l'installer une fois dans le cluster</li>
<li><strong>Ressource Ingress</strong> : le fichier YAML qui définit les règles de routage. Tu en crées une par application ou groupe d'applications</li>
</ul>
<div class="info-box note">L'Ingress Controller n'est <strong>pas</strong> installé par défaut dans Kubernetes. C'est un composant additionnel à déployer. Contrairement aux Services ClusterIP ou NodePort qui fonctionnent nativement, tu dois installer un controller avant de pouvoir utiliser des ressources Ingress.</div>`
    },
    {
      title: "Installer le contrôleur Ingress sur minikube",
      content: `<p>minikube fournit un addon pour installer l'Ingress Controller nginx en une seule commande :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Activer l'addon Ingress</span>
<span class="hl-cmd">$ minikube addons enable ingress</span>

<span class="hl-comment"># Vérifier que le controller tourne</span>
<span class="hl-cmd">$ kubectl get pods -n ingress-nginx</span>

<span class="hl-comment"># Attendre que tout soit prêt (peut prendre 1-2 minutes)</span>
<span class="hl-cmd">$ kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Tu devrais voir un Pod <code>ingress-nginx-controller-XXXXX</code> en status Running. Ce Pod est un reverse proxy nginx qui va recevoir tout le trafic entrant et le router vers les bons Services selon les règles Ingress que tu définis.</p>
<p>En production, le déploiement d'un Ingress Controller se fait généralement avec Helm :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Installation en production avec Helm</span>
<span class="hl-cmd">$ helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx</span>
<span class="hl-cmd">$ helm install ingress-nginx ingress-nginx/ingress-nginx</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Pour accéder aux services exposés via Ingress sur minikube, tu as besoin de l'IP de minikube. Récupère-la avec <code>minikube ip</code>. Sur macOS avec le driver Docker, tu devras utiliser <code>minikube tunnel</code> dans un terminal séparé pour que le routage fonctionne.</div>`
    },
    {
      title: "Règles Ingress : routage par path et par host",
      content: `<p>Une ressource Ingress définit des <strong>règles de routage</strong>. Chaque règle associe un chemin (path) ou un nom de domaine (host) à un Service backend.</p>
<h3>Routage par path</h3>
<p>Envoyer <code>/api</code> vers le service API et <code>/</code> vers le frontend :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Ingress</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-ingress</span>
  <span class="hl-key">annotations</span>:
    <span class="hl-key">nginx.ingress.kubernetes.io/rewrite-target</span>: <span class="hl-str">/</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">ingressClassName</span>: <span class="hl-str">nginx</span>
  <span class="hl-key">rules</span>:
  - <span class="hl-key">host</span>: <span class="hl-str">monapp.local</span>
    <span class="hl-key">http</span>:
      <span class="hl-key">paths</span>:
      - <span class="hl-key">path</span>: <span class="hl-str">/api</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">Prefix</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">api-svc</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">3000</span>
      - <span class="hl-key">path</span>: <span class="hl-str">/</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">Prefix</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">frontend-svc</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<p><code>pathType</code> peut être :</p>
<ul>
<li><code>Prefix</code> : correspond à tout ce qui commence par le path (<code>/api</code> correspond à <code>/api</code>, <code>/api/users</code>, <code>/api/v2</code>)</li>
<li><code>Exact</code> : correspond uniquement au path exact (<code>/api</code> correspond à <code>/api</code> mais PAS à <code>/api/users</code>)</li>
</ul>
<h3>Routage par host (multi-domaine)</h3>
<p>Envoyer chaque domaine vers un service différent :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Ingress</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">multi-host-ingress</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">ingressClassName</span>: <span class="hl-str">nginx</span>
  <span class="hl-key">rules</span>:
  - <span class="hl-key">host</span>: <span class="hl-str">app.example.com</span>
    <span class="hl-key">http</span>:
      <span class="hl-key">paths</span>:
      - <span class="hl-key">path</span>: <span class="hl-str">/</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">Prefix</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">app-svc</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">80</span>
  - <span class="hl-key">host</span>: <span class="hl-str">api.example.com</span>
    <span class="hl-key">http</span>:
      <span class="hl-key">paths</span>:
      - <span class="hl-key">path</span>: <span class="hl-str">/</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">Prefix</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">api-svc</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">3000</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>TLS / HTTPS</h3>
<p>Pour activer HTTPS, crée un Secret TLS contenant le certificat et la clé privée, puis référence-le dans l'Ingress :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Créer un certificat auto-signé pour les tests</span>
<span class="hl-cmd">$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout tls.key -out tls.crt \
  -subj "/CN=monapp.local"</span>

<span class="hl-comment"># Créer le Secret TLS dans Kubernetes</span>
<span class="hl-cmd">$ kubectl create secret tls monapp-tls <span class="hl-flag">--cert</span>=tls.crt <span class="hl-flag">--key</span>=tls.key</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Ajouter la section tls dans la spec de l'Ingress</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">tls</span>:
  - <span class="hl-key">hosts</span>:
    - <span class="hl-str">monapp.local</span>
    <span class="hl-key">secretName</span>: <span class="hl-str">monapp-tls</span>
  <span class="hl-key">rules</span>:
  - <span class="hl-key">host</span>: <span class="hl-str">monapp.local</span>
    <span class="hl-key">http</span>:
      <span class="hl-key">paths</span>:
      - <span class="hl-key">path</span>: <span class="hl-str">/</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">Prefix</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">frontend-svc</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">En production, utilise <strong>cert-manager</strong> pour générer et renouveler automatiquement les certificats Let's Encrypt. C'est devenu le standard dans l'écosystème Kubernetes. Tu n'auras plus jamais à créer de certificats manuellement.</div>`
    },
    {
      title: "Gateway API : le successeur d'Ingress",
      content: `<p>L'Ingress API a été le standard pendant des années, mais elle a des limitations importantes : peu de fonctionnalités natives (TLS avancé, redirections, rate limiting reposent sur des annotations spécifiques au controller), pas de séparation claire des responsabilités entre l'admin infrastructure et le développeur.</p>
<p>La <strong>Gateway API</strong> est le successeur officiel. Elle est plus expressive, plus portable entre controllers, et mieux structurée. Depuis Kubernetes 1.31, elle est <strong>GA</strong> (Generally Available) et recommandée pour les nouveaux projets.</p>
<div class="diagram">
  <span class="d-accent">Gateway API</span> -- Séparation des responsabilités

  Admin infrastructure          Développeur
         |                              |
         v                              v
  +--------------+              +---------------+
  | GatewayClass |              |   HTTPRoute   |
  | (type de LB) |              | (règles HTTP) |
  +--------------+              +---------------+
         |                              |
         v                              |
  +--------------+                      |
  |   Gateway    | <--------------------+
  | (le listener)|
  +--------------+
         |
    [Trafic entrant]
</div>
<p>Les trois ressources principales :</p>
<ul>
<li><strong>GatewayClass</strong> : définit le type de controller (similaire à <code>ingressClassName</code>). Créé par l'admin d'infrastructure</li>
<li><strong>Gateway</strong> : définit les points d'entrée (ports, protocoles, TLS). Créé par l'admin du cluster</li>
<li><strong>HTTPRoute</strong> : définit les règles de routage HTTP. Créé par le développeur de l'application</li>
</ul>
<div class="code-block"><pre><code><span class="hl-comment"># Installer les CRDs de Gateway API</span>
<span class="hl-cmd">$ kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Exemple de Gateway</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">gateway.networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Gateway</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-gateway</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">gatewayClassName</span>: <span class="hl-str">nginx</span>
  <span class="hl-key">listeners</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">http</span>
    <span class="hl-key">port</span>: <span class="hl-num">80</span>
    <span class="hl-key">protocol</span>: <span class="hl-str">HTTP</span>
    <span class="hl-key">hostname</span>: <span class="hl-str">"*.example.com"</span>
---
<span class="hl-comment"># Exemple de HTTPRoute</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">gateway.networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">HTTPRoute</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-route</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">parentRefs</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">mon-gateway</span>
  <span class="hl-key">hostnames</span>:
  - <span class="hl-str">app.example.com</span>
  <span class="hl-key">rules</span>:
  - <span class="hl-key">matches</span>:
    - <span class="hl-key">path</span>:
        <span class="hl-key">type</span>: <span class="hl-str">PathPrefix</span>
        <span class="hl-key">value</span>: <span class="hl-str">/api</span>
    <span class="hl-key">backendRefs</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">api-svc</span>
      <span class="hl-key">port</span>: <span class="hl-num">3000</span>
  - <span class="hl-key">matches</span>:
    - <span class="hl-key">path</span>:
        <span class="hl-key">type</span>: <span class="hl-str">PathPrefix</span>
        <span class="hl-key">value</span>: <span class="hl-str">/</span>
    <span class="hl-key">backendRefs</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">frontend-svc</span>
      <span class="hl-key">port</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<p>La Gateway API apporte plusieurs avantages par rapport à Ingress :</p>
<ul>
<li><strong>Portabilité</strong> : les fonctionnalités sont dans la spec elle-même, pas dans des annotations spécifiques au controller</li>
<li><strong>Séparation des rôles</strong> : l'admin gère l'infrastructure (Gateway), le développeur gère le routage (HTTPRoute)</li>
<li><strong>Expressivité</strong> : support natif des redirections, du mirroring, du poids (traffic splitting), des filtres de headers</li>
</ul>
<div class="info-box warning">La Gateway API est plus récente et tous les controllers ne la supportent pas encore pleinement. Pour l'examen CKA, tu dois connaître les deux (Ingress et Gateway API). En pratique, les deux coexistent dans beaucoup de clusters pendant la transition.</div>`
    }
  ],
  exercises: [
    {
      title: "Installer nginx-ingress et créer une règle Ingress",
      desc: "Mets en place un Ingress Controller et route le trafic vers deux services différents selon le path URL.",
      steps: [
        "Active l'Ingress Controller : <code>minikube addons enable ingress</code>",
        "Attends qu'il soit prêt : <code>kubectl get pods -n ingress-nginx -w</code>",
        "Crée un Deployment web : <code>kubectl create deployment web --image=nginx --port=80</code>",
        "Crée un Deployment api : <code>kubectl create deployment api --image=hashicorp/http-echo -- -text='API OK'</code>",
        "Expose les deux en Services : <code>kubectl expose deployment web --port=80</code> et <code>kubectl expose deployment api --port=5678</code>",
        "Crée un fichier <code>ingress.yaml</code> avec un Ingress qui route <code>/</code> vers web (port 80) et <code>/api</code> vers api (port 5678), sur le host <code>test.local</code>, avec <code>ingressClassName: nginx</code>",
        "Applique : <code>kubectl apply -f ingress.yaml</code>",
        "Vérifie l'Ingress : <code>kubectl get ingress</code> et <code>kubectl describe ingress app-ingress</code>",
        "Ajoute l'entrée dans /etc/hosts : <code>echo \"$(minikube ip) test.local\" | sudo tee -a /etc/hosts</code>",
        "Teste : <code>curl http://test.local/</code> (doit afficher la page nginx) et <code>curl http://test.local/api</code> (doit afficher 'API OK')"
      ],
      validation: "http://test.local/ doit afficher la page par défaut de nginx et http://test.local/api doit afficher 'API OK'. La commande <code>kubectl get ingress</code> doit montrer ton Ingress avec une adresse assignée.",
      hint: "Sur macOS avec le driver Docker, utilise <code>minikube tunnel</code> dans un autre terminal. L'IP sera alors 127.0.0.1. N'oublie pas <code>ingressClassName: nginx</code> dans la spec."
    },
    {
      title: "Configurer un routage par host (multi-domaine)",
      desc: "Configure un Ingress avec plusieurs noms de domaine qui pointent chacun vers un service différent.",
      steps: [
        "Réutilise les Deployments web et api de l'exercice précédent (ou recrée-les)",
        "Crée un fichier <code>multi-host.yaml</code> avec un Ingress contenant deux règles host : <code>web.local</code> vers le service web (port 80) et <code>api.local</code> vers le service api (port 5678)",
        "Applique : <code>kubectl apply -f multi-host.yaml</code>",
        "Ajoute les entrées dans /etc/hosts : <code>echo \"$(minikube ip) web.local api.local\" | sudo tee -a /etc/hosts</code>",
        "Teste les deux domaines : <code>curl http://web.local</code> et <code>curl http://api.local</code>",
        "Vérifie les détails du routage : <code>kubectl describe ingress multi-host-ingress</code>"
      ],
      validation: "Chaque domaine doit router vers le bon service. web.local affiche la page nginx, api.local affiche 'API OK'.",
      hint: "Chaque règle dans l'Ingress a son propre champ <code>host</code>. Les deux règles sont dans le même objet Ingress mais avec des hosts différents."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande pour lister toutes les ressources Ingress du namespace courant ?",
      answers: ["kubectl get ingress", "kubectl get ing"]
    },
    {
      prompt: "Quelle commande pour afficher les détails d'un Ingress nommé 'app-ingress' ?",
      answers: ["kubectl describe ingress app-ingress", "kubectl describe ing app-ingress"]
    },
    {
      prompt: "Quelle commande pour activer l'Ingress Controller nginx sur minikube ?",
      answers: ["minikube addons enable ingress"]
    }
  ],
  quiz: [
    {
      question: "Quelle est la principale différence entre un Service LoadBalancer et un Ingress ?",
      options: [
        "Le LoadBalancer est gratuit, l'Ingress est payant",
        "Le LoadBalancer opère au niveau TCP (L4), l'Ingress au niveau HTTP (L7)",
        "L'Ingress est plus rapide que le LoadBalancer",
        "Le LoadBalancer supporte TLS, pas l'Ingress"
      ],
      correct: 1,
      explanation: "Un Service LoadBalancer travaille au niveau TCP (couche 4) : il route le trafic sans comprendre le contenu des requêtes. Un Ingress travaille au niveau HTTP (couche 7) : il peut router selon l'URL, le hostname, les headers, et gérer la terminaison TLS."
    },
    {
      question: "Que faut-il installer dans le cluster avant de créer des ressources Ingress ?",
      options: [
        "Un plugin CNI comme Calico",
        "Un Ingress Controller (nginx, Traefik, etc.)",
        "cert-manager pour les certificats",
        "CoreDNS pour la résolution de noms"
      ],
      correct: 1,
      explanation: "Les ressources Ingress sont juste des règles de configuration. Sans Ingress Controller (nginx, Traefik, etc.) installé dans le cluster, ces règles n'ont aucun effet. L'Ingress Controller est le composant qui lit ces règles et les applique."
    },
    {
      question: "Quelles sont les trois ressources principales de la Gateway API ?",
      options: [
        "Gateway, Service, Endpoint",
        "GatewayClass, Gateway, HTTPRoute",
        "Ingress, IngressClass, IngressRoute",
        "Route, RouteRule, RouteBinding"
      ],
      correct: 1,
      explanation: "La Gateway API utilise GatewayClass (type de controller), Gateway (point d'entrée avec listeners pour les ports et protocoles) et HTTPRoute (règles de routage HTTP). Cette séparation permet une meilleure gestion des responsabilités entre équipes."
    },
    {
      question: "Quelle valeur de pathType correspond à /api, /api/users et /api/v2 ?",
      options: [
        "Exact",
        "Prefix",
        "Wildcard",
        "Regex"
      ],
      correct: 1,
      explanation: "pathType Prefix correspond à tous les chemins qui commencent par le path spécifié. /api correspond donc à /api, /api/users, /api/v2/orders, etc. Exact ne correspondrait qu'à /api exactement, sans rien après."
    }
  ]
},

{
  id: 10,
  title: "Sécurité du cluster",
  desc: "RBAC, ServiceAccounts, Network Policies et SecurityContext pour sécuriser ton cluster",
  objectives: [
    "Comprendre et configurer le RBAC (Roles, ClusterRoles, RoleBindings, ClusterRoleBindings)",
    "Créer des ServiceAccounts avec des permissions limitées",
    "Isoler le trafic réseau avec les Network Policies",
    "Renforcer la sécurité des Pods avec SecurityContext"
  ],
  sections: [
    {
      title: "RBAC : qui peut faire quoi ?",
      content: `<p><strong>RBAC</strong> (Role-Based Access Control) est le système d'autorisation de Kubernetes. Il contrôle <strong>qui</strong> (utilisateur, groupe, ServiceAccount) peut faire <strong>quoi</strong> (get, create, delete) sur <strong>quelles ressources</strong> (pods, services, secrets).</p>
<p>RBAC repose sur 4 objets, organisés selon deux portées :</p>
<div class="diagram">
  <span class="d-accent">Portée Namespace</span>                    <span class="d-accent">Portée Cluster</span>

  +----------+   +---------------+     +--------------+   +--------------------+
  |   Role   |   |  RoleBinding  |     | ClusterRole  |   | ClusterRoleBinding |
  | (perms)  |-->| (qui + rôle)  |     |   (perms)    |-->|   (qui + rôle)     |
  +----------+   +---------------+     +--------------+   +--------------------+
  Dans un                              Dans tout
  namespace                            le cluster
</div>
<ul>
<li><strong>Role</strong> : définit des permissions dans un namespace spécifique (ex : lire les Pods du namespace "dev")</li>
<li><strong>ClusterRole</strong> : définit des permissions à l'échelle du cluster entier, ou sur des ressources non-namespacées (ex : les nodes)</li>
<li><strong>RoleBinding</strong> : lie un Role (ou ClusterRole) à un utilisateur/groupe/ServiceAccount dans un namespace</li>
<li><strong>ClusterRoleBinding</strong> : lie un ClusterRole à un utilisateur/groupe/ServiceAccount dans tout le cluster</li>
</ul>
<h3>Créer un Role</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">rbac.authorization.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Role</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">lecture-pods</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">dev</span>
<span class="hl-key">rules</span>:
- <span class="hl-key">apiGroups</span>: [<span class="hl-str">""</span>]              <span class="hl-comment"># "" = core API group (pods, services, configmaps)</span>
  <span class="hl-key">resources</span>: [<span class="hl-str">"pods"</span>, <span class="hl-str">"pods/log"</span>]
  <span class="hl-key">verbs</span>: [<span class="hl-str">"get"</span>, <span class="hl-str">"list"</span>, <span class="hl-str">"watch"</span>]</code></pre><button class="copy-btn">Copier</button></div>
<p>Les <strong>verbs</strong> possibles sont : <code>get</code>, <code>list</code>, <code>watch</code>, <code>create</code>, <code>update</code>, <code>patch</code>, <code>delete</code>. L'<strong>apiGroup</strong> <code>""</code> correspond au core API group (pods, services, configmaps...). Pour les Deployments, ce serait <code>"apps"</code>. Pour les Ingress, ce serait <code>"networking.k8s.io"</code>.</p>
<h3>Créer un RoleBinding</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">rbac.authorization.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">RoleBinding</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">lecture-pods-binding</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">dev</span>
<span class="hl-key">subjects</span>:
- <span class="hl-key">kind</span>: <span class="hl-str">ServiceAccount</span>
  <span class="hl-key">name</span>: <span class="hl-str">mon-app</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">dev</span>
<span class="hl-key">roleRef</span>:
  <span class="hl-key">kind</span>: <span class="hl-str">Role</span>
  <span class="hl-key">name</span>: <span class="hl-str">lecture-pods</span>
  <span class="hl-key">apiGroup</span>: <span class="hl-str">rbac.authorization.k8s.io</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Équivalent en mode impératif</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Créer le Role</span>
<span class="hl-cmd">$ kubectl create role lecture-pods <span class="hl-flag">--verb</span>=get,list,watch <span class="hl-flag">--resource</span>=pods,pods/log -n dev</span>

<span class="hl-comment"># Créer le RoleBinding</span>
<span class="hl-cmd">$ kubectl create rolebinding lecture-pods-binding <span class="hl-flag">--role</span>=lecture-pods <span class="hl-flag">--serviceaccount</span>=dev:mon-app -n dev</span>

<span class="hl-comment"># Tester les permissions</span>
<span class="hl-cmd">$ kubectl auth can-i get pods -n dev <span class="hl-flag">--as</span>=system:serviceaccount:dev:mon-app</span>
<span class="hl-comment"># Résultat attendu : yes</span>

<span class="hl-cmd">$ kubectl auth can-i delete pods -n dev <span class="hl-flag">--as</span>=system:serviceaccount:dev:mon-app</span>
<span class="hl-comment"># Résultat attendu : no</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note"><strong>Principe du moindre privilège</strong> : toujours donner le minimum de permissions nécessaires. Un ServiceAccount qui n'a besoin que de lire les Pods ne devrait pas pouvoir les supprimer. C'est une règle fondamentale de sécurité.</div>`
    },
    {
      title: "ServiceAccounts",
      content: `<p>Un <strong>ServiceAccount</strong> est une identité pour les processus qui tournent dans un Pod. Par défaut, chaque Pod utilise le ServiceAccount <code>default</code> du namespace, qui a des permissions très limitées.</p>
<p>Quand une application a besoin d'interagir avec l'API Kubernetes (lister des Pods, lire des ConfigMaps, créer des Deployments...), tu crées un ServiceAccount dédié avec les permissions exactes nécessaires.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Créer un ServiceAccount</span>
<span class="hl-cmd">$ kubectl create serviceaccount mon-app -n dev</span>

<span class="hl-comment"># Voir les ServiceAccounts d'un namespace</span>
<span class="hl-cmd">$ kubectl get serviceaccounts -n dev</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Associer un ServiceAccount à un Pod</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">app-securisee</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">dev</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">serviceAccountName</span>: <span class="hl-str">mon-app</span>
  <span class="hl-key">automountServiceAccountToken</span>: <span class="hl-bool">true</span>
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">bitnami/kubectl:latest</span>
    <span class="hl-key">command</span>: [<span class="hl-str">"sleep"</span>, <span class="hl-str">"3600"</span>]</code></pre><button class="copy-btn">Copier</button></div>
<p>Le token du ServiceAccount est automatiquement monté dans le Pod à l'emplacement <code>/var/run/secrets/kubernetes.io/serviceaccount/token</code>. L'application utilise ce token pour s'authentifier auprès de l'API Server.</p>
<p>Le workflow complet pour donner des permissions à un Pod :</p>
<div class="diagram">
  1. Créer le <span class="d-accent">ServiceAccount</span>
                |
  2. Créer le <span class="d-accent">Role</span> (les permissions)
                |
  3. Créer le <span class="d-accent">RoleBinding</span> (lier le SA au Role)
                |
  4. Assigner le SA au Pod via <span class="d-accent">serviceAccountName</span>
                |
  5. Le Pod peut maintenant appeler l'API Kubernetes
     avec les permissions du Role
</div>
<div class="info-box tip">Pour les Pods qui n'ont <strong>pas besoin</strong> de parler à l'API Kubernetes (la majorité des applications web), mets <code>automountServiceAccountToken: false</code>. Cela réduit la surface d'attaque : si le Pod est compromis, l'attaquant n'aura pas de token pour interagir avec l'API.</div>`
    },
    {
      title: "Network Policies : isoler le trafic réseau",
      content: `<p>Par défaut, dans Kubernetes, <strong>tous les Pods peuvent communiquer avec tous les autres Pods</strong>, quel que soit le namespace. C'est pratique pour commencer, mais c'est un problème de sécurité majeur en production.</p>
<p>Les <strong>Network Policies</strong> permettent de contrôler quel trafic réseau est autorisé, au niveau des Pods. C'est comme un pare-feu intégré au cluster.</p>
<div class="diagram">
  Sans Network Policy :

  [Pod A] <-------> [Pod B] <-------> [Pod C]
  Tout le monde parle à tout le monde


  Avec Network Policy :

  [Frontend] -------> [API] -------> [Database]
       X                        X
  [Frontend] ---X---> [Database]    Accès direct bloqué !
</div>
<div class="info-box warning">Les Network Policies ne fonctionnent que si le plugin CNI (réseau) les supporte. <strong>Calico</strong>, <strong>Cilium</strong> et <strong>Weave</strong> les supportent. <strong>Flannel ne les supporte pas</strong>. Sur minikube, active Calico avec <code>minikube start --cni=calico</code>.</div>
<h3>Politique Ingress (trafic entrant)</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">NetworkPolicy</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">api-allow-frontend</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">default</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">podSelector</span>:             <span class="hl-comment"># À qui s'applique cette politique ?</span>
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">api</span>             <span class="hl-comment"># Aux Pods avec le label app=api</span>
  <span class="hl-key">policyTypes</span>:
  - <span class="hl-str">Ingress</span>                <span class="hl-comment"># On contrôle le trafic entrant</span>
  <span class="hl-key">ingress</span>:
  - <span class="hl-key">from</span>:                  <span class="hl-comment"># Qui est autorisé ?</span>
    - <span class="hl-key">podSelector</span>:
        <span class="hl-key">matchLabels</span>:
          <span class="hl-key">app</span>: <span class="hl-str">frontend</span>   <span class="hl-comment"># Seulement les Pods app=frontend</span>
    <span class="hl-key">ports</span>:
    - <span class="hl-key">protocol</span>: <span class="hl-str">TCP</span>
      <span class="hl-key">port</span>: <span class="hl-num">3000</span>           <span class="hl-comment"># Uniquement sur le port 3000</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Cette politique dit : "Les Pods avec le label <code>app: api</code> n'acceptent le trafic entrant QUE des Pods avec le label <code>app: frontend</code>, et uniquement sur le port 3000."</p>
<h3>Politique deny-all (bonne pratique)</h3>
<p>En production, la meilleure approche est de bloquer tout le trafic par défaut, puis d'autoriser explicitement ce qui est nécessaire (approche "zero trust") :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">NetworkPolicy</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">deny-all</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">podSelector</span>: {}    <span class="hl-comment"># s'applique à tous les Pods du namespace</span>
  <span class="hl-key">policyTypes</span>:
  - <span class="hl-str">Ingress</span>
  - <span class="hl-str">Egress</span>
  <span class="hl-comment"># Pas de règles ingress/egress = tout est bloqué</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Autoriser le trafic entre namespaces</h3>
<p>Tu peux combiner <code>namespaceSelector</code> et <code>podSelector</code> pour autoriser le trafic venant d'un autre namespace :</p>
<div class="code-block"><pre><code><span class="hl-key">ingress</span>:
- <span class="hl-key">from</span>:
  - <span class="hl-key">namespaceSelector</span>:
      <span class="hl-key">matchLabels</span>:
        <span class="hl-key">kubernetes.io/metadata.name</span>: <span class="hl-str">monitoring</span>
    <span class="hl-key">podSelector</span>:
      <span class="hl-key">matchLabels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">prometheus</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Ici on autorise uniquement les Pods avec le label <code>app: prometheus</code> du namespace <code>monitoring</code> à envoyer du trafic vers les Pods protégés.</p>
<div class="info-box note">Attention à la syntaxe YAML : quand <code>namespaceSelector</code> et <code>podSelector</code> sont au même niveau dans un élément <code>from</code> (sans tiret séparateur), c'est un ET logique. Si tu mets un tiret devant chacun, c'est un OU logique. Cette subtilité est un piège classique de l'examen CKA.</div>`
    },
    {
      title: "SecurityContext : renforcer la sécurité des Pods",
      content: `<p>Le <strong>SecurityContext</strong> permet de définir des paramètres de sécurité au niveau du Pod ou du conteneur. L'objectif est de limiter ce que le conteneur peut faire sur le système hôte, selon le principe du moindre privilège.</p>
<h3>Les paramètres les plus importants</h3>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">pod-securise</span>
<span class="hl-key">spec</span>:
  <span class="hl-comment"># SecurityContext au niveau du Pod (s'applique à tous les conteneurs)</span>
  <span class="hl-key">securityContext</span>:
    <span class="hl-key">runAsNonRoot</span>: <span class="hl-bool">true</span>        <span class="hl-comment"># interdit de tourner en root</span>
    <span class="hl-key">runAsUser</span>: <span class="hl-num">1000</span>            <span class="hl-comment"># UID de l'utilisateur</span>
    <span class="hl-key">runAsGroup</span>: <span class="hl-num">1000</span>           <span class="hl-comment"># GID du groupe</span>
    <span class="hl-key">fsGroup</span>: <span class="hl-num">2000</span>              <span class="hl-comment"># GID appliqué aux volumes montés</span>
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">app</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
    <span class="hl-comment"># SecurityContext au niveau du conteneur</span>
    <span class="hl-key">securityContext</span>:
      <span class="hl-key">allowPrivilegeEscalation</span>: <span class="hl-bool">false</span>   <span class="hl-comment"># pas d'escalade de privilèges</span>
      <span class="hl-key">readOnlyRootFilesystem</span>: <span class="hl-bool">true</span>      <span class="hl-comment"># système de fichiers en lecture seule</span>
      <span class="hl-key">capabilities</span>:
        <span class="hl-key">drop</span>:
        - <span class="hl-str">ALL</span>                             <span class="hl-comment"># retirer toutes les capabilities Linux</span>
        <span class="hl-key">add</span>:
        - <span class="hl-str">NET_BIND_SERVICE</span>               <span class="hl-comment"># ajouter juste ce qui est nécessaire</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Voici ce que fait chaque paramètre :</p>
<ul>
<li><strong>runAsNonRoot: true</strong> : empêche le conteneur de démarrer s'il tente de tourner en tant que root (UID 0). L'image Docker doit prévoir un utilisateur non-root</li>
<li><strong>readOnlyRootFilesystem: true</strong> : rend le système de fichiers racine en lecture seule. Les écritures doivent passer par des volumes explicites (<code>emptyDir</code> pour /tmp par exemple)</li>
<li><strong>allowPrivilegeEscalation: false</strong> : empêche les processus d'obtenir plus de privilèges que leur processus parent (bloque les binaires setuid)</li>
<li><strong>capabilities.drop: [ALL]</strong> : retire toutes les capabilities Linux (droits spéciaux du noyau). Puis ajoute uniquement celles qui sont nécessaires</li>
<li><strong>fsGroup</strong> : tous les fichiers créés dans les volumes montés appartiendront à ce groupe, ce qui permet aux conteneurs non-root d'y accéder</li>
</ul>
<h3>Exemple concret : nginx sécurisé</h3>
<p>Quand tu actives <code>readOnlyRootFilesystem</code>, nginx a besoin de répertoires temporaires pour écrire ses fichiers de cache et son PID :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Pod</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">nginx-securise</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">securityContext</span>:
    <span class="hl-key">runAsNonRoot</span>: <span class="hl-bool">true</span>
    <span class="hl-key">runAsUser</span>: <span class="hl-num">101</span>       <span class="hl-comment"># utilisateur nginx dans l'image officielle</span>
  <span class="hl-key">containers</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">nginx</span>
    <span class="hl-key">image</span>: <span class="hl-str">nginxinc/nginx-unprivileged:1.27</span>
    <span class="hl-key">securityContext</span>:
      <span class="hl-key">allowPrivilegeEscalation</span>: <span class="hl-bool">false</span>
      <span class="hl-key">readOnlyRootFilesystem</span>: <span class="hl-bool">true</span>
      <span class="hl-key">capabilities</span>:
        <span class="hl-key">drop</span>: [<span class="hl-str">ALL</span>]
    <span class="hl-key">ports</span>:
    - <span class="hl-key">containerPort</span>: <span class="hl-num">8080</span>
    <span class="hl-key">volumeMounts</span>:
    - <span class="hl-key">name</span>: <span class="hl-str">tmp</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/tmp</span>
    - <span class="hl-key">name</span>: <span class="hl-str">cache</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/var/cache/nginx</span>
    - <span class="hl-key">name</span>: <span class="hl-str">run</span>
      <span class="hl-key">mountPath</span>: <span class="hl-str">/var/run</span>
  <span class="hl-key">volumes</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">tmp</span>
    <span class="hl-key">emptyDir</span>: {}
  - <span class="hl-key">name</span>: <span class="hl-str">cache</span>
    <span class="hl-key">emptyDir</span>: {}
  - <span class="hl-key">name</span>: <span class="hl-str">run</span>
    <span class="hl-key">emptyDir</span>: {}</code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Vérifier sous quel utilisateur tourne le conteneur</span>
<span class="hl-cmd">$ kubectl exec nginx-securise -- id</span>
<span class="hl-comment"># uid=101(nginx) gid=101(nginx)</span>

<span class="hl-comment"># Vérifier que l'écriture sur / est impossible</span>
<span class="hl-cmd">$ kubectl exec nginx-securise -- touch /test</span>
<span class="hl-comment"># touch: /test: Read-only file system</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Utilise l'image <code>nginxinc/nginx-unprivileged</code> au lieu de l'image <code>nginx</code> officielle. Elle est préconfigurée pour tourner en tant qu'utilisateur non-root (UID 101) et écoute sur le port 8080 au lieu de 80 (les ports inférieurs à 1024 nécessitent des privilèges root).</div>`
    }
  ],
  exercises: [
    {
      title: "Créer un Role et un RoleBinding",
      desc: "Crée un ServiceAccount qui ne peut que lire les Pods d'un namespace, puis vérifie que les permissions sont correctes.",
      steps: [
        "Crée un namespace de test : <code>kubectl create namespace rbac-test</code>",
        "Crée un ServiceAccount : <code>kubectl create serviceaccount lecteur -n rbac-test</code>",
        "Crée un Role nommé 'lecture-seule' qui autorise get, list, watch sur les pods : <code>kubectl create role lecture-seule --verb=get,list,watch --resource=pods -n rbac-test</code>",
        "Crée un RoleBinding : <code>kubectl create rolebinding lecture-binding --role=lecture-seule --serviceaccount=rbac-test:lecteur -n rbac-test</code>",
        "Teste une permission autorisée : <code>kubectl auth can-i list pods -n rbac-test --as=system:serviceaccount:rbac-test:lecteur</code> (doit répondre 'yes')",
        "Teste une permission interdite : <code>kubectl auth can-i delete pods -n rbac-test --as=system:serviceaccount:rbac-test:lecteur</code> (doit répondre 'no')",
        "Teste dans un autre namespace : <code>kubectl auth can-i list pods -n default --as=system:serviceaccount:rbac-test:lecteur</code> (doit répondre 'no')",
        "Nettoie : <code>kubectl delete namespace rbac-test</code>"
      ],
      validation: "Le ServiceAccount 'lecteur' peut lire les Pods dans rbac-test (yes) mais ne peut ni les supprimer (no), ni accéder aux Pods d'un autre namespace (no).",
      hint: "Le format du --as pour un ServiceAccount est toujours <code>system:serviceaccount:NAMESPACE:NOM</code>. N'oublie pas de spécifier le namespace dans la commande can-i avec -n."
    },
    {
      title: "Créer une Network Policy",
      desc: "Isole une base de données pour qu'elle ne soit accessible que depuis l'application API.",
      steps: [
        "Démarre minikube avec Calico si ce n'est pas déjà fait : <code>minikube start --cni=calico</code>",
        "Crée trois Pods : <code>kubectl run frontend --image=nginx --labels=app=frontend</code>, <code>kubectl run api --image=nginx --labels=app=api</code>, <code>kubectl run db --image=nginx --labels=app=db --port=80</code>",
        "Expose db en Service : <code>kubectl expose pod db --port=80</code>",
        "Vérifie que tout le monde peut accéder à db : <code>kubectl exec frontend -- wget -qO- --timeout=3 db</code> (doit fonctionner)",
        "Crée un fichier <code>netpol.yaml</code> avec une NetworkPolicy nommée 'db-allow-api' qui cible les Pods <code>app=db</code> et n'autorise le trafic entrant (Ingress) que depuis les Pods <code>app=api</code> sur le port 80",
        "Applique : <code>kubectl apply -f netpol.yaml</code>",
        "Teste depuis api : <code>kubectl exec api -- wget -qO- --timeout=3 db</code> (doit fonctionner)",
        "Teste depuis frontend : <code>kubectl exec frontend -- wget -qO- --timeout=3 db</code> (doit être bloqué, timeout après 3 secondes)"
      ],
      validation: "Le Pod api peut accéder à db (la page nginx s'affiche), mais le Pod frontend en est empêché par la Network Policy (timeout).",
      hint: "Le <code>podSelector</code> de la NetworkPolicy cible les Pods à protéger (app: db). La section <code>ingress.from</code> définit qui est autorisé à leur parler (app: api)."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande pour vérifier si le ServiceAccount 'deploy-sa' dans le namespace 'prod' peut créer des Deployments ?",
      answers: [
        "kubectl auth can-i create deployments -n prod --as=system:serviceaccount:prod:deploy-sa",
        "kubectl auth can-i create deployment -n prod --as=system:serviceaccount:prod:deploy-sa"
      ]
    },
    {
      prompt: "Quelle commande pour lister les Roles du namespace courant ?",
      answers: ["kubectl get roles", "kubectl get role"]
    },
    {
      prompt: "Quelle commande pour lister les Network Policies du namespace courant ?",
      answers: ["kubectl get networkpolicies", "kubectl get networkpolicy", "kubectl get netpol"]
    },
    {
      prompt: "Quelle commande pour créer un ServiceAccount nommé 'mon-sa' dans le namespace 'dev' ?",
      answers: ["kubectl create serviceaccount mon-sa -n dev", "kubectl create sa mon-sa -n dev"]
    }
  ],
  quiz: [
    {
      question: "Quelle est la différence entre un Role et un ClusterRole ?",
      options: [
        "Un Role est plus sécurisé qu'un ClusterRole",
        "Un Role est limité à un namespace, un ClusterRole s'applique à tout le cluster",
        "Un ClusterRole ne peut être lié qu'à des ClusterRoleBindings",
        "Il n'y a aucune différence fonctionnelle"
      ],
      correct: 1,
      explanation: "Un Role définit des permissions dans un namespace spécifique. Un ClusterRole définit des permissions au niveau du cluster entier, ou sur des ressources non-namespacées comme les nodes. Un ClusterRole peut aussi être lié via un RoleBinding pour donner des permissions dans un seul namespace."
    },
    {
      question: "Par défaut, quel trafic réseau est autorisé entre les Pods ?",
      options: [
        "Aucun trafic n'est autorisé",
        "Seul le trafic dans le même namespace est autorisé",
        "Tout le trafic est autorisé entre tous les Pods",
        "Seul le trafic HTTP et HTTPS est autorisé"
      ],
      correct: 2,
      explanation: "Sans Network Policy, Kubernetes autorise tout le trafic entre tous les Pods, même entre namespaces différents. C'est pour cela qu'il est important de créer des Network Policies en production pour isoler les applications."
    },
    {
      question: "Que fait le paramètre runAsNonRoot: true dans un SecurityContext ?",
      options: [
        "Il crée automatiquement un utilisateur non-root dans le conteneur",
        "Il empêche le conteneur de démarrer s'il tente de tourner en tant que root",
        "Il désactive les commandes sudo à l'intérieur du conteneur",
        "Il active le chiffrement du système de fichiers"
      ],
      correct: 1,
      explanation: "runAsNonRoot: true empêche le conteneur de démarrer si le processus principal tente de s'exécuter en tant que root (UID 0). L'image Docker doit être configurée pour utiliser un utilisateur non-root, sinon le Pod passera en erreur CrashLoopBackOff."
    },
    {
      question: "Quel objet RBAC lie un Role à un ServiceAccount ?",
      options: [
        "RoleRef",
        "RoleBinding",
        "ServiceAccountBinding",
        "RoleLink"
      ],
      correct: 1,
      explanation: "Le RoleBinding lie un Role (les permissions) à un sujet (ServiceAccount, utilisateur ou groupe) dans un namespace. C'est le pont entre 'quoi' (le Role, les permissions) et 'qui' (le sujet, l'identité)."
    },
    {
      question: "Quelle est la bonne pratique pour les Network Policies en production ?",
      options: [
        "Ne pas en utiliser car elles ralentissent le réseau",
        "Autoriser tout par défaut et bloquer uniquement le trafic dangereux connu",
        "Bloquer tout par défaut (deny-all) puis autoriser explicitement le nécessaire",
        "N'autoriser que le trafic HTTP et HTTPS"
      ],
      correct: 2,
      explanation: "La bonne pratique est de commencer par une politique deny-all qui bloque tout le trafic entrant et sortant, puis d'ajouter des politiques spécifiques pour autoriser uniquement les communications nécessaires. C'est le principe de zero trust appliqué au réseau Kubernetes."
    }
  ]
},
{
  id: 11,
  title: "Helm et Observabilité",
  desc: "Gérer les applications avec Helm, personnaliser avec Kustomize, et maîtriser le monitoring et le troubleshooting",
  objectives: [
    "Comprendre Helm : charts, repositories, values, releases",
    "Installer, mettre à jour et annuler des déploiements avec Helm",
    "Personnaliser des manifests YAML avec Kustomize (bases et overlays)",
    "Découvrir le monitoring avec Prometheus et Grafana",
    "Appliquer une méthodologie de troubleshooting structurée avec kubectl debug"
  ],
  sections: [
    {
      title: "Helm : les bases",
      content: `<p>Déployer une application sur Kubernetes nécessite souvent de nombreux fichiers YAML : Deployment, Service, ConfigMap, Secret, Ingress, PVC... Gérer tout cela manuellement devient vite pénible. <strong>Helm</strong> est le <strong>gestionnaire de packages</strong> de Kubernetes. Il regroupe tous ces fichiers dans un <strong>chart</strong>, un package déployable et configurable en une seule commande.</p>
<p>Pense à Helm comme à <code>apt</code> pour Debian ou <code>brew</code> pour macOS, mais pour Kubernetes.</p>
<h3>Les concepts clés de Helm</h3>
<ul>
<li><strong>Chart</strong> : un package Helm contenant tous les templates YAML et les valeurs par défaut nécessaires pour déployer une application</li>
<li><strong>Release</strong> : une instance déployée d'un chart. Tu peux installer le même chart plusieurs fois avec des configurations différentes, chaque installation crée une release distincte</li>
<li><strong>Repository</strong> : un dépôt de charts, hébergé sur un serveur HTTP (comme un dépôt apt ou npm)</li>
<li><strong>Values</strong> : les paramètres personnalisables du chart (image, nombre de réplicas, ports, etc.)</li>
<li><strong>Revision</strong> : chaque mise à jour d'une release crée une nouvelle révision, ce qui permet le rollback</li>
</ul>
<div class="diagram">
            <span class="d-accent">Architecture de Helm</span>

  +------------------+       +------------------+
  |  <span class="d-accent">Chart</span>           |       |  <span class="d-accent">Repository</span>      |
  |  templates/      |       |  bitnami         |
  |  values.yaml     | &lt;---- |  prometheus-comm |
  |  Chart.yaml      |       |  jetstack        |
  +--------+---------+       +------------------+
           |
     helm install
     + values personnalisées
           |
           v
  +------------------+
  |  <span class="d-accent">Release</span>         |
  |  mon-app (v1)    |
  |  mon-app (v2)    | &lt;-- helm upgrade
  |  mon-app (v1)    | &lt;-- helm rollback
  +------------------+
</div>
<h3>Installer Helm</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Installer Helm sur macOS</span>
<span class="hl-cmd">$ brew install helm</span>

<span class="hl-comment"># Installer Helm sur Debian/Ubuntu</span>
<span class="hl-cmd">$ curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash</span>

<span class="hl-comment"># Vérifier l'installation</span>
<span class="hl-cmd">$ helm version</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Structure d'un chart</h3>
<p>Quand tu crées un chart avec <code>helm create</code>, voici la structure générée :</p>
<div class="code-block"><pre><code>mon-app/
  Chart.yaml          <span class="hl-comment"># Métadonnées du chart (nom, version, description)</span>
  values.yaml         <span class="hl-comment"># Valeurs par défaut (personnalisables à l'installation)</span>
  templates/          <span class="hl-comment"># Templates YAML avec Go templating</span>
    deployment.yaml
    service.yaml
    ingress.yaml
    _helpers.tpl      <span class="hl-comment"># Fonctions réutilisables</span>
    NOTES.txt         <span class="hl-comment"># Message affiché après installation</span>
  charts/             <span class="hl-comment"># Dépendances (sous-charts)</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Le fichier <code>Chart.yaml</code> contient les métadonnées :</p>
<div class="code-block"><pre><code><span class="hl-key">apiVersion</span>: <span class="hl-str">v2</span>
<span class="hl-key">name</span>: <span class="hl-str">mon-app</span>
<span class="hl-key">description</span>: <span class="hl-str">Un chart Helm pour mon application</span>
<span class="hl-key">type</span>: <span class="hl-str">application</span>
<span class="hl-key">version</span>: <span class="hl-str">0.1.0</span>         <span class="hl-comment"># Version du chart</span>
<span class="hl-key">appVersion</span>: <span class="hl-str">"1.0.0"</span>    <span class="hl-comment"># Version de l'application</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Le fichier <code>values.yaml</code> définit les valeurs par défaut :</p>
<div class="code-block"><pre><code><span class="hl-key">replicaCount</span>: <span class="hl-num">2</span>
<span class="hl-key">image</span>:
  <span class="hl-key">repository</span>: <span class="hl-str">nginx</span>
  <span class="hl-key">tag</span>: <span class="hl-str">"1.27"</span>
  <span class="hl-key">pullPolicy</span>: <span class="hl-str">IfNotPresent</span>
<span class="hl-key">service</span>:
  <span class="hl-key">type</span>: <span class="hl-str">ClusterIP</span>
  <span class="hl-key">port</span>: <span class="hl-num">80</span>
<span class="hl-key">resources</span>:
  <span class="hl-key">requests</span>:
    <span class="hl-key">cpu</span>: <span class="hl-str">100m</span>
    <span class="hl-key">memory</span>: <span class="hl-str">128Mi</span>
  <span class="hl-key">limits</span>:
    <span class="hl-key">cpu</span>: <span class="hl-str">250m</span>
    <span class="hl-key">memory</span>: <span class="hl-str">256Mi</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Les templates utilisent la syntaxe Go template pour injecter les valeurs :</p>
<div class="code-block"><pre><code><span class="hl-comment"># templates/deployment.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: {{ .Release.Name }}-app
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: {{ .Values.replicaCount }}
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: {{ .Release.Name }}
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: {{ .Release.Name }}
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: {{ .Chart.Name }}
        <span class="hl-key">image</span>: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: {{ .Values.service.port }}</code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note">Helm 3 (la version actuelle) ne nécessite plus de composant serveur dans le cluster (contrairement à Helm 2 qui avait Tiller). Tout se fait depuis le CLI. Les données de release sont stockées comme Secrets dans le namespace de la release.</div>`
    },
    {
      title: "Utiliser Helm",
      content: `<p>Voici le workflow complet pour utiliser Helm au quotidien : ajouter un dépôt, chercher un chart, l'installer, le personnaliser, le mettre à jour et revenir en arrière si nécessaire.</p>
<h3>Gérer les dépôts</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Ajouter un dépôt de charts</span>
<span class="hl-cmd">$ helm repo add bitnami https://charts.bitnami.com/bitnami</span>
<span class="hl-cmd">$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts</span>

<span class="hl-comment"># Mettre à jour la liste des charts disponibles</span>
<span class="hl-cmd">$ helm repo update</span>

<span class="hl-comment"># Lister les dépôts configurés</span>
<span class="hl-cmd">$ helm repo list</span>

<span class="hl-comment"># Chercher un chart dans les dépôts</span>
<span class="hl-cmd">$ helm search repo nginx</span>
<span class="hl-cmd">$ helm search repo redis</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Installer un chart</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Voir les valeurs configurables d'un chart avant de l'installer</span>
<span class="hl-cmd">$ helm show values bitnami/nginx | head -50</span>

<span class="hl-comment"># Installer un chart (crée une release)</span>
<span class="hl-cmd">$ helm install mon-nginx bitnami/nginx</span>

<span class="hl-comment"># Installer avec des valeurs personnalisées en ligne</span>
<span class="hl-cmd">$ helm install mon-nginx bitnami/nginx <span class="hl-flag">--set</span> replicaCount=3 <span class="hl-flag">--set</span> service.type=ClusterIP</span>

<span class="hl-comment"># Installer avec un fichier de valeurs personnalisées</span>
<span class="hl-cmd">$ helm install mon-nginx bitnami/nginx <span class="hl-flag">-f</span> mes-valeurs.yaml</span>

<span class="hl-comment"># Installer dans un namespace spécifique</span>
<span class="hl-cmd">$ helm install mon-nginx bitnami/nginx <span class="hl-flag">--namespace</span> production <span class="hl-flag">--create-namespace</span></span></code></pre><button class="copy-btn">Copier</button></div>
<p>Exemple de fichier de valeurs personnalisées :</p>
<div class="code-block"><pre><code><span class="hl-comment"># mes-valeurs.yaml</span>
<span class="hl-key">replicaCount</span>: <span class="hl-num">3</span>
<span class="hl-key">service</span>:
  <span class="hl-key">type</span>: <span class="hl-str">ClusterIP</span>
<span class="hl-key">resources</span>:
  <span class="hl-key">requests</span>:
    <span class="hl-key">cpu</span>: <span class="hl-str">200m</span>
    <span class="hl-key">memory</span>: <span class="hl-str">256Mi</span>
  <span class="hl-key">limits</span>:
    <span class="hl-key">cpu</span>: <span class="hl-str">500m</span>
    <span class="hl-key">memory</span>: <span class="hl-str">512Mi</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Gérer les releases</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Lister toutes les releases</span>
<span class="hl-cmd">$ helm list</span>
<span class="hl-cmd">$ helm list <span class="hl-flag">--all-namespaces</span></span>

<span class="hl-comment"># Voir le statut d'une release</span>
<span class="hl-cmd">$ helm status mon-nginx</span>

<span class="hl-comment"># Voir les valeurs actuellement utilisées par une release</span>
<span class="hl-cmd">$ helm get values mon-nginx</span>

<span class="hl-comment"># Voir tous les manifests générés par une release</span>
<span class="hl-cmd">$ helm get manifest mon-nginx</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Mettre à jour et annuler</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Mettre à jour une release (crée une nouvelle révision)</span>
<span class="hl-cmd">$ helm upgrade mon-nginx bitnami/nginx <span class="hl-flag">--set</span> replicaCount=5</span>

<span class="hl-comment"># Mettre à jour avec un fichier de valeurs</span>
<span class="hl-cmd">$ helm upgrade mon-nginx bitnami/nginx <span class="hl-flag">-f</span> nouvelles-valeurs.yaml</span>

<span class="hl-comment"># Voir l'historique des révisions</span>
<span class="hl-cmd">$ helm history mon-nginx</span>

<span class="hl-comment"># Rollback à la révision précédente</span>
<span class="hl-cmd">$ helm rollback mon-nginx 1</span>

<span class="hl-comment"># Désinstaller complètement</span>
<span class="hl-cmd">$ helm uninstall mon-nginx</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Outils de débogage</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Tester le rendu des templates sans installer (dry-run)</span>
<span class="hl-cmd">$ helm template mon-app ./mon-chart</span>

<span class="hl-comment"># Valider la syntaxe d'un chart</span>
<span class="hl-cmd">$ helm lint ./mon-chart</span>

<span class="hl-comment"># Installer en mode dry-run (simuler sans appliquer)</span>
<span class="hl-cmd">$ helm install mon-app ./mon-chart <span class="hl-flag">--dry-run</span> <span class="hl-flag">--debug</span></span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip"><code>helm template</code> est extrêmement utile pour déboguer : il affiche le YAML final qui sera appliqué, sans rien déployer. Combine-le avec <code>--debug</code> pour voir les erreurs de template en détail.</div>`
    },
    {
      title: "Kustomize",
      content: `<p><strong>Kustomize</strong> est une approche différente de Helm pour personnaliser les manifests YAML. Au lieu de templates avec des variables, tu gardes des fichiers YAML standards et tu appliques des <strong>patches</strong> (modifications) par-dessus. L'avantage : tes fichiers de base restent du YAML valide, lisible et testable.</p>
<p>Kustomize est intégré directement dans kubectl, donc tu n'as rien à installer de plus.</p>
<h3>Le concept : base + overlays</h3>
<p>Le principe central de Kustomize repose sur deux couches :</p>
<ul>
<li><strong>Base</strong> : les manifests de référence, identiques quel que soit l'environnement</li>
<li><strong>Overlays</strong> : les modifications spécifiques à chaque environnement (dev, staging, prod)</li>
</ul>
<div class="diagram">
        <span class="d-accent">Structure Kustomize</span>

        mon-app/
        +-- base/
        |   +-- kustomization.yaml
        |   +-- deployment.yaml
        |   +-- service.yaml
        |
        +-- overlays/
            +-- dev/
            |   +-- kustomization.yaml
            |   +-- replicas-patch.yaml
            |
            +-- prod/
                +-- kustomization.yaml
                +-- replicas-patch.yaml
                +-- resources-patch.yaml
</div>
<h3>Exemple complet</h3>
<div class="code-block"><pre><code><span class="hl-comment"># base/deployment.yaml (YAML standard, pas de template)</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-api</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">1</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">mon-api</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">mon-api</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">api</span>
        <span class="hl-key">image</span>: <span class="hl-str">mon-api:latest</span>
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: <span class="hl-num">8080</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># base/kustomization.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">kustomize.config.k8s.io/v1beta1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Kustomization</span>
<span class="hl-key">resources</span>:
- <span class="hl-str">deployment.yaml</span>
- <span class="hl-str">service.yaml</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># overlays/prod/kustomization.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">kustomize.config.k8s.io/v1beta1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Kustomization</span>
<span class="hl-key">resources</span>:
- <span class="hl-str">../../base</span>
<span class="hl-key">namePrefix</span>: <span class="hl-str">prod-</span>
<span class="hl-key">namespace</span>: <span class="hl-str">production</span>
<span class="hl-key">commonLabels</span>:
  <span class="hl-key">env</span>: <span class="hl-str">production</span>
<span class="hl-key">patches</span>:
- <span class="hl-key">path</span>: <span class="hl-str">replicas-patch.yaml</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># overlays/prod/replicas-patch.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">mon-api</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">5</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Commandes Kustomize</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Voir le YAML généré (sans appliquer)</span>
<span class="hl-cmd">$ kubectl kustomize overlays/prod/</span>

<span class="hl-comment"># Appliquer directement l'overlay prod</span>
<span class="hl-cmd">$ kubectl apply <span class="hl-flag">-k</span> overlays/prod/</span>

<span class="hl-comment"># Appliquer l'overlay dev</span>
<span class="hl-cmd">$ kubectl apply <span class="hl-flag">-k</span> overlays/dev/</span>

<span class="hl-comment"># Supprimer les ressources d'un overlay</span>
<span class="hl-cmd">$ kubectl delete <span class="hl-flag">-k</span> overlays/prod/</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note"><strong>Helm vs Kustomize</strong> : Helm est un vrai gestionnaire de packages avec install/upgrade/rollback et des repositories. Kustomize est un outil de personnalisation de YAML pur. Les deux peuvent être combinés : tu peux utiliser <code>helm template</code> pour générer du YAML, puis Kustomize pour le personnaliser selon l'environnement.</div>`
    },
    {
      title: "Observabilité et monitoring",
      content: `<p>Déployer une application ne suffit pas : il faut savoir ce qui s'y passe. L'<strong>observabilité</strong> repose sur trois piliers : les <strong>métriques</strong> (chiffres), les <strong>logs</strong> (texte) et les <strong>traces</strong> (chemins des requêtes). Dans Kubernetes, le monitoring s'appuie principalement sur <strong>Prometheus</strong> pour collecter les métriques et <strong>Grafana</strong> pour les visualiser.</p>
<div class="diagram">
  <span class="d-accent">Les trois piliers de l'observabilité</span>

  +-----------------+   +-----------------+   +-----------------+
  |   Métriques     |   |     Logs        |   |    Traces       |
  |   (chiffres)    |   |    (texte)      |   |   (chemins)     |
  |                 |   |                 |   |                 |
  |  CPU, mémoire,  |   |  stdout/stderr  |   |  Requête HTTP   |
  |  requêtes/sec,  |   |  des conteneurs |   |  à travers les  |
  |  latence...     |   |                 |   |  microservices   |
  |                 |   |                 |   |                 |
  |  Prometheus     |   |  kubectl logs   |   |  Jaeger, Zipkin |
  |  + Grafana      |   |  Loki, Fluentd  |   |                 |
  +-----------------+   +-----------------+   +-----------------+
</div>
<h3>Prometheus : la collecte de métriques</h3>
<p>Prometheus fonctionne en mode <strong>pull</strong> (scraping) : il va chercher les métriques sur les endpoints <code>/metrics</code> de tes applications à intervalles réguliers. Chaque application qui veut être monitorée expose un endpoint HTTP avec ses métriques dans un format texte standardisé.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Installer le stack complet Prometheus + Grafana via Helm</span>
<span class="hl-cmd">$ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts</span>
<span class="hl-cmd">$ helm repo update</span>

<span class="hl-comment"># Installer kube-prometheus-stack (Prometheus + Grafana + alertes préconfigurées)</span>
<span class="hl-cmd">$ helm install monitoring prometheus-community/kube-prometheus-stack \
  <span class="hl-flag">--namespace</span> monitoring <span class="hl-flag">--create-namespace</span></span>

<span class="hl-comment"># Vérifier que tous les Pods tournent</span>
<span class="hl-cmd">$ kubectl get pods <span class="hl-flag">-n</span> monitoring</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Accéder aux dashboards</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Accéder à Grafana (dashboards visuels)</span>
<span class="hl-cmd">$ kubectl port-forward svc/monitoring-grafana <span class="hl-flag">-n</span> monitoring 3000:80</span>
<span class="hl-comment"># Ouvre http://localhost:3000</span>
<span class="hl-comment"># Login par défaut : admin / prom-operator</span>

<span class="hl-comment"># Accéder à Prometheus (requêtes et alertes)</span>
<span class="hl-cmd">$ kubectl port-forward svc/monitoring-kube-prometheus-prometheus <span class="hl-flag">-n</span> monitoring 9090:9090</span>
<span class="hl-comment"># Ouvre http://localhost:9090</span></code></pre><button class="copy-btn">Copier</button></div>
<p>Grafana inclut des dashboards préconfigurés pour le monitoring du cluster : utilisation CPU par noeud, mémoire par Pod, trafic réseau, état des Pods, etc.</p>
<h3>Le Metrics Server</h3>
<p>Le <strong>Metrics Server</strong> est un composant léger qui collecte les métriques de base (CPU et mémoire) des noeuds et des Pods. C'est lui qui alimente les commandes <code>kubectl top</code>.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Activer le Metrics Server sur minikube</span>
<span class="hl-cmd">$ minikube addons enable metrics-server</span>

<span class="hl-comment"># Voir la consommation des noeuds</span>
<span class="hl-cmd">$ kubectl top nodes</span>

<span class="hl-comment"># Voir la consommation des Pods</span>
<span class="hl-cmd">$ kubectl top pods</span>
<span class="hl-cmd">$ kubectl top pods <span class="hl-flag">-n</span> mon-namespace</span>
<span class="hl-cmd">$ kubectl top pods <span class="hl-flag">--sort-by</span>=memory</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Le Metrics Server est indispensable pour le <strong>Horizontal Pod Autoscaler</strong> (HPA) qui ajuste automatiquement le nombre de réplicas en fonction de la charge CPU ou mémoire. C'est aussi nécessaire pour que <code>kubectl top</code> fonctionne.</div>`
    },
    {
      title: "Troubleshooting",
      content: `<p>Le troubleshooting représente <strong>30% de l'examen CKA</strong>. Avoir une approche méthodique est essentiel. Voici une méthodologie structurée et les outils pour diagnostiquer les problèmes les plus courants.</p>
<h3>Méthodologie en 5 étapes</h3>
<div class="diagram">
  <span class="d-accent">Méthode de troubleshooting</span>

  1. État global     -->  kubectl get nodes / pods -A
         |
  2. Décrire         -->  kubectl describe pod/node/svc
         |
  3. Logs            -->  kubectl logs / logs --previous
         |
  4. Événements      -->  kubectl get events --sort-by=...
         |
  5. Debug interactif --> kubectl debug / exec
</div>
<div class="code-block"><pre><code><span class="hl-comment"># Étape 1 : Vue globale du cluster</span>
<span class="hl-cmd">$ kubectl get nodes</span>
<span class="hl-cmd">$ kubectl get pods <span class="hl-flag">-A</span> | grep -v Running</span>
<span class="hl-cmd">$ kubectl get componentstatuses</span>

<span class="hl-comment"># Étape 2 : Inspecter la ressource problématique</span>
<span class="hl-cmd">$ kubectl describe pod &lt;nom&gt;</span>
<span class="hl-cmd">$ kubectl describe node &lt;nom&gt;</span>
<span class="hl-cmd">$ kubectl describe service &lt;nom&gt;</span>

<span class="hl-comment"># Étape 3 : Lire les logs</span>
<span class="hl-cmd">$ kubectl logs &lt;pod&gt;</span>
<span class="hl-cmd">$ kubectl logs &lt;pod&gt; <span class="hl-flag">--previous</span></span>    <span class="hl-comment"># logs du conteneur précédent (après crash)</span>
<span class="hl-cmd">$ kubectl logs &lt;pod&gt; <span class="hl-flag">-c</span> &lt;conteneur&gt;</span> <span class="hl-comment"># Pod multi-conteneur</span>
<span class="hl-cmd">$ kubectl logs &lt;pod&gt; <span class="hl-flag">-f</span></span>            <span class="hl-comment"># suivre en temps réel</span>

<span class="hl-comment"># Étape 4 : Événements du namespace</span>
<span class="hl-cmd">$ kubectl get events <span class="hl-flag">--sort-by</span>=.metadata.creationTimestamp</span>

<span class="hl-comment"># Étape 5 : Debug interactif</span>
<span class="hl-cmd">$ kubectl debug &lt;pod&gt; <span class="hl-flag">-it</span> <span class="hl-flag">--image</span>=busybox <span class="hl-flag">--target</span>=&lt;conteneur&gt;</span>
<span class="hl-cmd">$ kubectl exec <span class="hl-flag">-it</span> &lt;pod&gt; <span class="hl-flag">--</span> /bin/sh</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>kubectl debug en détail</h3>
<p><code>kubectl debug</code> est un outil puissant pour diagnostiquer les problèmes. Il permet d'attacher un conteneur éphémère à un Pod existant, même si celui-ci n'a pas de shell :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Attacher un conteneur de debug à un Pod en cours d'exécution</span>
<span class="hl-cmd">$ kubectl debug mon-pod <span class="hl-flag">-it</span> <span class="hl-flag">--image</span>=busybox <span class="hl-flag">--target</span>=mon-conteneur</span>

<span class="hl-comment"># Créer une copie du Pod avec une image différente (utile si le Pod crashe)</span>
<span class="hl-cmd">$ kubectl debug mon-pod <span class="hl-flag">-it</span> <span class="hl-flag">--copy-to</span>=mon-pod-debug <span class="hl-flag">--image</span>=busybox</span>

<span class="hl-comment"># Déboguer un noeud directement</span>
<span class="hl-cmd">$ kubectl debug node/mon-noeud <span class="hl-flag">-it</span> <span class="hl-flag">--image</span>=busybox</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Problèmes courants et solutions</h3>
<p><strong>CrashLoopBackOff</strong> : le conteneur démarre, crashe, est relancé, re-crashe en boucle.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Diagnostic</span>
<span class="hl-cmd">$ kubectl describe pod &lt;nom&gt;</span>     <span class="hl-comment"># section Events</span>
<span class="hl-cmd">$ kubectl logs &lt;nom&gt;</span>             <span class="hl-comment"># erreur dans l'application</span>
<span class="hl-cmd">$ kubectl logs &lt;nom&gt; <span class="hl-flag">--previous</span></span>  <span class="hl-comment"># logs du crash précédent</span>

<span class="hl-comment"># Causes courantes :</span>
<span class="hl-comment"># - Commande ou entrypoint invalide</span>
<span class="hl-comment"># - Variable d'environnement manquante</span>
<span class="hl-comment"># - Port déjà utilisé</span>
<span class="hl-comment"># - Fichier de configuration absent</span>
<span class="hl-comment"># - Liveness probe trop agressive</span></code></pre><button class="copy-btn">Copier</button></div>
<p><strong>ImagePullBackOff</strong> : Kubernetes n'arrive pas à télécharger l'image Docker.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Causes courantes :</span>
<span class="hl-comment"># - Nom de l'image mal orthographié</span>
<span class="hl-comment"># - Tag inexistant</span>
<span class="hl-comment"># - Registry privée sans imagePullSecret</span>
<span class="hl-comment"># - Pas de connexion Internet</span>

<span class="hl-cmd">$ kubectl describe pod &lt;nom&gt;</span>  <span class="hl-comment"># cherche "Failed to pull image"</span></code></pre><button class="copy-btn">Copier</button></div>
<p><strong>Pending</strong> : le Pod reste en attente, aucun noeud ne l'accepte.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Causes courantes :</span>
<span class="hl-comment"># - Pas assez de ressources sur les noeuds (requests trop élevées)</span>
<span class="hl-comment"># - nodeSelector ou tolerations manquants</span>
<span class="hl-comment"># - PVC non lié (Pending aussi)</span>

<span class="hl-cmd">$ kubectl describe pod &lt;nom&gt;</span>   <span class="hl-comment"># section Events : FailedScheduling</span></code></pre><button class="copy-btn">Copier</button></div>
<p><strong>Node NotReady</strong> : un noeud du cluster ne répond plus.</p>
<div class="code-block"><pre><code><span class="hl-comment"># Diagnostic</span>
<span class="hl-cmd">$ kubectl describe node &lt;nom&gt;</span>   <span class="hl-comment"># section Conditions</span>
<span class="hl-comment"># Vérifier sur le noeud :</span>
<span class="hl-comment"># - kubelet tourne ? (systemctl status kubelet)</span>
<span class="hl-comment"># - Disque plein ? (df -h)</span>
<span class="hl-comment"># - Mémoire saturée ? (free -m)</span>
<span class="hl-comment"># - Container runtime OK ? (systemctl status containerd)</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box warning"><strong>Réflexe troubleshooting</strong> : toujours commencer par <code>kubectl describe</code> et lire la section <strong>Events</strong> en bas de la sortie. Dans 90% des cas, la réponse au problème s'y trouve.</div>`
    }
  ],
  exercises: [
    {
      title: "Déployer une application avec Helm",
      desc: "Utilise Helm pour installer nginx depuis le dépôt Bitnami, personnaliser le déploiement, effectuer une mise à jour puis un rollback.",
      steps: [
        "Installe Helm si ce n'est pas fait : <code>brew install helm</code> (macOS) ou utilise le script curl officiel",
        "Ajoute le dépôt Bitnami : <code>helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update</code>",
        "Explore les valeurs disponibles : <code>helm show values bitnami/nginx | head -60</code>",
        "Installe nginx avec 2 réplicas : <code>helm install mon-web bitnami/nginx --set replicaCount=2 --set service.type=ClusterIP</code>",
        "Vérifie la release : <code>helm list</code> et <code>kubectl get pods</code>",
        "Mets à jour avec 3 réplicas : <code>helm upgrade mon-web bitnami/nginx --set replicaCount=3 --set service.type=ClusterIP</code>",
        "Vérifie l'historique : <code>helm history mon-web</code> (tu dois voir 2 révisions)",
        "Effectue un rollback à la révision 1 : <code>helm rollback mon-web 1</code>",
        "Vérifie que tu es revenu à 2 réplicas : <code>kubectl get pods</code>",
        "Désinstalle proprement : <code>helm uninstall mon-web</code>"
      ],
      validation: "Tu dois avoir installé, mis à jour (3 réplicas), puis annulé la mise à jour avec rollback (retour à 2 réplicas). La commande <code>helm history mon-web</code> doit montrer 3 révisions.",
      hint: "Si tu obtiens une erreur lors de l'installation, vérifie que le dépôt est bien ajouté avec <code>helm repo list</code>. Si les Pods ne démarrent pas, utilise <code>kubectl describe pod</code> pour diagnostiquer."
    },
    {
      title: "Diagnostiquer un déploiement cassé",
      desc: "Déploie intentionnellement des Pods avec des erreurs variées et utilise la méthodologie de troubleshooting pour identifier et corriger chaque problème.",
      steps: [
        "Crée un Pod avec une image inexistante : <code>kubectl run bug-image --image=nginx:version-qui-nexiste-pas</code>",
        "Observe le statut : <code>kubectl get pod bug-image</code> (tu dois voir ImagePullBackOff)",
        "Diagnostique avec : <code>kubectl describe pod bug-image</code> et lis la section Events",
        "Supprime le Pod : <code>kubectl delete pod bug-image</code>",
        "Crée un Pod qui crashe en boucle : <code>kubectl run bug-crash --image=busybox -- /bin/sh -c 'echo Erreur fatale && exit 1'</code>",
        "Observe le CrashLoopBackOff : <code>kubectl get pod bug-crash -w</code> (Ctrl+C pour arrêter)",
        "Lis les logs du crash : <code>kubectl logs bug-crash --previous</code>",
        "Utilise kubectl debug pour inspecter : <code>kubectl debug bug-crash -it --image=busybox --copy-to=bug-debug</code>",
        "Nettoie tout : <code>kubectl delete pod bug-image bug-crash bug-debug</code>"
      ],
      validation: "Tu dois savoir identifier ImagePullBackOff (mauvaise image) et CrashLoopBackOff (conteneur qui crashe) en utilisant describe + logs. Tu dois aussi avoir utilisé kubectl debug pour inspecter un Pod.",
      hint: "Le flag <code>--previous</code> permet de lire les logs d'un conteneur qui a crashé. Sans ce flag, tu obtiens les logs du conteneur actuel (qui peut être en cours de redémarrage et donc vide)."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande pour installer un chart Helm nommé 'bitnami/redis' avec le nom de release 'cache' ?",
      answers: ["helm install cache bitnami/redis"]
    },
    {
      prompt: "Quelle commande pour lister toutes les releases Helm dans tous les namespaces ?",
      answers: ["helm list --all-namespaces", "helm list -A", "helm ls --all-namespaces", "helm ls -A"]
    },
    {
      prompt: "Quelle commande pour mettre à jour la release 'mon-app' avec le chart 'bitnami/nginx' en passant replicaCount à 5 ?",
      answers: ["helm upgrade mon-app bitnami/nginx --set replicaCount=5"]
    },
    {
      prompt: "Quelle commande pour lancer un conteneur de debug busybox attaché à un Pod nommé 'api-server' ?",
      answers: ["kubectl debug api-server -it --image=busybox", "kubectl debug api-server -it --image=busybox --target=api-server"]
    }
  ],
  quiz: [
    {
      question: "Qu'est-ce qu'un chart Helm ?",
      options: [
        "Un fichier YAML unique qui décrit un Pod",
        "Un package contenant des templates YAML et des valeurs configurables pour déployer une application",
        "Un outil de monitoring intégré à Kubernetes",
        "Un type de volume persistant"
      ],
      correct: 1,
      explanation: "Un chart Helm est un package qui regroupe tous les manifests Kubernetes (Deployment, Service, ConfigMap, etc.) sous forme de templates paramétrables. Il permet de déployer, mettre à jour et supprimer une application de manière cohérente et reproductible."
    },
    {
      question: "Quelle commande Helm permet d'annuler une mise à jour et de revenir à une version précédente ?",
      options: [
        "helm undo",
        "helm rollback",
        "helm restore",
        "helm revert"
      ],
      correct: 1,
      explanation: "La commande <code>helm rollback &lt;release&gt; &lt;révision&gt;</code> permet de revenir à une version précédente d'une release. Helm conserve l'historique des révisions, tu peux les consulter avec <code>helm history</code>."
    },
    {
      question: "Quelle est la différence fondamentale entre Helm et Kustomize ?",
      options: [
        "Helm est gratuit et Kustomize est payant",
        "Helm utilise des templates avec des variables, Kustomize applique des patches sur du YAML standard",
        "Kustomize ne fonctionne pas avec kubectl",
        "Helm ne peut gérer qu'une seule application à la fois"
      ],
      correct: 1,
      explanation: "Helm utilise le Go templating pour injecter des valeurs dans des templates YAML. Kustomize garde des fichiers YAML standards et applique des modifications (patches) par-dessus, via un système de base + overlays. Kustomize est intégré nativement dans kubectl avec le flag <code>-k</code>."
    },
    {
      question: "Comment Prometheus collecte-t-il les métriques ?",
      options: [
        "Les applications poussent les métriques vers Prometheus (push)",
        "Prometheus va chercher les métriques sur les endpoints /metrics des applications (pull/scrape)",
        "Via des agents installés sur chaque Pod automatiquement",
        "En lisant les logs Kubernetes"
      ],
      correct: 1,
      explanation: "Prometheus fonctionne en mode pull (scraping) : il interroge périodiquement les endpoints <code>/metrics</code> de tes applications pour collecter les métriques. C'est l'inverse du mode push utilisé par d'autres systèmes comme StatsD."
    },
    {
      question: "Quel est le premier réflexe quand un Pod est en CrashLoopBackOff ?",
      options: [
        "Supprimer et recréer le Pod immédiatement",
        "Augmenter les limites de ressources CPU et mémoire",
        "Lire les logs avec kubectl logs --previous et les events avec kubectl describe",
        "Redémarrer le noeud sur lequel tourne le Pod"
      ],
      correct: 2,
      explanation: "Le premier réflexe est de diagnostiquer : <code>kubectl logs &lt;pod&gt; --previous</code> pour lire les logs du crash, et <code>kubectl describe pod &lt;pod&gt;</code> pour voir les events. La cause est souvent visible dans les logs (erreur de configuration, variable manquante, dépendance inaccessible, etc.)."
    }
  ]
},

{
  id: 12,
  title: "Projet final : déploiement complet",
  desc: "Construire et déployer une application complète sur minikube en appliquant tous les concepts des modules 1 à 11",
  objectives: [
    "Concevoir l'architecture d'une application multi-composants sur Kubernetes",
    "Déployer un backend (API Node.js) avec ConfigMap, Secret et probes de santé",
    "Déployer un frontend (nginx) avec des limites de ressources",
    "Déployer Redis avec un PersistentVolumeClaim pour le stockage persistant",
    "Exposer l'application via un Ingress avec routage par chemin",
    "Appliquer la sécurité (RBAC, limites de ressources) et vérifier le bon fonctionnement"
  ],
  sections: [
    {
      title: "Architecture du projet",
      content: `<p>Ce projet final est la synthèse de tout ce que tu as appris dans les modules 1 à 11. Tu vas déployer une application complète composée de <strong>trois services</strong> qui communiquent entre eux, exactement comme dans un environnement de production réel.</p>
<h3>Les composants</h3>
<ul>
<li><strong>Frontend</strong> : un serveur nginx qui sert une page HTML statique et fait office de reverse proxy vers l'API</li>
<li><strong>Backend (API)</strong> : un serveur HTTP (on utilise httpbin pour simuler une vraie API) qui reçoit sa configuration via ConfigMap et Secret, et communique avec Redis</li>
<li><strong>Redis</strong> : une base de données en mémoire pour le cache et les sessions, déployée avec du stockage persistant</li>
</ul>
<div class="diagram">
                        <span class="d-accent">Navigateur / Internet</span>
                              |
                              v
                        [ <span class="d-accent">Ingress</span> ]
                    nginx Ingress Controller
                       /             \\
                     /                 \\
              /frontend           /api/*
                  |                    |
                  v                    v
          +---------------+    +---------------+
          | <span class="d-accent">Frontend</span>      |    | <span class="d-accent">Backend API</span>   |
          | Deployment    |    | Deployment    |
          | nginx:1.27    |    | httpbin       |
          | 2 réplicas    |    | 2 réplicas    |
          | Service: 80   |    | Service: 80   |
          +---------------+    +-------+-------+
                                       |
                                 ConfigMap + Secret
                                       |
                                       v
                               +---------------+
                               | <span class="d-accent">Redis</span>         |
                               | Deployment    |
                               | redis:7       |
                               | 1 réplica     |
                               | PVC: 1Gi      |
                               | Service: 6379 |
                               +---------------+
</div>
<h3>Récapitulatif des concepts utilisés</h3>
<ul>
<li><strong>Module 1</strong> : Architecture Kubernetes, modèle déclaratif</li>
<li><strong>Module 2</strong> : kubectl, manifests YAML</li>
<li><strong>Module 3</strong> : Pods, labels, annotations</li>
<li><strong>Module 4</strong> : Deployments, ReplicaSets, mises à jour</li>
<li><strong>Module 5</strong> : ConfigMaps et Secrets pour la configuration</li>
<li><strong>Module 6</strong> : Services pour la communication interne (ClusterIP)</li>
<li><strong>Module 7</strong> : PVC pour le stockage persistant de Redis</li>
<li><strong>Module 8</strong> : Probes de santé (liveness, readiness)</li>
<li><strong>Module 9</strong> : Ingress pour l'accès externe avec routage par chemin</li>
<li><strong>Module 10</strong> : RBAC et limites de ressources</li>
<li><strong>Module 11</strong> : Monitoring et troubleshooting</li>
</ul>
<div class="info-box note">Ce projet utilise des images publiques simples (nginx, redis, httpbin) pour que tout fonctionne sur minikube sans avoir besoin de construire des images Docker. Dans un projet réel, tu construirais tes propres images pour le backend et le frontend.</div>`
    },
    {
      title: "Le backend",
      content: `<p>Le backend est le coeur de l'application. Il reçoit les requêtes HTTP, communique avec Redis pour le cache, et renvoie des réponses. On utilise <strong>httpbin</strong> comme simulateur d'API : c'est une image publique qui expose de nombreux endpoints utiles pour tester.</p>
<h3>Préparer le namespace et la configuration</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Créer le namespace dédié au projet</span>
<span class="hl-cmd">$ kubectl create namespace projet-final</span>

<span class="hl-comment"># Se positionner dans le namespace par défaut</span>
<span class="hl-cmd">$ kubectl config set-context --current --namespace=projet-final</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>ConfigMap pour la configuration de l'API</h3>
<div class="code-block"><pre><code><span class="hl-comment"># api-config.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">ConfigMap</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">api-config</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">api</span>
    <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
<span class="hl-key">data</span>:
  <span class="hl-key">REDIS_HOST</span>: <span class="hl-str">"redis.projet-final.svc.cluster.local"</span>
  <span class="hl-key">REDIS_PORT</span>: <span class="hl-str">"6379"</span>
  <span class="hl-key">APP_ENV</span>: <span class="hl-str">"production"</span>
  <span class="hl-key">LOG_LEVEL</span>: <span class="hl-str">"info"</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Secret pour les identifiants sensibles</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Créer le secret pour le mot de passe Redis (en ligne de commande)</span>
<span class="hl-cmd">$ kubectl create secret generic redis-secret \
  --from-literal=REDIS_PASSWORD=S3cur3P4ssw0rd! \
  -n projet-final</span>

<span class="hl-comment"># Vérifier que le secret existe</span>
<span class="hl-cmd">$ kubectl get secrets -n projet-final</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Le Deployment du backend</h3>
<div class="code-block"><pre><code><span class="hl-comment"># api-deployment.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">api</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">api</span>
    <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">2</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">api</span>
  <span class="hl-key">strategy</span>:
    <span class="hl-key">type</span>: <span class="hl-str">RollingUpdate</span>
    <span class="hl-key">rollingUpdate</span>:
      <span class="hl-key">maxSurge</span>: <span class="hl-num">1</span>
      <span class="hl-key">maxUnavailable</span>: <span class="hl-num">0</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">api</span>
        <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">api</span>
        <span class="hl-key">image</span>: <span class="hl-str">kennethreitz/httpbin</span>
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: <span class="hl-num">80</span>
          <span class="hl-key">name</span>: <span class="hl-str">http</span>
        <span class="hl-key">envFrom</span>:
        - <span class="hl-key">configMapRef</span>:
            <span class="hl-key">name</span>: <span class="hl-str">api-config</span>
        <span class="hl-key">env</span>:
        - <span class="hl-key">name</span>: <span class="hl-str">REDIS_PASSWORD</span>
          <span class="hl-key">valueFrom</span>:
            <span class="hl-key">secretKeyRef</span>:
              <span class="hl-key">name</span>: <span class="hl-str">redis-secret</span>
              <span class="hl-key">key</span>: <span class="hl-str">REDIS_PASSWORD</span>
        <span class="hl-key">resources</span>:
          <span class="hl-key">requests</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">100m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">128Mi</span>
          <span class="hl-key">limits</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">250m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">256Mi</span>
        <span class="hl-key">livenessProbe</span>:
          <span class="hl-key">httpGet</span>:
            <span class="hl-key">path</span>: <span class="hl-str">/get</span>
            <span class="hl-key">port</span>: <span class="hl-num">80</span>
          <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">15</span>
          <span class="hl-key">periodSeconds</span>: <span class="hl-num">10</span>
          <span class="hl-key">failureThreshold</span>: <span class="hl-num">3</span>
        <span class="hl-key">readinessProbe</span>:
          <span class="hl-key">httpGet</span>:
            <span class="hl-key">path</span>: <span class="hl-str">/get</span>
            <span class="hl-key">port</span>: <span class="hl-num">80</span>
          <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">5</span>
          <span class="hl-key">periodSeconds</span>: <span class="hl-num">5</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Le Service du backend</h3>
<div class="code-block"><pre><code><span class="hl-comment"># api-service.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">api</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">api</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">type</span>: <span class="hl-str">ClusterIP</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">api</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">http</span>
    <span class="hl-key">port</span>: <span class="hl-num">80</span>
    <span class="hl-key">targetPort</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Déployer le backend</span>
<span class="hl-cmd">$ kubectl apply -f api-config.yaml</span>
<span class="hl-cmd">$ kubectl apply -f api-deployment.yaml</span>
<span class="hl-cmd">$ kubectl apply -f api-service.yaml</span>

<span class="hl-comment"># Vérifier</span>
<span class="hl-cmd">$ kubectl get pods -n projet-final -l app=api</span>
<span class="hl-cmd">$ kubectl get svc -n projet-final</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box tip">Remarque les bonnes pratiques appliquées ici : labels cohérents sur toutes les ressources, stratégie RollingUpdate avec <code>maxUnavailable: 0</code> pour zéro downtime, probes de santé configurées, et limites de ressources définies.</div>`
    },
    {
      title: "Le frontend",
      content: `<p>Le frontend est un serveur nginx qui sert du contenu statique. Dans un projet réel, tu aurais une application React, Vue.js ou Angular compilée en fichiers statiques et servie par nginx. Ici, on utilise l'image nginx par défaut qui affiche une page d'accueil.</p>
<h3>Le Deployment du frontend</h3>
<div class="code-block"><pre><code><span class="hl-comment"># frontend-deployment.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">frontend</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">frontend</span>
    <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">2</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">frontend</span>
  <span class="hl-key">strategy</span>:
    <span class="hl-key">type</span>: <span class="hl-str">RollingUpdate</span>
    <span class="hl-key">rollingUpdate</span>:
      <span class="hl-key">maxSurge</span>: <span class="hl-num">1</span>
      <span class="hl-key">maxUnavailable</span>: <span class="hl-num">0</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">frontend</span>
        <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">nginx</span>
        <span class="hl-key">image</span>: <span class="hl-str">nginx:1.27</span>
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: <span class="hl-num">80</span>
          <span class="hl-key">name</span>: <span class="hl-str">http</span>
        <span class="hl-key">resources</span>:
          <span class="hl-key">requests</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">50m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">64Mi</span>
          <span class="hl-key">limits</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">100m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">128Mi</span>
        <span class="hl-key">livenessProbe</span>:
          <span class="hl-key">httpGet</span>:
            <span class="hl-key">path</span>: <span class="hl-str">/</span>
            <span class="hl-key">port</span>: <span class="hl-num">80</span>
          <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">5</span>
          <span class="hl-key">periodSeconds</span>: <span class="hl-num">10</span>
        <span class="hl-key">readinessProbe</span>:
          <span class="hl-key">httpGet</span>:
            <span class="hl-key">path</span>: <span class="hl-str">/</span>
            <span class="hl-key">port</span>: <span class="hl-num">80</span>
          <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">3</span>
          <span class="hl-key">periodSeconds</span>: <span class="hl-num">5</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Le Service du frontend</h3>
<div class="code-block"><pre><code><span class="hl-comment"># frontend-service.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">frontend</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">frontend</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">type</span>: <span class="hl-str">ClusterIP</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">frontend</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">http</span>
    <span class="hl-key">port</span>: <span class="hl-num">80</span>
    <span class="hl-key">targetPort</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Déployer le frontend</span>
<span class="hl-cmd">$ kubectl apply -f frontend-deployment.yaml</span>
<span class="hl-cmd">$ kubectl apply -f frontend-service.yaml</span>

<span class="hl-comment"># Vérifier que les 2 réplicas sont Running</span>
<span class="hl-cmd">$ kubectl get pods -n projet-final -l app=frontend</span>

<span class="hl-comment"># Tester rapidement via port-forward</span>
<span class="hl-cmd">$ kubectl port-forward svc/frontend -n projet-final 8080:80</span>
<span class="hl-comment"># Ouvre http://localhost:8080 dans ton navigateur</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note">Le frontend a des limites de ressources plus basses que l'API car nginx est très léger pour servir du contenu statique. En production, ajuste ces valeurs selon les besoins réels de ton application, en utilisant <code>kubectl top pods</code> pour observer la consommation.</div>`
    },
    {
      title: "Redis et le stockage",
      content: `<p>Redis est le troisième composant de notre architecture. C'est une base de données en mémoire utilisée pour le cache et les sessions. Contrairement au frontend et au backend qui sont <strong>stateless</strong> (sans état), Redis est <strong>stateful</strong> : ses données doivent persister même si le Pod est redémarré.</p>
<p>Pour cela, on utilise un <strong>PersistentVolumeClaim</strong> (PVC) qui demande du stockage persistant au cluster.</p>
<h3>Le PVC pour Redis</h3>
<div class="code-block"><pre><code><span class="hl-comment"># redis-pvc.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">PersistentVolumeClaim</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">redis-data</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">redis</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">accessModes</span>:
  - <span class="hl-str">ReadWriteOnce</span>
  <span class="hl-key">resources</span>:
    <span class="hl-key">requests</span>:
      <span class="hl-key">storage</span>: <span class="hl-str">1Gi</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Le Deployment Redis</h3>
<div class="code-block"><pre><code><span class="hl-comment"># redis-deployment.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">apps/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Deployment</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">redis</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">redis</span>
    <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">replicas</span>: <span class="hl-num">1</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">matchLabels</span>:
      <span class="hl-key">app</span>: <span class="hl-str">redis</span>
  <span class="hl-key">strategy</span>:
    <span class="hl-key">type</span>: <span class="hl-str">Recreate</span>  <span class="hl-comment"># Important pour les volumes ReadWriteOnce</span>
  <span class="hl-key">template</span>:
    <span class="hl-key">metadata</span>:
      <span class="hl-key">labels</span>:
        <span class="hl-key">app</span>: <span class="hl-str">redis</span>
        <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
    <span class="hl-key">spec</span>:
      <span class="hl-key">containers</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">redis</span>
        <span class="hl-key">image</span>: <span class="hl-str">redis:7</span>
        <span class="hl-key">command</span>: [<span class="hl-str">"redis-server"</span>, <span class="hl-str">"--requirepass"</span>, <span class="hl-str">"$(REDIS_PASSWORD)"</span>, <span class="hl-str">"--appendonly"</span>, <span class="hl-str">"yes"</span>]
        <span class="hl-key">env</span>:
        - <span class="hl-key">name</span>: <span class="hl-str">REDIS_PASSWORD</span>
          <span class="hl-key">valueFrom</span>:
            <span class="hl-key">secretKeyRef</span>:
              <span class="hl-key">name</span>: <span class="hl-str">redis-secret</span>
              <span class="hl-key">key</span>: <span class="hl-str">REDIS_PASSWORD</span>
        <span class="hl-key">ports</span>:
        - <span class="hl-key">containerPort</span>: <span class="hl-num">6379</span>
          <span class="hl-key">name</span>: <span class="hl-str">redis</span>
        <span class="hl-key">resources</span>:
          <span class="hl-key">requests</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">100m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">128Mi</span>
          <span class="hl-key">limits</span>:
            <span class="hl-key">cpu</span>: <span class="hl-str">250m</span>
            <span class="hl-key">memory</span>: <span class="hl-str">256Mi</span>
        <span class="hl-key">livenessProbe</span>:
          <span class="hl-key">exec</span>:
            <span class="hl-key">command</span>:
            - <span class="hl-str">redis-cli</span>
            - <span class="hl-str">-a</span>
            - <span class="hl-str">$(REDIS_PASSWORD)</span>
            - <span class="hl-str">ping</span>
          <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">10</span>
          <span class="hl-key">periodSeconds</span>: <span class="hl-num">5</span>
        <span class="hl-key">readinessProbe</span>:
          <span class="hl-key">exec</span>:
            <span class="hl-key">command</span>:
            - <span class="hl-str">redis-cli</span>
            - <span class="hl-str">-a</span>
            - <span class="hl-str">$(REDIS_PASSWORD)</span>
            - <span class="hl-str">ping</span>
          <span class="hl-key">initialDelaySeconds</span>: <span class="hl-num">5</span>
          <span class="hl-key">periodSeconds</span>: <span class="hl-num">3</span>
        <span class="hl-key">volumeMounts</span>:
        - <span class="hl-key">name</span>: <span class="hl-str">redis-storage</span>
          <span class="hl-key">mountPath</span>: <span class="hl-str">/data</span>
      <span class="hl-key">volumes</span>:
      - <span class="hl-key">name</span>: <span class="hl-str">redis-storage</span>
        <span class="hl-key">persistentVolumeClaim</span>:
          <span class="hl-key">claimName</span>: <span class="hl-str">redis-data</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Le Service Redis</h3>
<div class="code-block"><pre><code><span class="hl-comment"># redis-service.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Service</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">redis</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">app</span>: <span class="hl-str">redis</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">type</span>: <span class="hl-str">ClusterIP</span>
  <span class="hl-key">selector</span>:
    <span class="hl-key">app</span>: <span class="hl-str">redis</span>
  <span class="hl-key">ports</span>:
  - <span class="hl-key">name</span>: <span class="hl-str">redis</span>
    <span class="hl-key">port</span>: <span class="hl-num">6379</span>
    <span class="hl-key">targetPort</span>: <span class="hl-num">6379</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="code-block"><pre><code><span class="hl-comment"># Déployer Redis</span>
<span class="hl-cmd">$ kubectl apply -f redis-pvc.yaml</span>
<span class="hl-cmd">$ kubectl apply -f redis-deployment.yaml</span>
<span class="hl-cmd">$ kubectl apply -f redis-service.yaml</span>

<span class="hl-comment"># Vérifier le PVC (doit être Bound)</span>
<span class="hl-cmd">$ kubectl get pvc -n projet-final</span>

<span class="hl-comment"># Vérifier que Redis est Running</span>
<span class="hl-cmd">$ kubectl get pods -n projet-final -l app=redis</span>

<span class="hl-comment"># Tester Redis avec un ping</span>
<span class="hl-cmd">$ kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! ping</span>
<span class="hl-comment"># Doit répondre "PONG"</span>

<span class="hl-comment"># Écrire et lire une valeur pour tester la persistance</span>
<span class="hl-cmd">$ kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! SET test "bonjour"</span>
<span class="hl-cmd">$ kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! GET test</span>
<span class="hl-comment"># Doit répondre "bonjour"</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box warning">On utilise la stratégie <code>Recreate</code> au lieu de <code>RollingUpdate</code> pour Redis car le PVC est en mode <code>ReadWriteOnce</code> : un seul Pod peut le monter à la fois. Avec RollingUpdate, le nouveau Pod ne pourrait pas démarrer tant que l'ancien n'a pas libéré le volume.</div>`
    },
    {
      title: "Exposition avec Ingress",
      content: `<p>Maintenant que nos trois composants tournent, il faut les rendre accessibles depuis l'extérieur du cluster. On utilise un <strong>Ingress</strong> qui route les requêtes vers le bon Service selon le chemin de l'URL.</p>
<h3>Activer l'Ingress Controller</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Sur minikube, activer l'addon Ingress nginx</span>
<span class="hl-cmd">$ minikube addons enable ingress</span>

<span class="hl-comment"># Vérifier que le controller tourne</span>
<span class="hl-cmd">$ kubectl get pods -n ingress-nginx</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Configurer l'Ingress</h3>
<div class="code-block"><pre><code><span class="hl-comment"># ingress.yaml</span>
<span class="hl-key">apiVersion</span>: <span class="hl-str">networking.k8s.io/v1</span>
<span class="hl-key">kind</span>: <span class="hl-str">Ingress</span>
<span class="hl-key">metadata</span>:
  <span class="hl-key">name</span>: <span class="hl-str">projet-ingress</span>
  <span class="hl-key">namespace</span>: <span class="hl-str">projet-final</span>
  <span class="hl-key">labels</span>:
    <span class="hl-key">projet</span>: <span class="hl-str">kubeclimb</span>
  <span class="hl-key">annotations</span>:
    <span class="hl-key">nginx.ingress.kubernetes.io/rewrite-target</span>: <span class="hl-str">/$2</span>
<span class="hl-key">spec</span>:
  <span class="hl-key">ingressClassName</span>: <span class="hl-str">nginx</span>
  <span class="hl-key">rules</span>:
  - <span class="hl-key">host</span>: <span class="hl-str">projet.local</span>
    <span class="hl-key">http</span>:
      <span class="hl-key">paths</span>:
      <span class="hl-comment"># Les requêtes /api/* sont redirigées vers le backend</span>
      - <span class="hl-key">path</span>: <span class="hl-str">/api(/|$)(.*)</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">ImplementationSpecific</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">api</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">80</span>
      <span class="hl-comment"># Toutes les autres requêtes vont au frontend</span>
      - <span class="hl-key">path</span>: <span class="hl-str">/</span>
        <span class="hl-key">pathType</span>: <span class="hl-str">Prefix</span>
        <span class="hl-key">backend</span>:
          <span class="hl-key">service</span>:
            <span class="hl-key">name</span>: <span class="hl-str">frontend</span>
            <span class="hl-key">port</span>:
              <span class="hl-key">number</span>: <span class="hl-num">80</span></code></pre><button class="copy-btn">Copier</button></div>
<p>L'annotation <code>rewrite-target: /$2</code> est importante : elle supprime le préfixe <code>/api</code> avant de transmettre la requête au backend. Ainsi, une requête vers <code>/api/get</code> arrive au backend comme <code>/get</code>.</p>
<h3>Configurer l'accès local</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Appliquer l'Ingress</span>
<span class="hl-cmd">$ kubectl apply -f ingress.yaml</span>

<span class="hl-comment"># Ajouter l'entrée DNS dans /etc/hosts</span>
<span class="hl-cmd">$ echo "$(minikube ip) projet.local" | sudo tee -a /etc/hosts</span>

<span class="hl-comment"># Sur macOS avec le driver Docker, il faut aussi lancer minikube tunnel</span>
<span class="hl-cmd">$ minikube tunnel</span>  <span class="hl-comment"># dans un terminal séparé</span>

<span class="hl-comment"># Tester le routage</span>
<span class="hl-cmd">$ curl http://projet.local/</span>          <span class="hl-comment"># Page d'accueil nginx (frontend)</span>
<span class="hl-cmd">$ curl http://projet.local/api/get</span>   <span class="hl-comment"># Réponse JSON de httpbin (API)</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="diagram">
  <span class="d-accent">Flux des requêtes avec l'Ingress</span>

  http://projet.local/          -->  Ingress  -->  Service frontend  -->  nginx Pod
  http://projet.local/api/get   -->  Ingress  -->  Service api       -->  httpbin Pod
                                                                           (reçoit /get)
</div>
<div class="info-box tip">Si <code>curl</code> ne fonctionne pas, vérifie que : 1) l'Ingress Controller est Running (<code>kubectl get pods -n ingress-nginx</code>), 2) l'entrée dans <code>/etc/hosts</code> est correcte, 3) sur macOS avec Docker, <code>minikube tunnel</code> est lancé dans un autre terminal.</div>`
    },
    {
      title: "Vérification et monitoring",
      content: `<p>La dernière étape consiste à tout vérifier et à s'assurer que l'application est correctement monitorée. C'est le moment d'appliquer la méthodologie de troubleshooting du module 11.</p>
<h3>Checklist de vérification complète</h3>
<div class="code-block"><pre><code><span class="hl-comment"># 1. Tous les Pods tournent</span>
<span class="hl-cmd">$ kubectl get pods -n projet-final</span>
<span class="hl-comment"># Attendu : redis-xxx, api-xxx (x2), frontend-xxx (x2) en Running</span>

<span class="hl-comment"># 2. Tous les Services sont créés</span>
<span class="hl-cmd">$ kubectl get svc -n projet-final</span>
<span class="hl-comment"># Attendu : redis (6379), api (80), frontend (80)</span>

<span class="hl-comment"># 3. Le PVC est lié</span>
<span class="hl-cmd">$ kubectl get pvc -n projet-final</span>
<span class="hl-comment"># Attendu : redis-data en Bound</span>

<span class="hl-comment"># 4. L'Ingress est configuré</span>
<span class="hl-cmd">$ kubectl get ingress -n projet-final</span>
<span class="hl-comment"># Attendu : projet-ingress avec le host projet.local</span>

<span class="hl-comment"># 5. Vue globale de toutes les ressources</span>
<span class="hl-cmd">$ kubectl get all -n projet-final</span>

<span class="hl-comment"># 6. Vérifier les événements récents (pas d'erreurs)</span>
<span class="hl-cmd">$ kubectl get events -n projet-final --sort-by=.metadata.creationTimestamp</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Tests fonctionnels</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Test du frontend</span>
<span class="hl-cmd">$ curl -s http://projet.local/ | head -5</span>

<span class="hl-comment"># Test de l'API</span>
<span class="hl-cmd">$ curl -s http://projet.local/api/get | head -10</span>

<span class="hl-comment"># Test de Redis depuis un Pod API</span>
<span class="hl-cmd">$ kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! ping</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Monitoring des ressources</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Activer le Metrics Server (si pas déjà fait)</span>
<span class="hl-cmd">$ minikube addons enable metrics-server</span>

<span class="hl-comment"># Voir la consommation des noeuds</span>
<span class="hl-cmd">$ kubectl top nodes</span>

<span class="hl-comment"># Voir la consommation de nos Pods</span>
<span class="hl-cmd">$ kubectl top pods -n projet-final</span>

<span class="hl-comment"># Suivre les logs du backend en temps réel</span>
<span class="hl-cmd">$ kubectl logs -f deploy/api -n projet-final</span>

<span class="hl-comment"># Suivre les logs de Redis</span>
<span class="hl-cmd">$ kubectl logs -f deploy/redis -n projet-final</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Test de résilience</h3>
<p>Vérifie que Kubernetes maintient l'état désiré en supprimant un Pod :</p>
<div class="code-block"><pre><code><span class="hl-comment"># Supprimer un Pod frontend (Kubernetes doit en recréer un)</span>
<span class="hl-cmd">$ kubectl delete pod -l app=frontend -n projet-final --wait=false</span>

<span class="hl-comment"># Observer la recréation automatique</span>
<span class="hl-cmd">$ kubectl get pods -n projet-final -l app=frontend -w</span>

<span class="hl-comment"># Le Deployment doit maintenir 2 réplicas en permanence</span></code></pre><button class="copy-btn">Copier</button></div>
<h3>Nettoyer le projet</h3>
<div class="code-block"><pre><code><span class="hl-comment"># Supprimer tout le namespace (supprime toutes les ressources qu'il contient)</span>
<span class="hl-cmd">$ kubectl delete namespace projet-final</span>

<span class="hl-comment"># Retirer l'entrée de /etc/hosts</span>
<span class="hl-comment"># Édite /etc/hosts et retire la ligne contenant "projet.local"</span>

<span class="hl-comment"># Remettre le namespace par défaut</span>
<span class="hl-cmd">$ kubectl config set-context --current --namespace=default</span></code></pre><button class="copy-btn">Copier</button></div>
<div class="info-box note"><strong>Félicitations !</strong> Si tout fonctionne, tu as déployé une application complète sur Kubernetes en utilisant : Namespace, Deployment, Service, ConfigMap, Secret, PVC, Ingress, probes de santé, limites de ressources et monitoring. C'est exactement le type d'architecture que l'on retrouve en production dans les entreprises. Tu as gravi toute la montagne Kubernetes !</div>`
    }
  ],
  exercises: [
    {
      title: "Déployer Redis avec stockage persistant",
      desc: "Déploie Redis avec un PVC pour garantir la persistance des données, même après un redémarrage du Pod.",
      steps: [
        "Crée le namespace : <code>kubectl create namespace projet-final</code>",
        "Crée le Secret pour le mot de passe Redis : <code>kubectl create secret generic redis-secret --from-literal=REDIS_PASSWORD=S3cur3P4ssw0rd! -n projet-final</code>",
        "Applique le PVC : <code>kubectl apply -f redis-pvc.yaml</code>",
        "Vérifie que le PVC est Bound : <code>kubectl get pvc -n projet-final</code>",
        "Déploie Redis : <code>kubectl apply -f redis-deployment.yaml</code> et <code>kubectl apply -f redis-service.yaml</code>",
        "Vérifie que Redis tourne : <code>kubectl get pods -n projet-final -l app=redis</code>",
        "Teste le ping : <code>kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! ping</code>",
        "Écris une valeur : <code>kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! SET cle valeur</code>",
        "Supprime le Pod Redis : <code>kubectl delete pod -l app=redis -n projet-final</code>",
        "Attends que le nouveau Pod soit Ready et vérifie que la donnée persiste : <code>kubectl exec -it deploy/redis -n projet-final -- redis-cli -a S3cur3P4ssw0rd! GET cle</code>"
      ],
      validation: "Le PVC doit être Bound, Redis doit répondre PONG au ping, et la donnée écrite doit survivre à la suppression du Pod grâce au volume persistant.",
      hint: "Si le PVC reste en Pending, vérifie que le StorageClass par défaut existe avec <code>kubectl get storageclass</code>. Sur minikube, le StorageClass 'standard' est disponible par défaut."
    },
    {
      title: "Déployer le backend et le frontend",
      desc: "Déploie l'API et le frontend avec leurs ConfigMaps, Services et probes de santé.",
      steps: [
        "Crée le ConfigMap pour l'API : <code>kubectl apply -f api-config.yaml</code>",
        "Déploie le backend : <code>kubectl apply -f api-deployment.yaml</code> et <code>kubectl apply -f api-service.yaml</code>",
        "Vérifie que les 2 réplicas de l'API sont Running : <code>kubectl get pods -n projet-final -l app=api</code>",
        "Vérifie les variables d'environnement : <code>kubectl exec deploy/api -n projet-final -- env | grep REDIS</code>",
        "Déploie le frontend : <code>kubectl apply -f frontend-deployment.yaml</code> et <code>kubectl apply -f frontend-service.yaml</code>",
        "Vérifie que les 2 réplicas du frontend sont Running : <code>kubectl get pods -n projet-final -l app=frontend</code>",
        "Teste le frontend via port-forward : <code>kubectl port-forward svc/frontend -n projet-final 8080:80</code>",
        "Teste l'API via port-forward : <code>kubectl port-forward svc/api -n projet-final 8081:80</code>, puis <code>curl http://localhost:8081/get</code>",
        "Vérifie toutes les ressources : <code>kubectl get all -n projet-final</code>"
      ],
      validation: "Tu dois avoir 5 Pods Running au total : 1 Redis, 2 API, 2 frontend. Les Services doivent être accessibles via port-forward. Les variables d'environnement du ConfigMap et du Secret doivent être présentes dans les Pods API.",
      hint: "Si un Pod ne démarre pas, utilise <code>kubectl describe pod &lt;nom&gt; -n projet-final</code> pour voir les Events. Vérifie aussi les logs avec <code>kubectl logs &lt;pod&gt; -n projet-final</code>."
    },
    {
      title: "Configurer l'Ingress et le routage",
      desc: "Configure un Ingress pour accéder au frontend et à l'API depuis une URL unique avec routage par chemin.",
      steps: [
        "Active l'Ingress Controller : <code>minikube addons enable ingress</code>",
        "Vérifie que le controller est Running : <code>kubectl get pods -n ingress-nginx</code>",
        "Applique l'Ingress : <code>kubectl apply -f ingress.yaml</code>",
        "Vérifie la configuration : <code>kubectl get ingress -n projet-final</code>",
        "Configure le DNS local : <code>echo \"$(minikube ip) projet.local\" | sudo tee -a /etc/hosts</code>",
        "Sur macOS avec Docker, lance <code>minikube tunnel</code> dans un terminal séparé",
        "Teste le frontend : <code>curl http://projet.local/</code> (doit afficher la page nginx)",
        "Teste l'API : <code>curl http://projet.local/api/get</code> (doit afficher du JSON)",
        "Vérifie le routage : <code>curl http://projet.local/api/headers</code> (autre endpoint de httpbin)"
      ],
      validation: "Le frontend doit répondre sur <code>http://projet.local/</code> et l'API sur <code>http://projet.local/api/*</code>. Le rewrite-target doit correctement supprimer le préfixe /api avant de transmettre la requête au backend.",
      hint: "Si l'Ingress ne répond pas, vérifie : 1) <code>kubectl describe ingress projet-ingress -n projet-final</code> pour les erreurs, 2) les Pods du namespace ingress-nginx, 3) que /etc/hosts contient bien l'IP de minikube."
    }
  ],
  commands: [
    {
      prompt: "Quelle commande pour voir toutes les ressources (Pods, Services, Deployments, etc.) dans le namespace 'projet-final' ?",
      answers: ["kubectl get all -n projet-final", "kubectl get all --namespace=projet-final", "kubectl get all --namespace projet-final"]
    },
    {
      prompt: "Quelle commande pour suivre les logs en temps réel du Deployment 'api' dans le namespace 'projet-final' ?",
      answers: ["kubectl logs -f deploy/api -n projet-final", "kubectl logs -f deployment/api -n projet-final", "kubectl logs --follow deploy/api -n projet-final"]
    },
    {
      prompt: "Quelle commande pour voir la consommation CPU et mémoire des noeuds du cluster ?",
      answers: ["kubectl top nodes", "kubectl top node"]
    },
    {
      prompt: "Quelle commande pour voir les événements du namespace 'projet-final' triés par date de création ?",
      answers: ["kubectl get events -n projet-final --sort-by=.metadata.creationTimestamp", "kubectl get events --namespace=projet-final --sort-by=.metadata.creationTimestamp"]
    }
  ],
  quiz: [
    {
      question: "Pourquoi utilise-t-on la stratégie 'Recreate' pour le Deployment Redis au lieu de 'RollingUpdate' ?",
      options: [
        "Parce que Redis ne supporte pas les mises à jour progressives",
        "Parce que le PVC est en ReadWriteOnce : un seul Pod peut le monter à la fois",
        "Parce que Recreate est plus rapide",
        "Parce que Redis n'a qu'un seul réplica"
      ],
      correct: 1,
      explanation: "Le PVC est en mode ReadWriteOnce, ce qui signifie qu'un seul Pod peut le monter à la fois. Avec RollingUpdate, le nouveau Pod essaierait de monter le volume avant que l'ancien ne l'ait libéré, ce qui bloquerait le déploiement. La stratégie Recreate supprime d'abord l'ancien Pod, libère le volume, puis crée le nouveau."
    },
    {
      question: "Quel est le rôle de l'annotation 'rewrite-target: /$2' sur l'Ingress ?",
      options: [
        "Elle redirige toutes les requêtes vers le port 2",
        "Elle supprime le préfixe /api du chemin avant de transmettre la requête au backend",
        "Elle duplique les requêtes vers deux services",
        "Elle active la compression HTTP"
      ],
      correct: 1,
      explanation: "L'annotation rewrite-target avec le groupe de capture $2 supprime le préfixe /api de l'URL. Ainsi, une requête vers /api/get est transmise au backend comme /get, ce qui correspond aux endpoints réels de l'application httpbin."
    },
    {
      question: "Dans ce projet, pourquoi le backend reçoit-il sa configuration via ConfigMap ET Secret ?",
      options: [
        "C'est obligatoire dans Kubernetes",
        "Le ConfigMap contient la configuration non sensible, le Secret contient les données sensibles comme le mot de passe",
        "Le ConfigMap est pour le développement, le Secret pour la production",
        "Les deux sont identiques mais on les sépare par convention"
      ],
      correct: 1,
      explanation: "Le ConfigMap stocke la configuration non sensible (adresse de Redis, port, environnement) en clair. Le Secret stocke les données sensibles (mot de passe Redis) de manière encodée en base64. Cette séparation est une bonne pratique de sécurité : les Secrets peuvent avoir des politiques RBAC plus strictes."
    },
    {
      question: "Que se passe-t-il si on supprime un Pod frontend dans ce projet ?",
      options: [
        "L'application est définitivement en panne",
        "Il faut recréer manuellement le Pod",
        "Le Deployment détecte le manque et crée automatiquement un nouveau Pod pour maintenir 2 réplicas",
        "Le Service redirige automatiquement vers Redis"
      ],
      correct: 2,
      explanation: "Le Deployment surveille en permanence le nombre de réplicas. Si un Pod est supprimé, le controller du Deployment détecte que l'état actuel (1 réplica) ne correspond plus à l'état désiré (2 réplicas) et crée immédiatement un nouveau Pod. C'est la boucle de réconciliation de Kubernetes en action."
    },
    {
      question: "Quel est l'ordre correct pour déployer cette application complète ?",
      options: [
        "Ingress, puis Frontend, puis API, puis Redis",
        "Frontend, puis API, puis Redis, puis Ingress",
        "Namespace et configuration (ConfigMap/Secret), puis Redis, puis API et Frontend, puis Ingress",
        "L'ordre n'a aucune importance dans Kubernetes"
      ],
      correct: 2,
      explanation: "L'ordre logique est : 1) Namespace et configuration de base (ConfigMap, Secret) car les Pods en dépendent, 2) Redis car l'API a besoin de s'y connecter, 3) API et Frontend qui utilisent la config et Redis, 4) Ingress qui route vers les Services déjà créés. En pratique, Kubernetes gère les dépendances via les readiness probes, mais déployer dans le bon ordre évite des erreurs temporaires."
    }
  ]
}
];
