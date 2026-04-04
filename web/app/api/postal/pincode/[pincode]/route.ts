import { NextResponse } from "next/server";

type IndiaPostOffice = {
  Name: string;
  District: string;
  State: string;
};

type IndiaPostResponse = {
  Status: string;
  Message: string;
  PostOffice: IndiaPostOffice[] | null;
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pincode: string }> }
) {
  const { pincode } = await params;

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { success: false, message: "PIN code must be 6 digits." },
      { status: 400 }
    );
  }

  const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: "Unable to fetch PIN details right now." },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as IndiaPostResponse[];
  const first = payload[0];

  if (!first || first.Status !== "Success" || !first.PostOffice?.length) {
    return NextResponse.json(
      { success: false, message: "No address data found for this PIN code." },
      { status: 404 }
    );
  }

  const cities = Array.from(new Set(first.PostOffice.map((office) => office.District))).sort();
  const states = Array.from(new Set(first.PostOffice.map((office) => office.State))).sort();

  return NextResponse.json(
    {
      success: true,
      data: {
        pincode,
        cities,
        states,
      },
    },
    { status: 200 }
  );
}
