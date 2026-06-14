import { searchCustomers, searchSuppliers, createCustomer, createSupplier, recordJournalEntry, generateMonthlyReport } from '@/lib/actions/assistant'
import { GoogleGenAI, Type, Schema } from '@google/genai'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are Udaar AI, an accounting assistant for Pakistani shopkeepers.

Your primary job is to RECORD transactions, not generate reports after every entry.

When the shopkeeper speaks:

- Add the transaction to the accounting database.
- Determine whether it is a Sale, Purchase, Expense, Payment Received, Payment Made, Loan, Udhaar Sale, Udhaar Purchase, Inventory Addition, or Inventory Reduction.
- Create the appropriate double-entry accounting records.
- Update customer or supplier balances automatically.
- Update cash and bank balances.
- Confirm the transaction was recorded successfully.

For normal entries, respond briefly:

"Transaction recorded successfully."
"Ahmed's udhaar balance updated."
"Purchase recorded."
"Expense added."
"Payment received and ledger updated."

Do NOT generate:
- Full Ledger
- Trial Balance
- Profit & Loss
- Balance Sheet

unless specifically requested.

Store the following information continuously:

1. Date and time
2. Transaction type
3. Amount
4. Customer/Supplier name
5. Description
6. Payment method (Cash, Bank, Easypaisa, JazzCash)
7. Debit account
8. Credit account

At the end of the month, when the user says:
"Generate monthly report"
or
"Show this month's accounts"

Generate:

A. Customer Ledger Summary
B. Supplier Ledger Summary
C. Cash Book
D. Bank Book
E. Trial Balance
F. Profit & Loss Statement
G. Balance Sheet
H. Outstanding Udhaar Report
I. Monthly Sales Summary
J. Monthly Expense Summary
K. Top Customers
L. Top Selling Products
M. Cash Flow Summary

Balance Sheet Format:

Assets
- Cash
- Bank
- Inventory
- Accounts Receivable

Liabilities
- Accounts Payable
- Loans

Owner Equity
- Capital
- Profit

Verify:
Assets = Liabilities + Equity

Use PKR currency.
Support Urdu, Roman Urdu, Punjabi, and English.
Always maintain accurate running balances.
Never lose historical records.`

// Tool definitions for Gemini function calling format
const TOOLS = [{
  functionDeclarations: [
    {
      name: 'recordJournalEntry',
      description: 'Record any double-entry transaction.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          transaction_type: { type: Type.STRING, description: 'Sale, Purchase, Expense, Payment Received, Payment Made, Loan, Udhaar Sale, Udhaar Purchase, Inventory Addition, Inventory Reduction' },
          amount: { type: Type.NUMBER },
          debit_account: { type: Type.STRING, description: 'e.g. Cash, Accounts Receivable, Inventory, Expense:Rent' },
          credit_account: { type: Type.STRING, description: 'e.g. Sales, Accounts Payable, Cash, Inventory' },
          payment_method: { type: Type.STRING, description: 'Cash, Bank, Easypaisa, JazzCash, None' },
          description: { type: Type.STRING, description: 'Details about the transaction.' },
          entity_name: { type: Type.STRING, description: 'Customer or Supplier name if applicable.' },
          entity_type: { type: Type.STRING, description: 'Whether the entity is a customer, supplier, or none.' } // enum not directly supported in this shape for all genai versions, use string
        },
        required: ['transaction_type', 'amount', 'debit_account', 'credit_account', 'payment_method', 'description']
      }
    },
    {
      name: 'generateMonthlyReport',
      description: "Generates the end of month financial reports (Trial Balance, P&L, Cash Book, etc.).",
    }
  ]
}]

// Execute a tool call and return the result
async function executeTool(name: string, args: any): Promise<any> {
  try {
    if (name === 'recordJournalEntry') {
      const { transaction_type, amount, debit_account, credit_account, payment_method, description, entity_name, entity_type } = args
      let customer_id = null
      let supplier_id = null

      if (entity_type === 'customer' && entity_name) {
        let customers = await searchCustomers(entity_name)
        if (customers.length === 0) {
          const newCust = await createCustomer(entity_name)
          customer_id = newCust.id
        } else {
          customer_id = customers[0].id
        }
      } else if (entity_type === 'supplier' && entity_name) {
        let suppliers = await searchSuppliers(entity_name)
        if (suppliers.length === 0) {
          const newSup = await createSupplier(entity_name)
          supplier_id = newSup.id
        } else {
          supplier_id = suppliers[0].id
        }
      }

      await recordJournalEntry(transaction_type, amount, debit_account, credit_account, payment_method, description, customer_id, supplier_id)
      return { success: true, transaction_type, amount, recorded: true }
    }

    if (name === 'generateMonthlyReport') {
      const report = await generateMonthlyReport()
      return report
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
