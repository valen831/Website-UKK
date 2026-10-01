import { NextRequest } from "next/server";
import { orders } from "@/data/orders";

// GET: Search order by code
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Kode pesanan diperlukan" }, { status: 400 });
  }

  const order = orders.find(
    (o) => o.code.toLowerCase() === code.toLowerCase()
  );

  if (!order) {
    return Response.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return Response.json(order);
}

// POST: Create new order
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate required fields
  if (!body.customer?.name || !body.customer?.whatsapp || !body.customer?.address) {
    return Response.json(
      { error: "Data penyewa tidak lengkap" },
      { status: 400 }
    );
  }

  // In a real app, this would save to the database
  const newOrder = {
    id: Date.now().toString(),
    code: body.code,
    items: body.items || [],
    totalPrice: body.totalPrice || 0,
    totalDeposit: body.totalDeposit || 0,
    grandTotal: body.grandTotal || 0,
    customer: body.customer,
    deliveryMethod: body.deliveryMethod || "pickup",
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    notes: body.notes,
  };

  return Response.json(newOrder, { status: 201 });
}
