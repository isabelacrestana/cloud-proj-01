import Link from "next/link";
import { redirect } from "next/navigation";                                                                                    
import { BotaoSair } from "@/components/botao-sair";                                                                           
import { ClientNav } from "@/components/client-nav";                                                                         
import { lerSessao } from "@/lib/sessao";                                                                                      
                                                                                                                                
export default async function ClienteLayout({                                                                                  
  children,                                                                                                                    
}: {
  children: React.ReactNode;                                                                                                   
}) {                                                                                                                           
  const sessao = await lerSessao();                                                                                            
                                                                                                                                
  if (!sessao) redirect("/login");                                                                                             
                                                                                                                                
  return (                                                                                                                     
    <div className="flex min-h-screen flex-col bg-white">                                                                      
      <header className="bg-[#0b1a2b] text-white">                                                                             
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">                                        
          <ClientNav />                                                                                                       
          <BotaoSair />                                                                                                        
        </nav>                                                                                                                 
      </header>                                                                                                                
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
