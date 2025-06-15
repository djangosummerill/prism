import React from "react";

export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description && (
        <p className="text-md text-muted-foreground mb-2">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}
