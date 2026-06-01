import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, sessionId } = await req.json();

  // Crée une session si nouvelle conversation
  let sid: string = sessionId;
  if (!sid) {
    const vaultIds = process.env.VAULT_ID ? [process.env.VAULT_ID] : [];
    const session = await client.beta.sessions.create({
      agent: process.env.AGENT_ID!,
      environment_id: process.env.ENVIRONMENT_ID!,
      ...(vaultIds.length > 0 && { vault_ids: vaultIds }),
      title: "Session utilisateur",
    });
    sid = session.id;
  }

  // Envoie le message
  await client.beta.sessions.events.send(sid, {
    events: [{ type: "user.message", content: [{ type: "text", text: message }] }],
  });

  // Collecte la réponse
  let response = "";
  for await (const event of await client.beta.sessions.events.stream(sid)) {
    if (event.type === "agent.message") {
      for (const block of event.content ?? []) {
        if (block.type === "text") response += block.text;
      }
    }
    if (event.type === "session.status_idle") break;
  }

  return NextResponse.json({ response, sessionId: sid });
}
