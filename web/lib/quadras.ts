// Definicoes compartilhadas das quadras.
//
// Ficam aqui, e nao no route.ts, porque um Route Handler do Next so pode
// exportar handlers HTTP (GET, POST, ...) e as configuracoes que o framework
// reconhece. Exportar valores como MODALIDADES faz `next build` falhar na
// checagem de tipos, ainda que funcione em desenvolvimento.

import type { RowDataPacket } from "mysql2";

// Modalidades válidas esperadas pela tabela do MySQL
export const MODALIDADES = [
    "tenis",
    "futsal",
    "volei",
    "basquete",
    "beach_tennis",
    "poliesportiva",
] as const;

export type Modalidade = (typeof MODALIDADES)[number];

export type Quadra = RowDataPacket & {
    id: number;
    nome: string;
    modalidade: Modalidade;
    coberta: boolean | number;
    valor_hora: number | string;
    ativa: boolean | number;
};
