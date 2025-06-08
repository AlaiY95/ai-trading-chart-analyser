// app/api/analyze-chart/route.ts
import { NextResponse } from "next/server";
import { anthropic, ANALYSIS_PROMPT } from "@/lib/claude";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    console.log("Starting chart analysis...");

    // Read test image
    const imagePath = path.join(process.cwd(), "public", "test-chart.png");

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return NextResponse.json(
        {
          error: "Test chart not found. Please add test-chart.png to your public folder.",
        },
        { status: 404 }
      );
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Detect media type based on file extension
    const imageExtension = path.extname(imagePath).toLowerCase();
    const mediaType = imageExtension === ".jpg" || imageExtension === ".jpeg" ? "image/jpeg" : "image/png";

    // Debug logging
    console.log("Image file size:", imageBuffer.length, "bytes");
    console.log("Media type:", mediaType);
    console.log("Base64 length:", base64Image.length);
    console.log("File extension:", imageExtension);

    console.log("Sending request to Claude...");

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Using Claude 3.5 Sonnet (more cost-effective than 4)
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    console.log("Received response from Claude");

    // Safely extract the analysis text
    const analysisText = response.content[0]?.text || "No analysis generated";

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      timestamp: new Date().toISOString(),
      imageInfo: {
        size: imageBuffer.length,
        type: mediaType,
        extension: imageExtension,
      },
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    // Handle specific Anthropic API errors
    if (error.status === 400 && error.error?.type === "invalid_request_error") {
      if (error.error?.message?.includes("credit")) {
        return NextResponse.json(
          {
            error: "Insufficient credits. Please add credits to your Anthropic account.",
          },
          { status: 402 }
        );
      }
      if (error.error?.message?.includes("image")) {
        return NextResponse.json(
          {
            error: "Could not process image. Please check image format and size.",
            details: error.error.message,
          },
          { status: 400 }
        );
      }
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error.error?.type || "unknown",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log("Starting chart analysis from uploaded image...");

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No image file provided",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "File must be an image",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File size too large. Maximum 5MB allowed.",
        },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Determine media type from file type
    const mediaType = file.type.startsWith("image/") ? file.type : "image/png";

    // Debug logging
    console.log("Uploaded file size:", file.size, "bytes");
    console.log("File type:", file.type);
    console.log("Media type:", mediaType);
    console.log("Base64 length:", base64Image.length);

    console.log("Sending request to Claude...");

    const response = await anthropic.messages.create({
      // model: "claude-sonnet-4-20250514",
      model: "claude-3-5-sonnet-20241022", // Using Claude 3.5 Sonnet
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    console.log("Received response from Claude");

    // Safely extract the analysis text
    const analysisText = response.content[0]?.text || "No analysis generated";

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      timestamp: new Date().toISOString(),
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    // Handle specific Anthropic API errors
    if (error.status === 400 && error.error?.type === "invalid_request_error") {
      if (error.error?.message?.includes("credit")) {
        return NextResponse.json(
          {
            error: "Insufficient credits. Please add credits to your Anthropic account.",
          },
          { status: 402 }
        );
      }
      if (error.error?.message?.includes("image")) {
        return NextResponse.json(
          {
            error: "Could not process image. Please check image format and size.",
            details: error.error.message,
          },
          { status: 400 }
        );
      }
    }

    if (error.status === 429) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        errorType: error.error?.type || "unknown",
      },
      { status: 500 }
    );
  }
}
