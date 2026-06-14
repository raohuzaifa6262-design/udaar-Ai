import { searchCustomers, createCustomer, recordTransaction } from '@/lib/actions/assistant'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are Udaar AI, an accounting assistant for Pakistani shopkeepers.

Your primary job is to RECORD transactions.

When the shopkeeper speaks:

- Add the transaction to the accounting database.
- Determine whether it is an Udhaar (giving credit/lending) or Payment (receiving money back).
- Use the recordTransaction tool to record the entry.
- Confirm the transaction was recorded successfully.

For normal entries, respond briefly:

"Transaction recorded successfully."
"Ahmed's udhaar balance updated."
"Payment received and ledger updated."

Use PKR currency.
Support Urdu, Roman Urdu, Punjabi, and English.
Always maintain accurate running balances.
Never lose historical records.`

// Tool definitions for Gemini function calling format
const TOOLS = [{
  functionDeclarations: [
    {
      name: 'recordTransaction',
      description: 'Record a simple Udhaar or Payment transaction.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: '"udhaar" if shopkeeper lent money/goods, "payment" if they received money' },
          amount: { type: Type.NUMBER },
          customer_name: { type: Type.STRING, description: 'The name of the customer' },
          note: { type: Type.STRING, description: 'Any details or items purchased' }
        },
        required: ['type', 'amount', 'customer_name']
      }
    }
  ]
}]

// Execute a tool call and return the result
async function executeTool(name: string, args: any): Promise<any> {
  try {
    if (name === 'recordTransaction') {
      const { type, amount, customer_name, note } = args
      let customer_id = null

      if (customer_name) {
        let customers = await searchCustomers(customer_name)
        if (customers.length === 0) {
          const newCust = await createCustomer(customer_name)
          customer_id = newCust.id
        } else {
          customer_id = customers[0].id
        }
      }

      if (!customer_id) {
         return { error: 'Customer name is required to record a transaction' }
      }

      await recordTransaction(amount, type, customer_id, note || '')
      return { success: true, type, amount, recorded: true }
    }

    return { error: `Unknown tool: ${name}` }
  } catch (e: any) {
    return { error: e.message || 'Tool execution failed' }
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return Response.json({ error: 'Gemini API key not configured' }, { status: 500 })

    const ai = new GoogleGenAI({ apiKey: apiKey })

    // Convert messages to Gemini format
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    // Add system instruction separately in config
    const config = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      tools: TOOLS,
      temperature: 0.3,
    }

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: geminiMessages,
      config: config
    })

    if (!response.candidates || response.candidates.length === 0) {
       return Response.json({ role: 'assistant', content: 'Kuch masla aa gaya. Dobara try karo.' })
    }

    const message = response.candidates[0].content

    // Check for tool calls
    if (message && message.parts && message.parts.some(p => p.functionCall)) {
      
      const toolCalls = message.parts.filter(p => p.functionCall).map(p => p.functionCall)
      const toolResponses = []

      for (const call of toolCalls) {
        if(call && call.name && call.args) {
             const result = await executeTool(call.name, call.args)
             toolResponses.push({
               functionResponse: {
                 name: call.name,
                 response: result
               }
             })
        }
      }

      // Send tool results back to Gemini
      const followUpMessages = [
        ...geminiMessages,
        message, // the model's call
        { role: 'user', parts: toolResponses } // the tool results
      ]

      const followUpResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: followUpMessages,
        config: config
      })

      const finalContent = followUpResponse.text
      if(finalContent) {
         return Response.json({ role: 'assistant', content: finalContent })
      }
    }

    // Regular text response
    const text = response.text
    if (text) {
      return Response.json({ role: 'assistant', content: text })
    }

    return Response.json({ role: 'assistant', content: 'Theek hai, kaam ho gaya.' })

  } catch (error: any) {
    console.error('Assistant route error:', error)
    return Response.json(
      { role: 'assistant', content: 'Server error: ' + (error.message || 'Unknown') },
      { status: 500 }
    )
  }
}
