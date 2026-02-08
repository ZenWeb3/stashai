import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/auth-helper";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getUserContext,
  buildSystemPrompt,
  aiFunctions,
  executeFunctionCall,
  SECURITY_LIMITS,
  type ChatRequestInput,
} from "@/lib/ai/ index";
import type { ChatResponse, ApiResponse, ChatMessage } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ChatResponse>>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;

    let body: ChatRequestInput;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { message, conversationHistory } = body;

    if (!message?.trim() || message.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Invalid message" },
        { status: 400 },
      );
    }

    const context = await getUserContext(supabase, user.id, user.user_metadata);
    const systemPrompt = buildSystemPrompt(context);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{ functionDeclarations: aiFunctions }],
    });

    const conversationContents: any[] = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: `Hey ${context.nickname}! I'm StashAI, ready to help with your finances! 💰`,
          },
        ],
      },
    ];

    if (conversationHistory?.length) {
      conversationHistory.forEach((msg: any) => {
        conversationContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.message }],
        });
      });
    }

    conversationContents.push({ role: "user", parts: [{ text: message }] });

    let response = await model.generateContent({
      contents: conversationContents,
    });
    const functionCalls = response.response.functionCalls();

    if (functionCalls?.length) {
      const functionResults: string[] = [];

      for (const call of functionCalls.slice(
        0,
        SECURITY_LIMITS.MAX_ACTIONS_PER_MESSAGE,
      )) {
        const result = await executeFunctionCall(
          call.name,
          call.args,
          supabase,
          user.id,
        );
        functionResults.push(result);
      }

      conversationContents.push({
        role: "model",
        parts: response.response.candidates?.[0].content.parts,
      });

      conversationContents.push({
        role: "user",
        parts: functionCalls.map((call: any, i: number) => ({
          functionResponse: {
            name: call.name,
            response: { result: functionResults[i] },
          },
        })),
      });

      response = await model.generateContent({
        contents: conversationContents,
      });
    }

    const aiMessage =
      response.response.text() || "Sorry, I couldn't generate a response.";

    // Save chat history
    await supabase.from("chat_history").insert([
      {
        user_id: user.id,
        message,
        role: "user",
        timestamp: new Date().toISOString(),
      },
      {
        user_id: user.id,
        message: aiMessage,
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({
      success: true,
      data: { message: aiMessage, role: "assistant" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process message" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ChatMessage[]>>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { user, supabase } = auth;
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");

    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch history" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: data?.reverse() || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
