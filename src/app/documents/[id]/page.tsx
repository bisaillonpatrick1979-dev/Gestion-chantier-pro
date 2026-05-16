"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useClientStore } from "@/store/useClientStore";
import { useThemeStore } from "@/store/useThemeStore";
import DocumentWatermark from "@/components/DocumentWatermark";
import { Document, DocumentType, DocumentStatus, LineItem } from "@/types/documents";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n ?? 0);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function newLineItem(): LineItem {
  return { id: Date.now().toString() + Math.random().toString(36).slice(2), description: "", quantity: 1, unitPrice: 0, total: 0 };
}

// ── Petit composant Field réutilisable ──
function Field({
  label, value, onChange, type = "text", placeholder = "", readOnly = false,
}: {
  label: string; value: string | number;
  onChange?: (v: string) => void; type?: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type={type} value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder} readOnly={readOnly}
        style={{
          width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
          fontSize: "15px", boxSizing: "border-box", outline: "none",
          opacity: readOnly ? 0.6 : 1,
        }}
      />
    </div>
  );
}

function getWatermarkType(type: DocumentType): "FACTURE" | "DEVIS" | "CONTRAT" {
  if (type === "facture") return "FACTURE";
  if (type === "devis") return "DEVIS";
  return "CONTRAT";
}

const TYPE_LABELS: Record<DocumentType, { label: string; emoji: string }> = {
  facture: { label: "Facture", emoji: "📄" },
  devis:   { label: "Devis",   emoji: "📋" },
  contrat: { label: "Contrat", emoji: "📝" },
};

