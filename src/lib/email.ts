import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type AppointmentEmailData = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  stylistName?: string | null;
  serviceNames: string[];
  date: Date;
  note?: string | null;
};

function formatAppointmentDate(date: Date) {
  return date.toLocaleString("hu-HU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Budapest",
  });
}

function emailRow(label: string, value: string, isLast = false) {
  return `
    <div style="display:grid;grid-template-columns:140px 1fr;gap:24px;padding:12px 24px;font-size:14px;border-bottom:${
      isLast ? "0" : "1px solid #f1f5f9"
    };">
      <div style="font-weight:700;color:#18181b;">
        ${label}
      </div>
      <div style="line-height:22px;color:#18181b;">
        ${value}
      </div>
    </div>
  `;
}

export async function sendAppointmentConfirmationEmail(
  data: AppointmentEmailData
) {
  const from = process.env.RESEND_FROM_EMAIL;
  const ownerEmail = process.env.APPOINTMENT_NOTIFICATION_EMAIL;

  if (!from) {
    console.warn("Missing RESEND_FROM_EMAIL");
    return;
  }

  const html = `
    <div style="margin:0;padding:32px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
        <div style="max-width:672px;margin:0 auto;background:#f1f5f9;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="text-align:center;padding:24px 32px 12px;">
            <div style="width:48px;height:48px;margin:0 auto 12px;border-radius:999px;border:1px solid #e4e4e7;background:#ffffff;color:#059669;line-height:48px;font-size:24px;font-weight:700;">
            ✓
            </div>

            <h1 style="margin:0;font-size:24px;line-height:32px;font-weight:600;color:#18181b;">
            Időpont sikeresen lefoglalva
            </h1>

            <p style="max-width:448px;margin:8px auto 0;font-size:14px;line-height:22px;color:#71717a;">
            A foglalás részleteit alább találod.
            </p>
        </div>

        <div style="padding:0;">
            <div style="margin:0;border:1px solid rgba(0,0,0,0.1);border-radius:4px;background:#ffffff;">
            ${emailRow(
                "Elnevezés",
                `${data.serviceNames.join(", ")} - ${data.customerName}`
            )}

            ${emailRow(
                "Mikor",
                `${formatAppointmentDate(data.date)}`
            )}

            ${emailRow(
                "Szakember",
                data.stylistName || "-"
            )}

            ${emailRow(
                "Szolgáltatás",
                data.serviceNames.join(", ")
            )}

            ${emailRow(
                "Vendég",
                `${data.customerName}<br />
                <span style="color:#71717a;">${data.customerEmail}</span><br />
                <span style="color:#71717a;">${data.customerPhone || "-"}</span>`
            )}

            ${
                data.note
                ? emailRow("Megjegyzés", data.note)
                : ""
            }

            ${emailRow("Helyszín", "1134 Budapest, Apály u. 2/D", true)}
            </div>

            <div style="padding:16px 32px;text-align:center;font-size:13px;font-weight:500;color:#71717a;">
            Köszönjük a foglalást!<br />
            Atrium Beauty
            </div>
        </div>
        </div>
    </div>
    `;

  const recipients = [data.customerEmail];

  if (ownerEmail && ownerEmail !== data.customerEmail) {
    recipients.push(ownerEmail);
  }

  const { error } = await resend.emails.send({
    from,
    to: recipients,
    subject: "Időpontfoglalás visszaigazolás - Atrium Beauty",
    html,
  });

  if (error) {
    console.error("Resend email error:", error);
  }
}

