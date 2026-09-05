"use client";                                                                                                                  
                                                                                                                                   
import Link from "next/link";                                                                                                  
import { usePathname } from "next/navigation";                                                                                 
                                                                                                                                
export function AdminNav() {                                                                                                   
    const pathname = usePathname();                                                                                              
                                                                                                                                
    const ehAdmin = pathname === "/admin";                                                                                       
    const ehQuadras = pathname.startsWith("/admin/quadras");                                                                     
                                                                                                                                
    return (                                                                                                                     
    <div className="flex items-center gap-6 text-sm">                                                                          
        <Link                                                                                                                    
        href="/admin"                                                                                                          
        className={`pb-1 border-b-2 transition-colors duration-150 ${                                                          
            ehAdmin                                                                                                              
            ? "text-white font-medium border-[#b08d57]"                                                                        
            : "text-white/70 hover:text-white font-normal border-transparent"                                                  
        }`}                                                                                                                    
        >                                                                                                                        
        Administração                                                                                                          
        </Link>                                                                                                                  
                                                                                                                                
        <Link                                                                                                                    
        href="/admin/quadras"
        className={`pb-1 border-b-2 transition-colors duration-150 ${
            ehQuadras
            ? "text-white font-medium border-[#b08d57]"
            : "text-white/70 hover:text-white font-normal border-transparent"
        }`}
        >
        Quadras
        </Link>
    </div>
    );
}