const STATUS_COLORS: Record<DocumentStatus, string> = {
  brouillon: "var(--text-muted)",
  envoye:    "#3b82f6",
  accepte:   "#22c55e",
  refuse:    "#ef4444",
  paye:      "#f59e0b",
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  brouillon: "Brouillon",
  envoye:    "Envoyé",
  accepte:   "Accepté",
  refuse:    "Refusé",
  paye:      "Payé",
};

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const isNew = docId === "new";

  const {
    documents, addDocument, updateDocument,
    updateLineItem: storeUpdateLine,
    addLineItem: storeAddLine,
    removeLineItem: storeRemoveLine,
    calculateTotals,
    updateDiscount,
    updateDeposit,
  } = useDocumentStore();

  const { company } = useCompanyStore();
  const { clients } = useClientStore();
  const { themeId } = useThemeStore();
  const isXP = themeId === "xp";

  const [activeTab, setActiveTab]       = useState<"info" | "items" | "totals" | "notes">("info");
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [saved, setSaved]               = useState(false);
  const [showPreview, setShowPreview]   = useState(false);
  const [toast, setToast]               = useState("");
  const signatureRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing]       = useState(false);

  // ── Trouver ou créer le document ──
  const [currentId, setCurrentId] = useState<string>(() => {
    if (!isNew) return docId;
    return "";
  });

  useEffect(() => {
    if (isNew && currentId === "") {
      const newDoc = addDocument("facture");
      setCurrentId(newDoc.id);
      // Remplacer l'URL sans recharger
      window.history.replaceState(null, "", `/documents/${newDoc.id}`);
    }
  }, []);

  const doc = documents.find((d) => d.id === currentId) ?? null;

  // ── Helpers de mise à jour ──
  function upd(updates: Partial<Document>) {
    if (!currentId) return;
    updateDocument(currentId, updates);
  }

  function handleLineChange(itemId: string, field: keyof LineItem, value: string | number) {
    if (!currentId) return;
    storeUpdateLine(currentId, itemId, { [field]: value });
  }

  function handleAddLine() {
    if (!currentId) return;
    storeAddLine(currentId);
  }

  function handleRemoveLine(itemId: string) {
    if (!currentId) return;
    storeRemoveLine(currentId, itemId);
  }

  function selectClient(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (!client || !currentId) return;
    updateDocument(currentId, {
      client: {
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        city: "",
        province: "AB",
        postalCode: "",
      },
    });
    setShowClientPicker(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  function handleSave() {
    setSaved(true);
    showToast("✅ Document sauvegardé!");
    setTimeout(() => { setSaved(false); router.push("/documents"); }, 1500);
  }

  function handleSendEmail() {
    if (!doc) return;
    const subject = encodeURIComponent(`${TYPE_LABELS[doc.type].label} ${doc.number} — ${company.name}`);
    const body = encodeURIComponent(
      `Bonjour ${doc.client.name || ""},\n\nVeuillez trouver ci-joint votre ${TYPE_LABELS[doc.type].label.toLowerCase()} numéro ${doc.number} d'un montant de ${formatCurrency(doc.total)}.\n\nMerci de votre confiance.\n\n${company.name}\n${company.phone || ""}\n${company.email || ""}`
    );
    const to = encodeURIComponent(doc.client.email || "");
    window.open(`mailto:${to}?subject=${subject}&body=${body}`);
    upd({ status: "envoye" });
    showToast("📧 Email ouvert — statut → Envoyé");
  }

  function handleSendSMS() {
    if (!doc) return;
    const msg = encodeURIComponent(
      `Bonjour ${doc.client.name || ""}! Votre ${TYPE_LABELS[doc.type].label.toLowerCase()} #${doc.number} de ${formatCurrency(doc.total)} est prête. — ${company.name} ${company.phone || ""}`
    );
    const phone = (doc.client.phone || "").replace(/\D/g, "");
    window.open(`sms:${phone}?body=${msg}`);
    showToast("💬 SMS ouvert");
  }

  function handlePrint() {
    window.print();
  }

  // ── Loading state ──
  if (!doc) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--text-muted)", fontSize: "15px" }}>
        Chargement...
      </div>
    );
  }

  const watermarkType = getWatermarkType(doc.type);

  // ── Styles ──
  const cardStyle: React.CSSProperties = {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "12px", padding: "16px", marginBottom: "14px",
    position: "relative", overflow: "hidden",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "8px", padding: "10px 12px", color: "var(--text)",
    fontSize: "15px", boxSizing: "border-box", outline: "none",
  };

  const btnPrimary: React.CSSProperties = {
    background: isXP
      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
      : "linear-gradient(135deg, var(--primary), var(--secondary))",
    color: isXP ? "#fff" : "#000",
    border: "none", borderRadius: "10px",
    padding: "14px 20px", fontWeight: 700, fontSize: "15px", cursor: "pointer", flex: 1,
    boxShadow: isXP ? "0 0 20px rgba(168,85,247,0.4)" : "none",
  };

  const tabActiveStyle: React.CSSProperties = {
    borderBottom: isXP ? "2px solid #a855f7" : "2px solid var(--primary)",
    color: isXP ? "#a855f7" : "var(--primary)", fontWeight: 700,
  };

  const typeActiveStyle: React.CSSProperties = {
    background: isXP
      ? "linear-gradient(135deg, #7c3aed, #a855f7)"
      : "linear-gradient(135deg, var(--primary), var(--secondary))",
    color: isXP ? "#fff" : "#000", border: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", paddingBottom: "120px" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "12px", padding: "12px 20px",
          color: "var(--text)", fontSize: "14px", fontWeight: 600,
          zIndex: 999, boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => router.push("/documents")}
          style={{ background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-muted)", padding: "8px 12px", cursor: "pointer", fontSize: "14px" }}
        >
          ← Retour
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "var(--primary)" }}>
            {TYPE_LABELS[doc.type].emoji} {doc.number}
          </h1>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{company.name}</div>
        </div>
        {/* Badge statut cliquable */}
        <button
          onClick={() => setShowStatusPicker(true)}
          style={{
            padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
            background: STATUS_COLORS[doc.status] + "22",
            color: STATUS_COLORS[doc.status],
            border: "1px solid " + STATUS_COLORS[doc.status] + "44",
            cursor: "pointer",
          }}
        >
          {STATUS_LABELS[doc.status]} ▾
        </button>
      </div>

      {/* Sélecteur type — toujours visible */}
      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        {(["facture", "devis", "contrat"] as DocumentType[]).map((t) => (
          <button key={t} onClick={() => upd({ type: t })} style={{
            flex: 1, padding: "10px 4px", borderRadius: "10px", cursor: "pointer",
            fontSize: "13px", fontWeight: doc.type === t ? 700 : 400,
            ...(doc.type === t ? typeActiveStyle : { border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)" }),
          }}>
            {TYPE_LABELS[t].emoji} {TYPE_LABELS[t].label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        {[
          { id: "info",   label: "📋 Info"    },
          { id: "items",  label: "🔧 Articles" },
          { id: "totals", label: "💰 Totaux"  },
          { id: "notes",  label: "📝 Notes"   },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} style={{
            flex: 1, padding: "12px 4px", border: "none", borderBottom: "2px solid transparent",
            background: "none", cursor: "pointer", fontSize: "12px", color: "var(--text-muted)",
            ...(activeTab === tab.id ? tabActiveStyle : {}),
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px" }}>

        {/* ══════════════════════════════════════
            TAB INFO
        ══════════════════════════════════════ */}
        {activeTab === "info" && (
          <>
            {/* Bloc compagnie auto depuis Réglages */}
            <div style={{
              ...cardStyle,
              border: "1px solid var(--primary)33",
              background: isXP ? "rgba(168,85,247,0.06)" : "var(--primary)08",
              minHeight: "140px",
            }}>
              <DocumentWatermark type={watermarkType} logoUrl={company.logoUrl} companyName={company.name} opacity={0.07}/>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "11px", color: "var(--primary)", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                  {isXP ? "⭐ De (Auto — Config)" : "✨ De (Auto — Réglages)"}
                </div>
                {company.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt="Logo" style={{ width: "44px", height: "44px", objectFit: "contain", borderRadius: "6px", marginBottom: "8px", background: "#fff" }}/>
                )}
                <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "2px", color: "var(--text)" }}>{company.name}</div>
                {company.tagline && <div style={{ fontSize: "12px", color: "var(--primary)", marginBottom: "6px" }}>{company.tagline}</div>}
                <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: "1.6" }}>
                  {company.address && <div>{company.address}</div>}
                  {(company.city || company.province) && (
                    <div>{company.city}{company.city && company.province ? ", " : ""}{company.province} {company.postalCode}</div>
                  )}
                  {company.phone && <div>📞 {company.phone}</div>}
                  {company.email && <div>✉️ {company.email}</div>}
                  {company.gstNumber && <div>GST: {company.gstNumber}</div>}
                  {company.wcbNumber && <div>WCB: {company.wcbNumber}</div>}
                </div>
              </div>
            </div>

            {/* Numéro + dates */}
            <div style={cardStyle}>
              <Field
                label="Numéro de document"
                value={doc.number}
                onChange={(v) => upd({ number: v })}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <Field label="Date" value={doc.date} onChange={(v) => upd({ date: v })} type="date"/>
                <Field label="Échéance" value={doc.dueDate} onChange={(v) => upd({ dueDate: v })} type="date"/>
              </div>
            </div>

            {/* Client */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>👤 Client</span>
                <button
                  onClick={() => setShowClientPicker(true)}
                  style={{ background: "var(--success)18", border: "1px solid var(--success)44", color: "var(--success)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                >
                  👥 Choisir client
                </button>
              </div>
              <Field label="Nom" value={doc.client.name} onChange={(v) => upd({ client: { ...doc.client, name: v } })} placeholder="Nom du client"/>
              <Field label="Courriel" value={doc.client.email} onChange={(v) => upd({ client: { ...doc.client, email: v } })} type="email" placeholder="email@exemple.com"/>
              <Field label="Téléphone" value={doc.client.phone} onChange={(v) => upd({ client: { ...doc.client, phone: v } })} type="tel" placeholder="(555) 555-5555"/>
              <Field label="Adresse" value={doc.client.address} onChange={(v) => upd({ client: { ...doc.client, address: v } })} placeholder="Adresse complète"/>
            </div>

            {/* Description projet */}
            <div style={cardStyle}>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Description du projet
              </label>
              <textarea
                value={doc.notes ?? ""}
                onChange={(e) => upd({ notes: e.target.value })}
                rows={4}
                placeholder="Description des travaux..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </>
        )}

        {/* ══════════════════════════════════════
            TAB ARTICLES
        ══════════════════════════════════════ */}
        {activeTab === "items" && (
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>🔧 Articles / Services</h3>
            {doc.items.map((item, idx) => (
              <div key={item.id} style={{ background: "var(--surface)", borderRadius: "10px", padding: "14px", marginBottom: "10px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Article {idx + 1}</span>
                  {doc.items.length > 1 && (
                    <button onClick={() => handleRemoveLine(item.id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "20px", lineHeight: "1", padding: "0 4px" }}>
                      ✕
                    </button>
                  )}
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Description</label>
                  <input
                    type="text" value={item.description}
                    onChange={(e) => handleLineChange(item.id, "description", e.target.value)}
                    placeholder="Description du service..."
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Qté</label>
                    <input type="number" value={item.quantity} onChange={(e) => handleLineChange(item.id, "quantity", Number(e.target.value))} min="0" step="0.5" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Prix unit.</label>
                    <input type="number" value={item.unitPrice} onChange={(e) => handleLineChange(item.id, "unitPrice", Number(e.target.value))} min="0" step="0.01" style={inputStyle}/>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Total</label>
                    <input type="text" value={formatCurrency(item.total)} readOnly style={{ ...inputStyle, opacity: 0.6 }}/>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={handleAddLine}
              style={{ width: "100%", padding: "12px", background: "transparent", border: "2px dashed var(--border)", borderRadius: "10px", color: "var(--primary)", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
            >
              + Ajouter un article
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════
            TAB TOTAUX
        ══════════════════════════════════════ */}
        {activeTab === "totals" && (
          <>
            <div style={{ ...cardStyle, minHeight: "200px" }}>
              <DocumentWatermark type={watermarkType} logoUrl={company.logoUrl} companyName={company.name} opacity={0.05}/>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>💰 Totaux</h3>

                {/* Remise */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Remise (%)</label>
                  <input
                    type="number"
                    value={doc.discountType === "percent" ? doc.discountValue : 0}
                    onChange={(e) => { updateDiscount(currentId, "percent", Number(e.target.value)); calculateTotals(currentId); }}
                    min="0" max="100"
                    style={inputStyle}
                  />
                </div>

                {/* Dépôt */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Dépôt requis ($)</label>
                  <input
                    type="number"
                    value={doc.deposit ?? 0}
                    onChange={(e) => updateDeposit(currentId, Number(e.target.value))}
                    min="0" step="0.01"
                    style={inputStyle}
                  />
                </div>

                {/* Récapitulatif */}
                <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "16px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                    <span>Sous-total</span><span>{formatCurrency(doc.subtotal)}</span>
                  </div>
                  {doc.discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "#22c55e" }}>
                      <span>Remise</span><span>−{formatCurrency(doc.discountAmount)}</span>
                    </div>
                  )}
                  {doc.taxes.filter(t => t.enabled).map(tax => (
                    <div key={tax.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                      <span>{tax.name} ({tax.rate}%)</span>
                      <span>{formatCurrency((doc.subtotal - (doc.discountAmount ?? 0)) * tax.rate / 100)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: 800, color: "var(--primary)", marginBottom: "12px" }}>
                      <span>TOTAL</span><span>{formatCurrency(doc.total)}</span>
                    </div>
                    {(doc.deposit ?? 0) > 0 && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#3b82f6", marginBottom: "6px" }}>
                          <span>Dépôt reçu</span><span>−{formatCurrency(doc.deposit)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, color: "var(--danger)" }}>
                          <span>Solde dû</span><span>{formatCurrency(doc.balanceDue)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Infos paiement auto */}
            {(company.etransferEmail || company.bankName) && (
              <div style={{ ...cardStyle, border: "1px solid #3b82f644", background: "#3b82f608" }}>
                <div style={{ fontSize: "11px", color: "#3b82f6", letterSpacing: "0.1em", marginBottom: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                  💳 Paiement (Auto — Réglages)
                </div>
                {company.etransferEmail && (
                  <div style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Interac e-Transfer: <strong style={{ color: "var(--text)" }}>{company.etransferEmail}</strong>
                  </div>
                )}
                {company.bankName && (
                  <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                    {company.bankName}{company.bankAccount && " — Compte: " + company.bankAccount}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════
            TAB NOTES + SIGNATURE
        ══════════════════════════════════════ */}
        {activeTab === "notes" && (
          <div style={{ ...cardStyle, minHeight: "300px" }}>
            <DocumentWatermark type={watermarkType} logoUrl={company.logoUrl} companyName={company.name} opacity={0.05}/>
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>📝 Notes & Conditions</h3>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Notes pour le client</label>
                <textarea
                  value={doc.notes ?? ""}
                  onChange={(e) => upd({ notes: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Merci pour votre confiance..."
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase" }}>Conditions</label>
                <textarea
                  value={doc.terms ?? ""}
                  onChange={(e) => upd({ terms: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Conditions de paiement..."
                />
              </div>

              {/* Zone signature */}
              <div style={{ background: "var(--surface)", borderRadius: "10px", padding: "14px", border: "1px solid var(--border)" }}>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "10px", textTransform: "uppercase" }}>
                  ✍️ Zone de signature
                </label>
                <canvas
                  ref={signatureRef}
                  width={320} height={120}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", touchAction: "none", display: "block", width: "100%" }}
                  onMouseDown={() => setIsDrawing(true)}
                  onMouseUp={() => setIsDrawing(false)}
                  onMouseLeave={() => setIsDrawing(false)}
                  onMouseMove={(e) => {
                    if (!isDrawing || !signatureRef.current) return;
                    const ctx = signatureRef.current.getContext("2d");
                    if (!ctx) return;
                    const rect = signatureRef.current.getBoundingClientRect();
                    const scaleX = signatureRef.current.width / rect.width;
                    const scaleY = signatureRef.current.height / rect.height;
                    ctx.strokeStyle = isXP ? "#a855f7" : "var(--primary, #D4AF37)";
                    ctx.lineWidth = 2; ctx.lineCap = "round";
                    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                    ctx.stroke(); ctx.beginPath();
                    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
                  }}
                  onTouchStart={(e) => { e.preventDefault(); setIsDrawing(true); signatureRef.current?.getContext("2d")?.beginPath(); }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    if (!isDrawing || !signatureRef.current) return;
                    const ctx = signatureRef.current.getContext("2d");
                    if (!ctx) return;
                    const rect = signatureRef.current.getBoundingClientRect();
                    const scaleX = signatureRef.current.width / rect.width;
                    const scaleY = signatureRef.current.height / rect.height;
                    const touch = e.touches[0];
                    ctx.strokeStyle = isXP ? "#a855f7" : "var(--primary, #D4AF37)";
                    ctx.lineWidth = 2; ctx.lineCap = "round";
                    ctx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
                    ctx.stroke(); ctx.beginPath();
                    ctx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
                  }}
                  onTouchEnd={() => setIsDrawing(false)}
                />
                <button
                  onClick={() => { const ctx = signatureRef.current?.getContext("2d"); if (ctx && signatureRef.current) ctx.clearRect(0, 0, signatureRef.current.width, signatureRef.current.height); }}
                  style={{ marginTop: "8px", background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "6px", padding: "6px 14px", cursor: "pointer", fontSize: "13px" }}
                >
                  Effacer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            BOUTONS D'ACTION (toujours visibles)
        ══════════════════════════════════════ */}
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>

          {/* Ligne 1 — Sauvegarder */}
          <button style={btnPrimary} onClick={handleSave}>
            {saved ? "✅ Sauvegardé!" : "💾 Sauvegarder"}
          </button>

          {/* Ligne 2 — Email + SMS */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={handleSendEmail}
              style={{
                padding: "13px", borderRadius: "10px", cursor: "pointer",
                border: "1px solid #3b82f644",
                background: "#3b82f608",
                color: "#3b82f6", fontWeight: 700, fontSize: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              📧 Email
            </button>
            <button
              onClick={handleSendSMS}
              style={{
                padding: "13px", borderRadius: "10px", cursor: "pointer",
                border: "1px solid #22c55e44",
                background: "#22c55e08",
                color: "#22c55e", fontWeight: 700, fontSize: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              💬 SMS
            </button>
          </div>

          {/* Ligne 3 — Aperçu + Imprimer/PDF */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <button
              onClick={() => setShowPreview(true)}
              style={{
                padding: "13px", borderRadius: "10px", cursor: "pointer",
                border: "1px solid var(--primary)44",
                background: "var(--primary)08",
                color: "var(--primary)", fontWeight: 700, fontSize: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              👁️ Aperçu
            </button>
            <button
              onClick={handlePrint}
              style={{
                padding: "13px", borderRadius: "10px", cursor: "pointer",
                border: "1px solid #f59e0b44",
                background: "#f59e0b08",
                color: "#f59e0b", fontWeight: 700, fontSize: "14px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              🖨️ PDF / Imprimer
            </button>
          </div>

          {/* Ligne 4 — Supprimer */}
          <button
            onClick={() => {
              if (confirm("Supprimer ce document?")) {
                useDocumentStore.getState().deleteDocument(currentId);
                router.push("/documents");
              }
            }}
            style={{
              padding: "12px", borderRadius: "10px", cursor: "pointer",
              border: "1px solid var(--danger)44",
              background: "var(--danger)08",
              color: "var(--danger)", fontWeight: 600, fontSize: "13px",
            }}
          >
            🗑️ Supprimer ce document
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODAL — Choisir client
      ══════════════════════════════════════ */}
      {showClientPicker && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowClientPicker(false)}
        >
          <div
            style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "100%", maxHeight: "70vh", borderRadius: "20px 20px 0 0", padding: "20px", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>👥 Choisir un client</h3>
            {clients.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                Aucun client. Ajoutez-en dans Réglages.
              </p>
            ) : (
              clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client.id)}
                  style={{ display: "block", width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px", color: "var(--text)", textAlign: "left", cursor: "pointer", marginBottom: "8px" }}
                >
                  <div style={{ fontWeight: 700 }}>{client.name}</div>
                  {client.email && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{client.email}</div>}
                  {client.phone && <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{client.phone}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL — Changer statut
      ══════════════════════════════════════ */}
      {showStatusPicker && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowStatusPicker(false)}
        >
          <div
            style={{ background: "var(--surface)", border: "1px solid var(--border)", width: "100%", borderRadius: "20px 20px 0 0", padding: "20px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "var(--text)" }}>Changer le statut</h3>
            {(Object.keys(STATUS_LABELS) as DocumentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => { upd({ status: s }); setShowStatusPicker(false); showToast("Statut → " + STATUS_LABELS[s]); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", background: doc.status === s ? STATUS_COLORS[s] + "18" : "var(--card)",
                  border: "1px solid " + (doc.status === s ? STATUS_COLORS[s] + "66" : "var(--border)"),
                  borderRadius: "10px", padding: "14px", color: "var(--text)",
                  cursor: "pointer", marginBottom: "8px", fontWeight: doc.status === s ? 700 : 400,
                }}
              >
                <span>{STATUS_LABELS[s]}</span>
                {doc.status === s && <span style={{ color: STATUS_COLORS[s] }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL — Aperçu document
      ══════════════════════════════════════ */}
      {showPreview && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, overflowY: "auto" }}
          onClick={() => setShowPreview(false)}
        >
          <div
            style={{ background: "#fff", color: "#111", margin: "20px auto", maxWidth: "600px", borderRadius: "12px", padding: "32px", minHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête aperçu */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                {company.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt="Logo" style={{ width: "60px", height: "60px", objectFit: "contain", marginBottom: "8px" }}/>
                )}
                <div style={{ fontWeight: 800, fontSize: "18px" }}>{company.name}</div>
                {company.tagline && <div style={{ fontSize: "12px", color: "#666" }}>{company.tagline}</div>}
                <div style={{ fontSize: "12px", color: "#666", marginTop: "6px", lineHeight: "1.6" }}>
                  {company.address && <div>{company.address}</div>}
                  {company.city && <div>{company.city}, {company.province} {company.postalCode}</div>}
                  {company.phone && <div>{company.phone}</div>}
                  {company.email && <div>{company.email}</div>}
                  {company.gstNumber && <div>GST: {company.gstNumber}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#D4AF37", textTransform: "uppercase" }}>
                  {TYPE_LABELS[doc.type].label}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>{doc.number}</div>
                <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Date: {doc.date}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Échéance: {doc.dueDate}</div>
              </div>
            </div>

            {/* Client */}
            <div style={{ background: "#f8f8f8", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.05em" }}>Facturer à</div>
              <div style={{ fontWeight: 700 }}>{doc.client.name || "—"}</div>
              {doc.client.email && <div style={{ fontSize: "13px", color: "#555" }}>{doc.client.email}</div>}
              {doc.client.phone && <div style={{ fontSize: "13px", color: "#555" }}>{doc.client.phone}</div>}
              {doc.client.address && <div style={{ fontSize: "13px", color: "#555" }}>{doc.client.address}</div>}
            </div>

            {/* Articles */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
              <thead>
                <tr style={{ background: "#111", color: "#fff" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "12px" }}>Description</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "12px" }}>Qté</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "12px" }}>Prix unit.</th>
                  <th style={{ padding: "10px 12px", textAlign: "right", fontSize: "12px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((item, i) => (
                  <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f8f8" }}>
                    <td style={{ padding: "10px 12px", fontSize: "13px" }}>{item.description || "—"}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center", fontSize: "13px" }}>{item.quantity}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "13px" }}>{formatCurrency(item.unitPrice)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontSize: "13px", fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux aperçu */}
            <div style={{ marginLeft: "auto", maxWidth: "260px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                <span style={{ color: "#666" }}>Sous-total</span><span>{formatCurrency(doc.subtotal)}</span>
              </div>
              {doc.discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#22c55e" }}>
                  <span>Remise</span><span>−{formatCurrency(doc.discountAmount)}</span>
                </div>
              )}
              {doc.taxes.filter(t => t.enabled).map(tax => (
                <div key={tax.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", color: "#666" }}>
                  <span>{tax.name} ({tax.rate}%)</span>
                  <span>{formatCurrency((doc.subtotal - (doc.discountAmount ?? 0)) * tax.rate / 100)}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #111", paddingTop: "10px", marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: 800 }}>
                <span>TOTAL</span><span style={{ color: "#D4AF37" }}>{formatCurrency(doc.total)}</span>
              </div>
              {(doc.deposit ?? 0) > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "13px", color: "#3b82f6" }}>
                    <span>Dépôt</span><span>−{formatCurrency(doc.deposit)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontSize: "15px", fontWeight: 700, color: "#ef4444" }}>
                    <span>Solde dû</span><span>{formatCurrency(doc.balanceDue)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            {doc.notes && (
              <div style={{ marginTop: "24px", padding: "14px", background: "#f8f8f8", borderRadius: "8px", fontSize: "13px", color: "#444" }}>
                <div style={{ fontSize: "11px", color: "#888", textTransform: "uppercase", marginBottom: "6px" }}>Notes</div>
                {doc.notes}
              </div>
            )}

            {/* Paiement */}
            {(company.etransferEmail || company.bankName) && (
              <div style={{ marginTop: "16px", padding: "14px", background: "#f0f9ff", borderRadius: "8px", fontSize: "13px", color: "#444" }}>
                <div style={{ fontSize: "11px", color: "#3b82f6", textTransform: "uppercase", marginBottom: "6px" }}>Paiement</div>
                {company.etransferEmail && <div>Interac e-Transfer: <strong>{company.etransferEmail}</strong></div>}
                {company.bankName && <div>{company.bankName}{company.bankAccount && " — " + company.bankAccount}</div>}
              </div>
            )}

            <div style={{ marginTop: "24px", display: "flex", gap: "10px" }}>
              <button onClick={() => setShowPreview(false)} style={{ flex: 1, padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                ✕ Fermer
              </button>
              <button onClick={handlePrint} style={{ flex: 1, padding: "12px", background: "#D4AF37", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>
                🖨️ Imprimer / PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
