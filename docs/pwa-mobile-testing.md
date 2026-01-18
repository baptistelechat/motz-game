# Guide de Test Mobile PWA (Port Forwarding)

Ce guide explique comment tester l'application PWA sur un appareil mobile Android en utilisant le **Port Forwarding** de Chrome. Cette méthode permet au téléphone d'accéder au `localhost` de votre ordinateur de manière sécurisée, activant ainsi les fonctionnalités PWA (Service Worker, Installation) qui sont bloquées sur une simple connexion IP locale (HTTP).

## Prérequis

1.  **Téléphone Android** avec :
    *   **Options pour les développeurs** activées (Tapoter 7 fois sur "Numéro de build" dans les paramètres).
    *   **Débogage USB** activé dans les Options pour les développeurs.
2.  **Câble USB** pour relier le téléphone au PC.
3.  **Google Chrome** installé sur le PC et le téléphone.

## Procédure de Port Forwarding

1.  Branchez votre téléphone à votre PC via USB.
2.  Sur votre PC, ouvrez Chrome et accédez à l'adresse : `chrome://inspect/#devices`
3.  Assurez-vous que la case **"Discover USB devices"** est cochée.
4.  Votre téléphone doit apparaître dans la liste. (Si une popup apparaît sur le téléphone demandant d'autoriser le débogage USB, acceptez).
5.  Cliquez sur le bouton **"Port forwarding..."**.
6.  Dans la fenêtre qui s'ouvre :
    *   **Port** : `3000`
    *   **IP address and port** : `localhost:3000`
    *   Cochez la case **"Enable port forwarding"**.
    *   Cliquez sur **Done**.
7.  Sur votre téléphone, ouvrez Chrome et allez sur `http://localhost:3000`.

✅ **Résultat** : Le site se charge comme si vous étiez sur le PC. Le navigateur le considère comme une origine sécurisée, et le bouton d'installation PWA doit apparaître.

## Dépannage (ADB)

Si votre appareil n'apparaît pas dans `chrome://inspect` ou si la connexion est instable, vous pouvez utiliser les commandes ADB (Android Debug Bridge) pour réinitialiser la connexion.

Ouvrez un terminal et essayez les commandes suivantes :

### Vérifier la liste des appareils connectés
```bash
adb devices
```
*Si la liste est vide ou indique "unauthorized", vérifiez l'écran de votre téléphone pour accepter la connexion.*

### Redémarrer le serveur ADB
Si l'appareil n'est toujours pas détecté, redémarrez le serveur ADB :

```bash
adb kill-server
adb start-server
adb devices
```

Cela force la reconnexion et résout souvent les problèmes de détection.
