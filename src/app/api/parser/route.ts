import { NextResponse } from 'next/server'
import { parseTransaction } from '@/lib/parser'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export interface FallbackParserResponse {
  customerName: string;
  amount: number;
  transactionType: 'udhaar' | 'payment';
  confidence: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Text input is required.' },
        { status: 400 }
      )
    }

    const trimmedText = text.trim()

    // 1. Run the local regex parser first (100% free, high speed)
    const regexResult = parseTransaction(trimmedText)
    if (regexResult.success) {
      const responsePayload: FallbackParserResponse = {
        customerName: regexResult.customerName,
        amount: regexResult.amount,
        transactionType: regexResult.transactionType,
        confidence: 1.0 // 100% confidence for exact regex match
      }
      return NextResponse.json(responsePayload)
    }

    // 2. If regex parser fails (confidence = 0), fall back to Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
       return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey: apiKey })

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        customerName: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        transactionType: { type: Type.STRING, description: '"udhaar" or "payment"' },
        confidence: { type: Type.NUMBER }
      },
      required: ["customerName", "amount", "transactionType", "confidence"]
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: trimmedText,
      config: {
        systemInstruction: { parts: [{ text: `You are a transaction parser. The user will provide a transaction log written in Roman Urdu or English. Your task is to extract:
1. customerName (formatted name, capitalized first letters, e.g. "Ali", "Ahmed Khan")
2. amount (number, extract the total money, e.g. 2500)
3. transactionType ("udhaar" if the shopkeeper lent money/goods, gave credit, or there is remaining balance "baki" / "diya". "payment" if they got money back, received cash, or "wapas" / "mile")
4. confidence (estimation value between 0.0 and 1.0)

Return ONLY a JSON object.` }] },
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    })

    const content = response.text

    if (!content) {
      return NextResponse.json(
        { error: 'AI returned an empty response.' },
        { status: 502 }
      )
    }

    const parsedGpt = JSON.parse(content)

    // Validate structured response
    const { customerName, amount, transactionType, confidence } = parsedGpt

    if (!customerName || typeof amount !== 'number' || isNaN(amount) || amount <= 0 || !['udhaar', 'payment'].includes(transactionType)) {
      return NextResponse.json(
        { error: 'AI returned invalid structured transaction details.', rawAIResponse: parsedGpt },
        { status: 422 }
      )
    }

    const finalResponse: FallbackParserResponse = {
      customerName: String(customerName).trim(),
      amount,
      transactionType: transactionType as 'udhaar' | 'payment',
      confidence: typeof confidence === 'number' ? confidence : 0.8
    }

    return NextResponse.json(finalResponse)

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during processing.' },
      { status: 500 }
    )
  }
}
