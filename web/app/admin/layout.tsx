import Link from "next/link";
import { redirect } from "next/navigation";
import { BotaoSair } from "@/components/botao-sair";
import { AdminNav } from "@/components/admin-nav";                                                                             
import { lerSessao } from "@/lib/sessao";

 export default async function AdminLayout({                                                                                    
  children,                                                                                                                    
}: {                                                                                                                           
  children: React.ReactNode;                                                                                                   
}) {                                                                                                                           
  const sessao = await lerSessao();                                                                                            
                                                                                                                                
  if (!sessao) redirect("/login");                                                                                             
  if (sessao.papel !== "admin") redirect("/cliente");                                                                          
                                                                                                                                
  return (                                                                                                                     
    <div className="flex min-h-screen flex-col bg-white">                                                                      
      <header className="bg-[#0b1a2b] text-white">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <AdminNav />
          <BotaoSair />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}