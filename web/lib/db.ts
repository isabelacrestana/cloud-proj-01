import mysql from "mysql2/promise";

// Um unico pool para todo o processo. Em desenvolvimento o Next recarrega os
// modulos a cada alteracao, o que criaria um pool novo por recarga ate estourar
// o limite de conexoes do MySQL; guardar no globalThis evita isso.
const globalParaPool = globalThis as typeof globalThis & {
  poolMySql?: mysql.Pool;
};

function criarPool(): mysql.Pool {
  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

  if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error(
      "Variaveis de banco ausentes. Confira DB_HOST, DB_NAME, DB_USER e DB_PASSWORD no .env.local",
    );
  }

  return mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT ?? 3306),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    // Impede que varias instrucoes sejam enviadas numa mesma chamada,
    // reduzindo o estrago possivel caso alguma query seja mal construida.
    multipleStatements: false,
  });
}

export const pool: mysql.Pool = globalParaPool.poolMySql ?? criarPool();

if (process.env.NODE_ENV !== "production") {
  globalParaPool.poolMySql = pool;
}