export async function sendAppointmentUpdatedEmail(data: AppointmentEmailData) {
  const from = process.env.RESEND_FROM_EMAIL;
  const ownerEmail = process.env.APPOINTMENT_NOTIFICATION_EMAIL;

  if (!from) {
    console.warn("Missing RESEND_FROM_EMAIL");
    return;
  }

  const html = `
    <div style="margin:0;padding:32px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
      <div style="max-width:672px;margin:0 auto;background:#f1f5f9;border-radius:4px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <div style="text-align:center;padding:24px 32px 12px;">
          <div style="width:48px;height:48px;margin:0 auto 12px;border-radius:999px;border:1px solid #fed7aa;background:#ffffff;color:#ea580c;line-height:48px;font-size:24px;font-weight:700;">
            &#8635;
          </div>

          <h1 style="margin:0;font-size:24px;line-height:32px;font-weight:600;color:#18181b;">
            Időpont módosítva
          </h1>

          <p style="max-width:448px;margin:8px auto 0;font-size:14px;line-height:22px;color:#71717a;">
            Az időpont részletei módosításra kerültek.
          </p>
        </div>

        <div style="padding:0;">
          <div style="margin:0;border:1px solid rgba(0,0,0,0.1);border-radius:4px;background:#ffffff;">
            ${emailRow(
              "Elnevezés",
              `${data.serviceNames.join(", ")} - ${data.customerName}`
            )}

            ${emailRow("Mikor", `${formatAppointmentDate(data.date)}`)}

            ${emailRow("Szakember", data.stylistName || "-")}

            ${emailRow("Szolgáltatás", data.serviceNames.join(", "))}

            ${emailRow(
              "Vendég",
              `${data.customerName}<br />
              <span style="color:#71717a;">${data.customerEmail}</span><br />
              <span style="color:#71717a;">${data.customerPhone || "-"}</span>`
            )}

            ${data.note ? emailRow("Megjegyzés", data.note) : ""}

            ${emailRow("Helyszín", "1134 Budapest, Apály u. 2/D", true)}
          </div>

          <div style="padding:16px 32px;text-align:center;font-size:13px;font-weight:500;color:#71717a;">
            Atrium Beauty
          </div>
        </div>
      </div>
    </div>
  `;

  const recipients = [data.customerEmail];

  if (ownerEmail && ownerEmail !== data.customerEmail) {
    recipients.push(ownerEmail);
  }

  const { error } = await resend.emails.send({
    from,
    to: recipients,
    subject: "Időpont módosítás - Atrium Beauty",
    html,
  });

  if (error) {
    console.error("Resend updated email error:", error);
  }
}

export async function sendAppointmentCancelledEmail(data: AppointmentEmailData) {
  const from = process.env.RESEND_FROM_EMAIL;

  if (!from) {
    console.warn("Missing RESEND_FROM_EMAIL");
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: data.customerEmail,
    subject: "Időpont törölve - Atrium Beauty",
    html: `
      <div style="margin:0;padding:32px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
        <div style="max-width:672px;margin:0 auto;background:#f1f5f9;border-radius:4px;overflow:hidden;">
          <div style="text-align:center;padding:24px 32px 12px;">
            <div style="width:48px;height:48px;margin:0 auto 12px;border-radius:999px;border:1px solid #fecaca;background:#fff;color:#dc2626;line-height:48px;font-size:24px;font-weight:700;">
              !
            </div>

            <h1 style="margin:0;font-size:24px;line-height:32px;font-weight:600;">
              Időpont törölve
            </h1>

            <p style="margin:8px auto 0;font-size:14px;line-height:22px;color:#71717a;">
              Az alábbi időpont törlésre került.
            </p>
          </div>

          <div style="border:1px solid rgba(0,0,0,0.1);border-radius:4px;background:#ffffff;">
            ${emailRow("Mikor", formatAppointmentDate(data.date))}
            ${emailRow("Szakember", data.stylistName || "-")}
            ${emailRow("Szolgáltatás", data.serviceNames.join(", "))}
            ${emailRow("Vendég", data.customerName)}
            ${emailRow("Helyszín", "1134 Budapest, Apály u. 2/D", true)}
          </div>

          <div style="padding:16px 32px;text-align:center;font-size:13px;font-weight:500;color:#71717a;">
            Atrium Beauty
          </div>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend cancelled email error:", error);
  }
}