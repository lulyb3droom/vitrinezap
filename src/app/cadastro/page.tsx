import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Criar loja — VitrineZap" };

export default function CadastroPage() {
  return <RegisterForm />;
}
