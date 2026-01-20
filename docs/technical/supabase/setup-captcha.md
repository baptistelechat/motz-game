# Guide de Configuration Captcha (Cloudflare Turnstile)

Ce guide détaille étape par étape comment sécuriser l'authentification anonyme avec Cloudflare Turnstile.

## Pourquoi Cloudflare Turnstile ?

C'est une alternative gratuite et respectueuse de la vie privée aux CAPTCHA traditionnels. Contrairement à reCAPTCHA (Google), il ne demande souvent aucune action à l'utilisateur ("Vérification sans friction").

---

## Étape 1 : Créer un Widget sur Cloudflare

1.  Rendez-vous sur le [Dashboard Cloudflare](https://dash.cloudflare.com/).
    - Si vous n'avez pas de compte, créez-en un (c'est gratuit).
2.  Dans la barre latérale gauche, cliquez sur **Turnstile**.
3.  Cliquez sur le bouton **Add Site** (Ajouter un site).

## Étape 2 : Configurer le Widget

Remplissez le formulaire comme suit :

- **Site Name** : `Motz Game (Dev)` (ou le nom de votre choix).
- **Domain** :
  - Pour le développement local, ajoutez : `localhost` **ET** `127.0.0.1`.
  - _(Plus tard, pour la production, vous ajouterez votre domaine Vercel ici, ex: `mon-jeu.vercel.app`)_.
- **Widget Mode** : Choisissez **Managed** (Recommandé).
  - _Managed_ : Cloudflare décide s'il faut montrer un challenge ou non. C'est le meilleur équilibre sécurité/UX.
- Cliquez sur **Create**.

## Étape 3 : Récupérer les Clés

Une fois créé, Cloudflare vous donne deux clés. Ne les confondez pas !

1.  **Site Key** (Publique) :
    - Celle-ci va dans le code Frontend (Next.js).
    - Elle permet d'afficher le widget.
2.  **Secret Key** (Privée) :
    - Celle-ci va dans le Backend (Supabase).
    - Elle permet à Supabase de vérifier que le token envoyé par le frontend est valide.

## Étape 4 : Configurer le Projet Local (.env.local)

Ouvrez votre fichier `.env.local` à la racine du projet et ajoutez la **Site Key** :

```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=votre_site_key_qui_commence_par_0x...
```

_(Note : Ne mettez JAMAIS la Secret Key dans ce fichier ou dans le code frontend !)_

## Étape 5 : Configurer Supabase

C'est ici qu'on utilise la **Secret Key**.

1.  Allez sur votre [Dashboard Supabase](https://supabase.com/dashboard).
2.  Sélectionnez votre projet.
3.  Allez dans **Authentication** (icône cadenas 🔐) > **Providers**.
4.  Dépliez la section **Security (Captcha Protection)** (souvent en bas ou dans un onglet dédié selon la version de l'UI).
5.  Activez **Enable Captcha Protection**.
6.  Dans le menu déroulant "Provider", choisissez **Cloudflare Turnstile**.
7.  Dans le champ **Turnstile Secret Key**, collez la **Secret Key** obtenue à l'Étape 3.
8.  Cliquez sur **Save**.

---

## Vérification

1.  Redémarrez votre serveur de développement (`pnpm dev`).
2.  Ouvrez `http://localhost:3000`.
3.  Si vous n'êtes pas connecté, vous devriez voir l'écran "SECURITY CHECK".
4.  Le widget Turnstile devrait charger et (souvent) se valider automatiquement.
5.  Cliquez sur "ENTER SYSTEM" pour accéder au jeu.

## Dépannage

- **Erreur "Invalid domain"** : Vérifiez que `localhost` et `127.0.0.1` sont bien dans la liste des domaines autorisés sur Cloudflare Turnstile.
- **Erreur "Captcha check failed"** : Vérifiez que la **Secret Key** dans Supabase correspond bien à la **Site Key** utilisée dans `.env.local` (elles fonctionnent par paire).
