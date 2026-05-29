# Reorganisation professionnelle — Gestion Chantier Pro

## Objectif

Transformer l'application en vraie application de gestion chantier professionnelle, inspiree des patterns de Procore, Jobber, QuickBooks Time, Invoice2go, Zoho People et applications field-service modernes.

L'objectif n'est pas d'empiler des modules. L'objectif est d'avoir deux experiences propres :

1. **Admin / Bureau** : gestion entreprise, clients, employes, sous-traitants, projets, devis, contrats, factures, paiements, catalogue, comptabilite, statistiques, recompenses, reglages, conformite.
2. **Employe / Terrain** : punch in, punch out, pauses, calendrier personnel, statistiques personnelles, profil, factures personnelles de sous-traitant, photos, chantier assigne, recompenses personnelles.

Les employes ne doivent jamais voir les donnees sensibles d'administration : factures globales, profits, contrats, clients complets, couts des autres employes, paie des autres, comptabilite ou reglages admin.

---

## References fonctionnelles a respecter

### Procore / logiciels chantier
- Dashboard par projet.
- Navigation par modules.
- Documents, photos, taches, finances et equipe relies au chantier.
- Vue consolidee mais details ouverts dans des ecrans secondaires.

### QuickBooks Time / time tracking
- Punch simple et visible.
- GPS/geofence.
- Temps par employe/projet.
- Feuilles de temps et paie.

### Jobber / field service
- Client -> job -> quote/estimate -> invoice -> payment.
- Workflow simple, cartes compactes, actions rapides.
- Envoi par email/SMS.

### Invoice2go / facturation mobile
- Devis/factures propres.
- Logo, signature, taxe, remise, depot.
- Preview avant envoi.
- PDF partageable.

### Zoho People / RH
- Profil employe complet.
- Donnees personnelles, contact urgence, type employe/sous-traitant.
- Onboarding, documents et autorisations.

---

## Nouvelle structure d'ecrans recommandee

### 1. Choix d'espace
Au demarrage apres onboarding/legal :

- **Admin / Bureau**
- **Employe / Terrain**

L'espace Admin est accessible seulement si l'utilisateur est role `admin`.
L'espace Employe est limite a l'utilisateur connecte.

---

## Admin / Bureau

### Tableau de bord
Cartes visibles :
- revenus du mois;
- factures a envoyer;
- paiements en retard;
- heures a approuver;
- chantiers actifs;
- profit estime;
- employes actifs aujourd'hui;
- alertes GPS/punch.

### Clients
Liste compacte :
- nom personne ou compagnie;
- telephone;
- statut;
- dernier chantier.

Au clic : fiche client en popup/ecran detail avec :
- type client : particulier ou compagnie;
- contact principal;
- adresse;
- email;
- telephone;
- projets lies;
- devis/factures lies;
- notes.

### Employes
Liste compacte :
- nom;
- role;
- statut;
- punch actuel.

Au clic : fiche detail :
- infos personnelles;
- NAS/SIN si necessaire;
- contact urgence;
- statut salarie/sous-traitant;
- taux horaire/pi2/job;
- deductions/avantages;
- WCB/liabilite/GST si sous-traitant;
- calendrier;
- heures;
- paie;
- documents.

### Sous-traitants
Peuvent etre dans Employes avec type `contractor`, ou dans un sous-module filtre.
Ils doivent pouvoir generer une facture vers l'entreprise.

### Chantiers / Projets
Liste compacte :
- nom/adresse;
- client;
- statut;
- date prevue;
- equipe assignee.

Detail :
- adresse;
- rayon GPS 25 m;
- checklist;
- photos;
- punchs;
- extras;
- depenses;
- devis/contrat/facture;
- profit.

### Documents
Sous-onglets :
- Devis;
- Contrats;
- Factures.

