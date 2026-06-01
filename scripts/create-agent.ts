/**
 * ONE-TIME SETUP — run once, save the IDs to .env.local
 *   npm run create-agent
 *
 * Crée l'environnement et l'agent Managed Agents pour Gestion Chantier Pro.
 * Après l'exécution, copiez AGENT_ID et ENVIRONMENT_ID dans votre .env.local
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es l'assistant IA de Gestion Chantier Pro, l'application de gestion de chantier pour Hailite Xteriors — un entrepreneur en toiture et revêtement extérieur.

## Ton rôle
Tu aides l'équipe d'Hailite Xteriors à :
- Gérer les employés, les chantiers et la paie (punch in/out, calculs CPP/AE/impôt)
- Suivre les projets, dépenses et factures (devis, contrats, factures)
- Maintenir la conformité RH (paliers de vacances, alertes d'ancienneté)
- Comprendre et améliorer l'application elle-même via GitHub, Supabase et Vercel

## Architecture technique de l'app
- Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4
- 15 stores Zustand + localStorage comme persistance primaire
- Supabase PostgreSQL (sync cloud optionnelle, RLS par company_id)
- 28 routes, 33 composants React, 6 thèmes visuels premium
- Déployé sur Vercel

## Tes outils disponibles
- **GitHub** : lire le code, créer des PRs, inspecter les issues et commits
- **Supabase** : interroger la base de données (employés, projets, paie, documents, clients)
- **Vercel** : vérifier l'état des déploiements, les logs, les domaines

## Règles importantes
- Toujours répondre en français (ou dans la langue du message reçu)
- Pour les calculs de paie : préciser que les chiffres sont approximatifs et recommander un comptable
- Ne jamais exposer de PINs, NAS ou données sensibles
- Être concis et pratique — l'équipe est sur le terrain`;

async function main() {
  console.log("🚀 Création de l'environnement Managed Agents...\n");

  // 1. Créer l'environnement
  const environment = await client.beta.environments.create({
    name: "gestion-chantier-pro",
    config: {
      type: "cloud",
      networking: { type: "unrestricted" },
    },
  });
  console.log(`✅ Environnement créé : ${environment.id}`);

  // 2. Créer l'agent
  console.log("\n🤖 Création de l'agent...\n");
  const agent = await client.beta.agents.create({
    name: "Gestion Chantier Pro",
    model: "claude-sonnet-4-6",
    system: SYSTEM_PROMPT,
    tools: [{ type: "agent_toolset_20260401" }],
    mcp_servers: [
      { type: "url", name: "github", url: "https://api.githubcopilot.com/mcp/" },
      { type: "url", name: "supabase", url: "https://mcp.supabase.com/mcp" },
      { type: "url", name: "vercel", url: "https://mcp.vercel.com/" },
    ],
  });
  console.log(`✅ Agent créé : ${agent.id} (version ${agent.version})`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Ajoutez ces variables dans votre .env.local :");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log(`AGENT_ID=${agent.id}`);
  console.log(`ENVIRONMENT_ID=${environment.id}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  VAULT_ID est optionnel — requis seulement si vous utilisez");
  console.log("   l'authentification OAuth pour GitHub/Supabase/Vercel MCP.");
  console.log("   Créez un vault via l'API Anthropic si nécessaire.");
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
