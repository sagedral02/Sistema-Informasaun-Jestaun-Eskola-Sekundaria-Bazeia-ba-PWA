import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Ita-boot sai ona husi sistema.',
  });

  response.cookies.delete('nossef_token');
  return response;
}