Chaque document doit avoir :
- preview PDF;
- logo de l'entreprise;
- watermark/filigrane;
- lignes de main-d'oeuvre;
- lignes catalogue;
- photos optionnelles;
- taxe configurable;
- remise;
- depot;
- signature tactile;
- date signature;
- bouton envoyer email;
- bouton envoyer texto/SMS;
- bouton telecharger PDF.

### Catalogue
Materiaux/services/extras :
- nom;
- unite : heure, unite, pi2, pied lineaire, boite, rouleau, forfait;
- prix;
- taxable oui/non;
- categorie.

### Comptabilite
- paiements recus;
- depenses;
- locations;
- paie;
- profit par chantier;
- rapports.

### Statistiques
- revenus;
- depenses;
- profit;
- heures;
- performance par employe/equipe;
- performance par chantier;
- calendrier coloré.

---

## Employe / Terrain

L'employe voit seulement :
- son punch;
- son chantier assigne;
- ses pauses;
- son calendrier;
- ses heures;
- ses statistiques;
- son profil;
- ses recompenses;
- ses factures s'il est sous-traitant.

Il ne voit pas :
- profits;
- contrats clients globaux;
- factures admin globales;
- comptabilite;
- autres employes;
- couts internes;
- reglages admin.

### Ecran principal employe
- chantier du jour;
- adresse;
- statut GPS : dans la zone / hors zone;
- punch in/out;
- pause;
- chronometre temps;
- chronometre argent;
- instructions;
- photos avant/apres;
- soumettre journee.

### Calendrier employe
- mois courant;
- navigation mois passe/futur;
- couleurs tres distinctes :
  - 0-2h tres petite journee;
  - 2-4h petite journee;
  - 4-6h demi-journee;
  - 6-8h journee normale;
  - 8-10h grosse journee;
  - 10-12h tres grosse journee;
  - 12h+ journee explosive.
- clic sur jour : detail complet.

### Facture sous-traitant
Si type contractor :
- profil compagnie/personne;
- logo;
- GST ou SIN selon cas;
- WCB;
- liabilite;
- facture PDF;
- signature tactile;
- envoyer a l'entreprise par email/SMS.

---

## Architecture technique recommandee

### Routes Next.js

- `/` : choix espace / redirect selon session
- `/admin` : tableau de bord admin
- `/admin/clients`
- `/admin/workers`
- `/admin/projects`
- `/admin/documents`
- `/admin/catalog`
- `/admin/accounting`
- `/admin/reports`
- `/admin/settings`
- `/worker`
- `/worker/punch`
- `/worker/calendar`
- `/worker/profile`
- `/worker/invoices`

### Composants UI

- `AppShell`
- `AdminShell`
- `WorkerShell`
- `EntityList`
- `EntityCard`
- `DetailDrawer`
- `SmartForm`
- `SignaturePad`
- `PdfPreview`
- `SendDocumentActions`
- `RoleGuard`

### Securite

En local : masquer UI selon role.
Avec Supabase : RLS obligatoire.

Regles :
- admin voit l'entreprise complete;
- worker voit seulement ses propres donnees;
- contractor voit ses propres punchs/factures/profil;
- aucune donnees sensibles admin ne doit etre chargee dans l'interface worker.

---

## Priorites de refactor

1. Separer clairement AdminShell et WorkerShell.
2. Creer RoleGuard.
3. Refactor Clients/Employes/Projets en listes compactes + detail drawer.
4. Creer module documents : devis/contrats/factures.
5. Ajouter SignaturePad tactile reutilisable.
6. Ajouter PDF preview + export PDF.
7. Ajouter email/SMS/share.
8. Mettre le logo et watermark par entreprise/sous-traitant.
9. Remplacer les modules rapides empiles par vrais ecrans/modules.
10. Ajouter RLS Supabase pour multi-entreprise et roles.

---

## Decision importante

Le repo `gestion-chantier-pro` est la bonne base principale. Les patchs rapides du repo `Codexgpt-v1-gestion` ne doivent pas devenir l'architecture finale.

