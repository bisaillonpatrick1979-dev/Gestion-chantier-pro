"use client";

import { useState } from "react";
import { useCompanyStore } from "@/store/useCompanyStore";
import { useEmployeeStore } from "@/store/useEmployeeStore";

const ALL_THEMES = [
  { id: "dark", label: "Nuit Professionnelle", emoji: "🌙", preview: "#1a1a2e" },
  { id: "light", label: "Blanc Epure", emoji: "☀️", preview: "#f8f8f8" },
  { id: "blue", label: "Bleu Acier", emoji: "🔵", preview: "#0f2d4a" },
  { id: "green", label: "Foret Industriel", emoji: "🌲", preview: "#1a2e1a" },
  { id: "red", label: "Rouge Chantier", emoji: "🔴", preview: "#2e1a1a" },
  { id: "deco", label: "Art Deco Prestige", emoji: "✨", preview: "#1a1400" },
];

type SectionId = "company" | "contact" | "legal" | "payment" | "billing" | "employees" | "theme" | "numbering" | "danger";

interface Section {
  id: SectionId;
  emoji: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: "company", emoji: "🏢", label: "Compagnie" },
  { id: "contact", emoji: "📞", label: "Contact" },
  { id: "legal", emoji: "📋", label: "Legal & Taxes" },
  { id: "payment", emoji: "💳", label: "Paiement" },
  { id: "billing", emoji: "🧾", label: "Facturation" },
  { id: "employees", emoji: "👷", label: "Employes" },
  { id: "theme", emoji: "🎨", label: "Theme" },
  { id: "numbering", emoji: "🔢", label: "Numerotation" },
  { id: "danger", emoji: "⚠️", label: "Zone Danger" },
];

