import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Criar loja — MenuZap" };

export default function CadastroPage() {
  return <RegisterForm />;
}
