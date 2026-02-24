# Code Review: Story 5.2 - Vote d'Exclusion & Réputation

**Date:** 2026-02-24
**Reviewer:** BMAD Adversarial Agent
**Story:** 5-2-vote-exclusion-vote-kick-reputation.md
**Status:** 🔴 CHANGES REQUESTED

## 🚨 Critical Findings

### 1. Faille Logique dans `castVote` (Security & Logic)
**File:** `src/app/actions/game-actions.ts`
**Severity:** CRITICAL
**Description:**
L'action serveur `castVote` ne vérifie pas si le votant est la cible (`target_id`).
La logique de clôture du vote repose sur `totalVotes >= eligibleVoters` (où `eligibleVoters = totalPlayers - 1`).
Si la cible vote "Non" (via l'API ou en modifiant le client), elle incrémente `totalVotes` sans incrémenter `yesVotes`. Cela peut provoquer la clôture prématurée du vote en statut `rejected` car le système pense que "tous les votants éligibles ont voté".
**Fix Required:**
Ajouter une vérification dans `castVote`:
```typescript
if (user.id === session.target_id) {
  throw new Error("La cible ne peut pas voter.");
}
```

### 2. Validation Manquante dans `initiateVoteKick` (Security)
**File:** `src/app/actions/game-actions.ts`
**Severity:** CRITICAL
**Description:**
`initiateVoteKick` ne vérifie pas si `targetId` est réellement un joueur de la partie (`gameId`).
Un utilisateur malveillant peut lancer des votes contre des utilisateurs qui ne sont pas dans la partie, créant du spam de sessions de vote.
**Fix Required:**
Vérifier l'existence de la relation dans `game_players`:
```typescript
const { data: isPlayer } = await supabase.from('game_players').select('player_id').eq('game_id', gameId).eq('player_id', targetId).single();
if (!isPlayer) throw new Error("Ce joueur n'est pas dans la partie.");
```

## 🔴 High Severity Findings

### 3. Reset de Réputation Incorrect (Business Logic)
**File:** `src/app/actions/game-actions.ts` (`checkPlayerReputation`)
**Severity:** HIGH
**Description:**
Le code archive *toutes* les sessions de kick (`status: 'archived'`) après le délai de bannissement de 30 minutes.
Cela remet le compteur de réputation à 0 pour l'utilisateur.
La Story demande : *"Calculer le nombre d'exclusions actives sur une période glissante de 7 jours"*.
En archivant, on perd l'historique pour le calcul des "7 jours glissants". Le joueur perd son indicateur "⚠️" immédiatement après son dé-bannissement.
**Fix Required:**
Ne pas changer le statut en 'archived'. Utiliser uniquement la date `created_at` pour vérifier si le ban de 30 min est actif. Le calcul de réputation (7 jours) doit rester indépendant du ban temporaire.

### 4. Fuite d'Information via RLS (Privacy)
**File:** `supabase/migrations/20260224000002_fix_kick_sessions_rls_visibility.sql`
**Severity:** HIGH
**Description:**
La policy `View all kick sessions` utilise `USING (true)`.
Cela permet à n'importe quel utilisateur authentifié de voir *tous* les votes d'exclusion de *toutes* les parties en cours sur la plateforme.
**Fix Required:**
Restreindre la vue aux parties où l'utilisateur est présent (via `game_players`) ou accepter le risque (mais doit être documenté).

## 🟡 Medium Severity Findings

### 5. Manque de Transparence pour la Cible (UX/Requirement)
**File:** `src/components/game/vote-kick-manager.tsx` & `src/hooks/use-vote-kick.ts`
**Severity:** MEDIUM
**Description:**
Le code masque totalement la modale de vote pour la cible (`if (data.target_id === currentUserId) return;`).
La Story dit : *"tous les joueurs reçoivent une notification interactive"*.
Ne pas informer la cible qu'elle est en train d'être exclue est une UX discutable (le joueur est exclu soudainement sans préavis).
**Fix Required:**
Afficher une version "lecture seule" de la modale pour la cible (ex: "Vote en cours contre vous..."), sans les boutons de vote.

### 6. Incohérence des Seuils (Consistency)
**File:** `src/app/actions/game-actions.ts`
**Severity:** MEDIUM
**Description:**
- Story: Indicateur si > 3 exclusions.
- Code (`getPlayersReputation`): Warning si > 2 (donc 3+). (OK)
- Code (`checkPlayerReputation`): Ban si > 5. (Pourquoi 5 ? La story ne mentionne pas de seuil de ban spécifique, mais l'incohérence est notable).

## ✅ Verification Checklist

- [ ] Table `player_reports` created: **YES**
- [ ] UI Vote implemented: **YES**
- [ ] Realtime Notification: **YES** (sauf cible)
- [ ] Logic Majorité (>50%): **YES**
- [ ] Action Exclusion (Kick + Redirection): **YES**
- [ ] Système Réputation (7 jours): **PARTIAL** (Reset incorrect)
- [ ] Indicateur Visuel (⚠️): **YES**

## 🏁 Recommendation

Refuser la Story tant que les failles de sécurité (1 & 2) et le problème de logique métier (3) ne sont pas corrigés.