const card: React.CSSProperties = {
  background: "var(--card-bg, #1e1e1e)",
  border: "1px solid var(--border, #2a2a2a)",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--input-bg, #111)",
  border: "1px solid var(--border, #333)",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "var(--text, #fff)",
  fontSize: "15px",
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  color: "#888",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const btnGold: React.CSSProperties = {
  background: "linear-gradient(135deg, #D4AF37, #B8963E)",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  width: "100%",
};

const btnDanger: React.CSSProperties = {
  background: "#7f1d1d",
  color: "#fca5a5",
  border: "1px solid #991b1b",
  borderRadius: "10px",
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: "15px",
  cursor: "pointer",
  width: "100%",
  marginTop: "8px",
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { company, updateCompany, resetNumbering } = useCompanyStore();
  const { employees, deleteEmployee, currentEmployeeId } = useEmployeeStore();
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId) ?? null;

  const [activeSection, setActiveSection] = useState<SectionId>("company");
  const [saved, setSaved] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");

  const isAdmin = currentEmployee?.role === "admin";

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function applyTheme(themeId: string) {
    setCurrentTheme(themeId);
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-theme", themeId);
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("gcp-theme", themeId);
    }
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#888" }}>
        <p style={{ fontSize: "48px" }}>🔒</p>
        <p>Acces reserve a l&apos;administrateur</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg, #111)", color: "var(--text, #fff)", paddingBottom: "80px" }}>

      <div style={{ padding: "20px 16px 0", borderBottom: "1px solid var(--border, #222)", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, margin: 0, color: "#D4AF37" }}>
          Reglages
        </h1>
      </div>

      <div style={{ display: "flex", overflowX: "auto", gap: "8px", padding: "0 16px 12px", scrollbarWidth: "none" }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: "20px",
              border: activeSection === s.id ? "none" : "1px solid #333",
              background: activeSection === s.id ? "linear-gradient(135deg,#D4AF37,#B8963E)" : "transparent",
              color: activeSection === s.id ? "#000" : "#aaa",
              fontWeight: activeSection === s.id ? 700 : 400,
              fontSize: "13px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px" }}>

        {activeSection === "company" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Informations Compagnie</h2>
            <Field label="Nom de la compagnie" value={company.name} onChange={(v) => updateCompany({ name: v })} />
            <Field label="Slogan" value={company.tagline} onChange={(v) => updateCompany({ tagline: v })} />
            <Field label="Nom du proprietaire" value={company.ownerName} onChange={(v) => updateCompany({ ownerName: v })} />
            <button style={btnGold} onClick={save}>{saved ? "Sauvegarde!" : "Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "contact" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Coordonnees</h2>
            <Field label="Adresse" value={company.address} onChange={(v) => updateCompany({ address: v })} />
            <Field label="Ville" value={company.city} onChange={(v) => updateCompany({ city: v })} />
            <Field label="Province" value={company.province} onChange={(v) => updateCompany({ province: v })} />
            <Field label="Code postal" value={company.postalCode} onChange={(v) => updateCompany({ postalCode: v })} />
            <Field label="Telephone" value={company.phone} onChange={(v) => updateCompany({ phone: v })} type="tel" />
            <Field label="Courriel" value={company.email} onChange={(v) => updateCompany({ email: v })} type="email" />
            <Field label="Site web" value={company.website} onChange={(v) => updateCompany({ website: v })} />
            <button style={btnGold} onClick={save}>{saved ? "Sauvegarde!" : "Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "legal" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Legal & Taxes (Alberta)</h2>
            <div style={{ background: "#1a2010", border: "1px solid #3a5a20", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#86efac" }}>
              Alberta = GST 5% seulement (pas de PST/HST). WCB pour assurance employes.
            </div>
            <Field label="Numero GST/HST (5% Alberta)" value={company.gstNumber} onChange={(v) => updateCompany({ gstNumber: v })} placeholder="123456789 RT 0001" />
            <Field label="Numero WCB" value={company.wcbNumber} onChange={(v) => updateCompany({ wcbNumber: v })} />
            <Field label="Numero d'entreprise (CRA)" value={company.businessNumber} onChange={(v) => updateCompany({ businessNumber: v })} />
            <button style={btnGold} onClick={save}>{saved ? "Sauvegarde!" : "Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "payment" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Informations de Paiement</h2>
            <Field label="Courriel Interac e-Transfer" value={company.etransferEmail} onChange={(v) => updateCompany({ etransferEmail: v })} type="email" />
            <Field label="Nom de la banque" value={company.bankName} onChange={(v) => updateCompany({ bankName: v })} />
            <Field label="Numero de transit" value={company.bankTransit} onChange={(v) => updateCompany({ bankTransit: v })} />
            <Field label="Numero de compte" value={company.bankAccount} onChange={(v) => updateCompany({ bankAccount: v })} />
            <button style={btnGold} onClick={save}>{saved ? "Sauvegarde!" : "Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "billing" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Parametres Facturation</h2>
            <Field label="Depot requis (%)" value={company.defaultDepositPercent} onChange={(v) => updateCompany({ defaultDepositPercent: Number(v) })} type="number" />
            <Field label="Delai de paiement (jours)" value={company.defaultPaymentTermsDays} onChange={(v) => updateCompany({ defaultPaymentTermsDays: Number(v) })} type="number" />
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Notes par defaut</label>
              <textarea value={company.defaultNotes} onChange={(e) => updateCompany({ defaultNotes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <button style={btnGold} onClick={save}>{saved ? "Sauvegarde!" : "Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "employees" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Gestion des Employes</h2>
            {employees.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px 0" }}>Aucun employe enregistre</p>
            ) : (
              employees.map((emp) => (
                <div key={emp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#111", borderRadius: "8px", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{emp.name}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      {emp.role === "admin" ? "Admin" : "Employe"} {emp.hourlyRate ? " • $" + emp.hourlyRate + "/h" : ""}
                    </div>
                  </div>
                  {emp.role !== "admin" && (
                    <button
                      onClick={() => {
                        if (confirm("Supprimer " + emp.name + "?")) {
                          deleteEmployee(emp.id);
                        }
                      }}
                      style={{ background: "#7f1d1d", color: "#fca5a5", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === "theme" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Theme de l&apos;application</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {ALL_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  style={{ background: theme.preview, border: currentTheme === theme.id ? "2px solid #D4AF37" : "2px solid transparent", borderRadius: "10px", padding: "16px 12px", cursor: "pointer", textAlign: "left", color: "#fff" }}
                >
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{theme.emoji}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>{theme.label}</div>
                  {currentTheme === theme.id && <div style={{ fontSize: "11px", color: "#D4AF37", marginTop: "4px" }}>Actif</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeSection === "numbering" && (
          <div style={card}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px" }}>Numerotation des Documents</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <Field label="Prefixe Facture" value={company.invoicePrefix} onChange={(v) => updateCompany({ invoicePrefix: v })} placeholder="FAC" />
              <Field label="Prochain # Facture" value={company.nextInvoiceNumber} onChange={(v) => updateCompany({ nextInvoiceNumber: Number(v) })} type="number" />
              <Field label="Prefixe Devis" value={company.quotePrefix} onChange={(v) => updateCompany({ quotePrefix: v })} placeholder="DEV" />
              <Field label="Prochain # Devis" value={company.nextQuoteNumber} onChange={(v) => updateCompany({ nextQuoteNumber: Number(v) })} type="number" />
              <Field label="Prefixe Contrat" value={company.contractPrefix} onChange={(v) => updateCompany({ contractPrefix: v })} placeholder="CTR" />
              <Field label="Prochain # Contrat" value={company.nextContractNumber} onChange={(v) => updateCompany({ nextContractNumber: Number(v) })} type="number" />
            </div>
            <div style={{ background: "#111", borderRadius: "8px", padding: "12px", marginBottom: "12px", fontSize: "13px", color: "#aaa" }}>
              Exemple: <strong style={{ color: "#D4AF37" }}>{company.invoicePrefix}-{String(company.nextInvoiceNumber).padStart(3, "0")}</strong>
            </div>
            <button style={btnGold} onClick={save}>{saved ? "Sauvegarde!" : "Sauvegarder"}</button>
          </div>
        )}

        {activeSection === "danger" && (
          <div style={{ ...card, borderColor: "#7f1d1d" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, marginTop: 0, marginBottom: "16px", color: "#fca5a5" }}>Zone Danger</h2>
            <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Ces actions sont irreversibles.</p>
            <button style={btnDanger} onClick={() => {
              if (confirm("Reinitialiser la numerotation? Les prochains numeros repartiront a 001.")) {
                resetNumbering();
                alert("Numerotation reinitialisee.");
              }
            }}>
              Reinitialiser numerotation (001)
            </button>
            <button style={{ ...btnDanger, marginTop: "12px" }} onClick={() => {
              if (confirm("ATTENTION: Effacer TOUTES les donnees de la compagnie?")) {
                updateCompany({ name: "Hailite Xteriors", tagline: "", address: "", city: "", phone: "", email: "", gstNumber: "", wcbNumber: "", businessNumber: "", etransferEmail: "" });
                alert("Donnees reinitialisees.");
              }
            }}>
              Reinitialiser infos compagnie
            </button>
          </div>
        )}

      </div>
    </div>
  );
  }
