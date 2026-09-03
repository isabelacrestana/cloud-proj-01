import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { erro: "Nao implementado" },
    { status: 501 },
  );
}
