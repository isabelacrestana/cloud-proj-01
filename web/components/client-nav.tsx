                                                                                                                               
"use client";                                                                                                                  
                                                                                                                                
import Link from "next/link";                                                                                                  
import { usePathname } from "next/navigation";                                                                                 
                                                                                                                                
export function ClientNav() {                                                                                                 
    const pathname = usePathname();                                                                                              
                                                                                                                                
    const ehMinhasReservas = pathname === "/cliente";                                                                            
    const ehReservar = pathname.startsWith("/cliente/reservar");                                                                 
                                                                                                                                
    return (                                                                                                                     
    <div className="flex items-center gap-6 text-sm">                                                                          
        <Link                                                                                                                    
        href="/cliente"                                                                                                        
        className={`pb-1 border-b-2 transition-colors duration-150 ${                                                          
            ehMinhasReservas                                                                                                     
            ? "text-white font-medium border-[#b08d57]"                                                                        
            : "text-white/70 hover:text-white font-normal border-transparent"                                                  
        }`}                                                                                                                    
        >                                                                                                                        
        Minhas reservas                                                                                                        
        </Link>                                                                                                                  
                                                                                                                                
        <Link                                                                                                                    
        href="/cliente/reservar"                                                                                               
        className={`pb-1 border-b-2 transition-colors duration-150 ${                                                          
            ehReservar                                                                                                           
            ? "text-white font-medium border-[#b08d57]"                                                                        
            : "text-white/70 hover:text-white font-normal border-transparent"                                                  
        }`}                                                                                                                    
        >                                                                                                                        
        Reservar quadra                                                                                                        
        </Link>                                                                                                                  
    </div>                                                                                                                     
    );                                                                                                                           
}     