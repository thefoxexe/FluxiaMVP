"use client";

import React, { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

type Item = { id: string; description: string; quantity: number; unit_price: number; total: number };
type Invoice = {
  id: string; number: string; status: string; subtotal: number; tax_rate: number;
  tax_amount: number; total: number; due_date: string | null; notes: string | null;
  created_at: string; payment_reference: string | null;
  invoice_items: Item[];
  contacts: { name: string; email: string | null; company: string | null; address: string | null } | null;
};

const fmt = (v: number, currency = "CHF") =>
  new Intl.NumberFormat("fr-CH", { style: "currency", currency, minimumFractionDigits: 2 }).format(v);

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("fr-CH", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const TEMPLATES = ["moderne", "classique", "minimaliste"] as const;
type Template = (typeof TEMPLATES)[number];

function ModerneTemplate({ invoice, profile }: { invoice: Invoice; profile: Profile }) {
  const currency = profile.company_currency || "CHF";
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", background: "#fff", minHeight: "297mm", width: "210mm", margin: "0 auto", padding: 0, color: "#111" }}>
      {/* Header */}
      <div style={{ background: "#059669", padding: "36px 48px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            {profile.company_logo_url && (
              <img src={profile.company_logo_url} alt="Logo" style={{ height: 48, marginBottom: 12, filter: "brightness(0) invert(1)" }} />
            )}
            <div style={{ fontSize: 22, fontWeight: 700 }}>{profile.company_name || "Votre Entreprise"}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4, lineHeight: 1.6 }}>
              {profile.company_address && <div>{profile.company_address}</div>}
              {(profile.company_zip || profile.company_city) && <div>{[profile.company_zip, profile.company_city].filter(Boolean).join(" ")}</div>}
              {profile.company_vat && <div>TVA: {profile.company_vat}</div>}
              {profile.company_email && <div>{profile.company_email}</div>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>FACTURE</div>
            <div style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>{invoice.number}</div>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", padding: "24px 48px", borderBottom: "1px solid #e5e7eb", gap: 48 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>Facturé à</div>
          {invoice.contacts ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{invoice.contacts.name}</div>
              {invoice.contacts.company && <div style={{ fontSize: 13, color: "#374151" }}>{invoice.contacts.company}</div>}
              {invoice.contacts.address && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{invoice.contacts.address}</div>}
              {invoice.contacts.email && <div style={{ fontSize: 12, color: "#059669" }}>{invoice.contacts.email}</div>}
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Client non spécifié</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>Détails</div>
          <table style={{ fontSize: 12, color: "#374151", marginLeft: "auto" }}>
            <tbody>
              <tr><td style={{ paddingRight: 16, color: "#9ca3af", paddingBottom: 4 }}>Date d'émission</td><td style={{ fontWeight: 500 }}>{fmtDate(invoice.created_at)}</td></tr>
              <tr><td style={{ paddingRight: 16, color: "#9ca3af", paddingBottom: 4 }}>Échéance</td><td style={{ fontWeight: 500, color: invoice.due_date && new Date(invoice.due_date) < new Date() ? "#ef4444" : "inherit" }}>{fmtDate(invoice.due_date)}</td></tr>
              {invoice.payment_reference && <tr><td style={{ paddingRight: 16, color: "#9ca3af" }}>Référence</td><td style={{ fontWeight: 500 }}>{invoice.payment_reference}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Items table */}
      <div style={{ padding: "24px 48px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280", fontWeight: 600, borderBottom: "2px solid #059669" }}>Description</th>
              <th style={{ textAlign: "center", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280", fontWeight: 600, borderBottom: "2px solid #059669", width: 70 }}>Qté</th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280", fontWeight: 600, borderBottom: "2px solid #059669", width: 110 }}>Prix unit.</th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color: "#6b7280", fontWeight: 600, borderBottom: "2px solid #059669", width: 110 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoice_items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ padding: "12px", fontSize: 13, borderBottom: "1px solid #f3f4f6" }}>{item.description}</td>
                <td style={{ padding: "12px", fontSize: 13, textAlign: "center", borderBottom: "1px solid #f3f4f6", color: "#6b7280" }}>{item.quantity}</td>
                <td style={{ padding: "12px", fontSize: 13, textAlign: "right", borderBottom: "1px solid #f3f4f6", color: "#6b7280" }}>{fmt(item.unit_price, currency)}</td>
                <td style={{ padding: "12px", fontSize: 13, textAlign: "right", borderBottom: "1px solid #f3f4f6", fontWeight: 600 }}>{fmt(item.total, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <div style={{ minWidth: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
              <span>Sous-total</span><span>{fmt(invoice.subtotal, currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
              <span>TVA ({invoice.tax_rate}%)</span><span>{fmt(invoice.tax_amount, currency)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", fontSize: 18, fontWeight: 800, background: "#059669", color: "#fff", borderRadius: 8, marginTop: 8 }}>
              <span>TOTAL</span><span>{fmt(invoice.total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ marginTop: 32, padding: 16, background: "#f9fafb", borderRadius: 8, borderLeft: "3px solid #059669" }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>Notes</div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{invoice.notes}</div>
          </div>
        )}

        {/* IBAN */}
        {profile.company_iban && (
          <div style={{ marginTop: 16, padding: 16, background: "#f0fdf4", borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "#059669", marginBottom: 6 }}>Coordonnées bancaires</div>
            <div style={{ fontSize: 12, color: "#374151" }}>IBAN: {profile.company_iban}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 48px", borderTop: "1px solid #f3f4f6", marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
        <span>{profile.company_name}</span>
        <span>{profile.company_website}</span>
        <span>Merci pour votre confiance</span>
      </div>
    </div>
  );
}

function ClassiqueTemplate({ invoice, profile }: { invoice: Invoice; profile: Profile }) {
  const currency = profile.company_currency || "CHF";
  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#fff", minHeight: "297mm", width: "210mm", margin: "0 auto", padding: "48px", color: "#000", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 24, borderBottom: "2px solid #000" }}>
        <div>
          {profile.company_logo_url && (
            <img src={profile.company_logo_url} alt="Logo" style={{ height: 48, marginBottom: 16 }} />
          )}
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>{profile.company_name || "Votre Entreprise"}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 6, lineHeight: 1.8 }}>
            {profile.company_address && <div>{profile.company_address}</div>}
            {(profile.company_zip || profile.company_city) && <div>{[profile.company_zip, profile.company_city].filter(Boolean).join(" ")}</div>}
            {profile.company_phone && <div>{profile.company_phone}</div>}
            {profile.company_email && <div>{profile.company_email}</div>}
            {profile.company_vat && <div>N° TVA: {profile.company_vat}</div>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Facture</div>
          <div style={{ fontSize: 16, marginTop: 8, fontFamily: "monospace" }}>{invoice.number}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 12, lineHeight: 1.8 }}>
            <div>Émise le: {fmtDate(invoice.created_at)}</div>
            <div>Échéance: {fmtDate(invoice.due_date)}</div>
          </div>
        </div>
      </div>

      {/* Client */}
      <div style={{ marginTop: 32, marginBottom: 32 }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>Facturé à :</div>
        {invoice.contacts ? (
          <div style={{ fontSize: 13, lineHeight: 1.8, paddingLeft: 16, borderLeft: "3px solid #000" }}>
            <div style={{ fontWeight: 700 }}>{invoice.contacts.name}</div>
            {invoice.contacts.company && <div>{invoice.contacts.company}</div>}
            {invoice.contacts.address && <div style={{ color: "#555" }}>{invoice.contacts.address}</div>}
            {invoice.contacts.email && <div style={{ color: "#555" }}>{invoice.contacts.email}</div>}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#555" }}>Client non spécifié</div>
        )}
      </div>

      {/* Items */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#000", color: "#fff" }}>
            <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</th>
            <th style={{ textAlign: "center", padding: "10px 12px", fontWeight: 600, width: 60 }}>Qté</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, width: 110 }}>Prix unit.</th>
            <th style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, width: 110 }}>Total HT</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoice_items.map((item, i) => (
            <tr key={item.id} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9", borderBottom: "1px solid #e0e0e0" }}>
              <td style={{ padding: "10px 12px" }}>{item.description}</td>
              <td style={{ padding: "10px 12px", textAlign: "center", color: "#555" }}>{item.quantity}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", color: "#555" }}>{fmt(item.unit_price, currency)}</td>
              <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>{fmt(item.total, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <table style={{ fontSize: 12, minWidth: 250 }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 16px 6px 0", color: "#555", borderBottom: "1px solid #e0e0e0" }}>Sous-total HT</td>
              <td style={{ textAlign: "right", padding: "6px 0", borderBottom: "1px solid #e0e0e0" }}>{fmt(invoice.subtotal, currency)}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 16px 6px 0", color: "#555", borderBottom: "1px solid #e0e0e0" }}>TVA {invoice.tax_rate}%</td>
              <td style={{ textAlign: "right", padding: "6px 0", borderBottom: "1px solid #e0e0e0" }}>{fmt(invoice.tax_amount, currency)}</td>
            </tr>
            <tr style={{ background: "#000", color: "#fff" }}>
              <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>Total à payer</td>
              <td style={{ textAlign: "right", padding: "12px 16px", fontWeight: 700, fontSize: 16 }}>{fmt(invoice.total, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div style={{ marginTop: 32, fontSize: 11, color: "#555", lineHeight: 1.6, borderTop: "1px solid #e0e0e0", paddingTop: 16 }}>
          <strong>Notes :</strong> {invoice.notes}
        </div>
      )}
      {profile.company_iban && (
        <div style={{ marginTop: 16, fontSize: 11, color: "#555" }}>
          <strong>Virement :</strong> IBAN {profile.company_iban}
        </div>
      )}
      <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #000", fontSize: 10, color: "#888", textAlign: "center" }}>
        {[profile.company_name, profile.company_address, profile.company_vat && `TVA: ${profile.company_vat}`].filter(Boolean).join("  ·  ")}
      </div>
    </div>
  );
}

function MinimalisteTemplate({ invoice, profile }: { invoice: Invoice; profile: Profile }) {
  const currency = profile.company_currency || "CHF";
  return (
    <div style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", background: "#fff", minHeight: "297mm", width: "210mm", margin: "0 auto", padding: "56px 64px", color: "#111", boxSizing: "border-box" }}>
      {/* Top line */}
      <div style={{ borderTop: "3px solid #111", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {profile.company_logo_url && (
            <img src={profile.company_logo_url} alt="Logo" style={{ height: 36, marginBottom: 12 }} />
          )}
          <div style={{ fontSize: 14, fontWeight: 700 }}>{profile.company_name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "#888" }}>Facture</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{invoice.number}</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#e5e7eb", margin: "32px 0" }} />

      {/* Two columns */}
      <div style={{ display: "flex", gap: 48, marginBottom: 48 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#9ca3af", marginBottom: 12 }}>À</div>
          {invoice.contacts ? (
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 700 }}>{invoice.contacts.name}</div>
              {invoice.contacts.company && <div style={{ color: "#6b7280" }}>{invoice.contacts.company}</div>}
              {invoice.contacts.email && <div style={{ color: "#6b7280" }}>{invoice.contacts.email}</div>}
            </div>
          ) : <div style={{ fontSize: 13, color: "#9ca3af" }}>—</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#9ca3af", marginBottom: 12 }}>Émetteur</div>
          <div style={{ fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700 }}>{profile.company_name}</div>
            {profile.company_address && <div style={{ color: "#6b7280" }}>{profile.company_address}</div>}
            {profile.company_vat && <div style={{ color: "#6b7280" }}>TVA {profile.company_vat}</div>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "#9ca3af", marginBottom: 12 }}>Dates</div>
          <div style={{ fontSize: 12, lineHeight: 2, color: "#374151" }}>
            <div>Émise: {fmtDate(invoice.created_at)}</div>
            <div>Échéance: {fmtDate(invoice.due_date)}</div>
          </div>
        </div>
      </div>

      {/* Items */}
      {invoice.invoice_items.map((item, i) => (
        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13 }}>{item.description}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{item.quantity} × {fmt(item.unit_price, currency)}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, marginLeft: 24 }}>{fmt(item.total, currency)}</div>
        </div>
      ))}

      {/* Totals */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: 32, gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: 240, fontSize: 12, color: "#6b7280" }}>
          <span>Sous-total</span><span>{fmt(invoice.subtotal, currency)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", width: 240, fontSize: 12, color: "#6b7280" }}>
          <span>TVA {invoice.tax_rate}%</span><span>{fmt(invoice.tax_amount, currency)}</span>
        </div>
        <div style={{ height: 1, background: "#111", width: 240, marginTop: 4 }} />
        <div style={{ display: "flex", justifyContent: "space-between", width: 240, fontSize: 18, fontWeight: 800 }}>
          <span>Total</span><span>{fmt(invoice.total, currency)}</span>
        </div>
      </div>

      {(invoice.notes || profile.company_iban) && (
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #e5e7eb", fontSize: 11, color: "#6b7280", lineHeight: 1.8 }}>
          {invoice.notes && <div><strong>Notes:</strong> {invoice.notes}</div>}
          {profile.company_iban && <div><strong>IBAN:</strong> {profile.company_iban}</div>}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 56, left: 64, right: 64, borderTop: "1px solid #f3f4f6", paddingTop: 16, fontSize: 10, color: "#d1d5db", display: "flex", justifyContent: "space-between" }}>
        <span>{profile.company_name}</span><span>Merci pour votre confiance</span>
      </div>
    </div>
  );
}

export default function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [template, setTemplate] = useState<Template>("moderne");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("fluxia_invoice_template") as Template | null;
    if (saved && TEMPLATES.includes(saved)) setTemplate(saved);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const rawI = await supabase.from("invoices").select("*, invoice_items(*), contacts(name, email, company, address)").eq("id", id).single();
      const invRes = rawI as unknown as { data: Invoice | null; error: unknown };
      if (invRes.data) setInvoice(invRes.data as Invoice);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profRes = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profRes.data) setProfile(profRes.data as Profile);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  const switchTemplate = (t: Template) => {
    setTemplate(t);
    localStorage.setItem("fluxia_invoice_template", t);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", color: "#6b7280" }}>
        Chargement…
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", color: "#ef4444" }}>
        Facture introuvable
      </div>
    );
  }

  const fakeProfile: Profile = profile ?? {
    id: "", full_name: null, email: "", company_name: "Mon Entreprise",
    company_logo_url: null, company_address: null, company_city: null, company_zip: null,
    company_country: "CH", company_phone: null, company_website: null, company_vat: null,
    company_email: null, company_iban: null, company_currency: "CHF",
    stripe_customer_id: null, stripe_subscription_id: null, subscription_plan: "free",
    subscription_status: "inactive", subscription_period_end: null, avatar_url: null,
    onboarding_completed: false, ai_mode: "semi_autonome", api_key: null, invoice_template: "moderne",
    created_at: "", updated_at: "",
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      {/* Toolbar - hidden on print */}
      <div className="print:hidden" style={{ position: "sticky", top: 0, zIndex: 100, background: "#111", color: "#fff", padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
        <span style={{ fontWeight: 700, fontSize: 14, marginRight: 8 }}>{invoice.number}</span>
        <span style={{ fontSize: 12, color: "#9ca3af", marginRight: 16 }}>Template :</span>
        {TEMPLATES.map((t) => (
          <button key={t} onClick={() => switchTemplate(t)} style={{
            padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none",
            background: template === t ? "#059669" : "#374151", color: "#fff", transition: "background 0.2s"
          }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/factures" style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, background: "#374151", color: "#fff", textDecoration: "none" }}>← Retour</a>
        <button onClick={handlePrint} style={{ padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#059669", color: "#fff" }}>
          Imprimer / PDF
        </button>
      </div>

      {/* Document */}
      <div style={{ padding: "32px 0", display: "flex", justifyContent: "center" }}>
        <div style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)", background: "#fff" }}>
          {template === "moderne" && <ModerneTemplate invoice={invoice} profile={fakeProfile} />}
          {template === "classique" && <ClassiqueTemplate invoice={invoice} profile={fakeProfile} />}
          {template === "minimaliste" && <MinimalisteTemplate invoice={invoice} profile={fakeProfile} />}
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; background: #fff; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}
