import { requireStore } from "@/lib/session";
import { SettingsForm } from "@/components/settings-form";

export const metadata = { title: "Configurações — VitrineZap" };

export default async function ConfiguracoesPage() {
  const s = await requireStore();
  return (
    <SettingsForm
      slug={s.storeSlug}
      initial={{
        storeName: s.storeName,
        whatsapp: s.whatsappNumber,
        description: s.description ?? "",
        openingHours: s.openingHours ?? "",
        themeColor: s.themeColor,
        pixKey: s.pixKey ?? "",
        logoUrl: s.logoUrl,
        askScheduleDate: s.askScheduleDate,
      }}
    />
  );
}
