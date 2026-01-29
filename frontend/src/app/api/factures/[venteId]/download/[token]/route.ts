import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { venteId: string; token: string } }
) {
  const { venteId, token } = params

  try {
    // Proxy vers le backend
    const response = await fetch(
      `http://localhost:3001/factures/${venteId}/download/${token}`,
      { method: 'GET' }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Facture non trouvée ou lien invalide' },
        { status: response.status }
      )
    }

    const pdfBuffer = await response.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=facture-${venteId.slice(0, 8)}.pdf`,
      },
    })
  } catch (error) {
    console.error('Erreur téléchargement facture:', error)
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    )
  }
}
