"use client";

// Optional self-reported role on the contact forms. One field, blank by
// default, so it costs a willing lead nothing and lets the lead table be split
// into fit / non-fit personas without hand-labelling every row.

import { useTranslations } from "next-intl";
import { CONTACT_ROLES, type ContactRole } from "@/services/contact";

type Props = {
  value: ContactRole | "";
  onChange: (value: ContactRole | "") => void;
  className?: string;
};

export default function ContactRoleSelect({ value, onChange, className }: Props) {
  const t = useTranslations("contact.role");
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ContactRole | "")}
      aria-label={t("label")}
      className={className}
    >
      <option value="">{t("placeholder")}</option>
      {CONTACT_ROLES.map((role) => (
        <option key={role} value={role}>
          {t(`options.${role}`)}
        </option>
      ))}
    </select>
  );
}
