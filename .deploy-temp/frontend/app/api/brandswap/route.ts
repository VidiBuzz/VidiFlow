import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), "tmp", "brandswap-uploads");
const OUTPUT_DIR = path.join(process.cwd(), "tmp", "brandswap-output");
const PYTHON_SCRIPT = path.join(process.cwd(), "scripts", "brandswap-processor.py");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get files and settings
    const logoFile = formData.get("logo") as File;
    const mediaFiles = formData.getAll("files") as File[];
    const overlayText = formData.get("overlayText") as string || "VidiSmart™";
    const threshold = parseFloat(formData.get("threshold") as string) || 0.55;
    const position = formData.get("position") as string || "bottom-right";

    if (!logoFile || mediaFiles.length === 0) {
      return NextResponse.json(
        { error: "Logo template and media files are required" },
        { status: 400 }
      );
    }

    // Create session ID
    const sessionId = uuidv4();
    const sessionUploadDir = path.join(UPLOAD_DIR, sessionId);
    const sessionOutputDir = path.join(OUTPUT_DIR, sessionId);

    // Ensure directories exist
    await mkdir(sessionUploadDir, { recursive: true });
    await mkdir(sessionOutputDir, { recursive: true });

    // Save logo template
    const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
    const logoPath = path.join(sessionUploadDir, "template.jpg");
    await writeFile(logoPath, logoBuffer);

    // Save media files
    const savedFiles: string[] = [];
    for (const file of mediaFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(sessionUploadDir, file.name);
      await writeFile(filePath, buffer);
      savedFiles.push(filePath);
    }

    // Process files using Python script
    // Note: In production, this should use a queue system like Bull or AWS Lambda
    const results = await processFilesWithPython(
      logoPath,
      sessionUploadDir,
      sessionOutputDir,
      overlayText,
      threshold
    );

    // Get output files
    const outputFiles = await getOutputFiles(sessionOutputDir);

    return NextResponse.json({
      success: true,
      sessionId,
      results,
      outputFiles: outputFiles.map(f => ({
        name: path.basename(f),
        path: f,
        downloadUrl: `/api/brandswap/download?session=${sessionId}&file=${encodeURIComponent(path.basename(f))}`
      }))
    });

  } catch (error) {
    console.error("BrandSwap API Error:", error);
    return NextResponse.json(
      { error: "Failed to process files", details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function processFilesWithPython(
  logoPath: string,
  inputDir: string,
  outputDir: string,
  overlayText: string,
  threshold: number
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    // Call Python script
    const pythonProcess = spawn("python3", [
      PYTHON_SCRIPT,
      "--input", inputDir,
      "--output", outputDir,
      "--template", logoPath,
      "--threshold", threshold.toString(),
      "--text", overlayText,
      "--json"  // Output JSON for parsing
    ]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorOutput);
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        // Parse results from output
        const lines = output.split("\n");
        for (const line of lines) {
          if (line.includes("PROCESSED:") || line.includes("SKIPPED:")) {
            const match = line.match(/(PROCESSED|SKIPPED):\s+(.+?)\s*\((.+?)\)/);
            if (match) {
              results.push({
                status: match[1].toLowerCase(),
                filename: match[2].trim(),
                details: match[3]
              });
            }
          }
        }
        resolve(results);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

async function getOutputFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const entries = await readdir(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        const subFiles = await getOutputFiles(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist yet
  }
  
  return files;
}

// Download endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session");
  const filename = searchParams.get("file");

  if (!sessionId || !filename) {
    return NextResponse.json(
      { error: "Session ID and filename are required" },
      { status: 400 }
    );
  }

  const filePath = path.join(OUTPUT_DIR, sessionId, filename);
  
  // Security check: ensure file is within output directory
  const resolvedPath = path.resolve(filePath);
  const resolvedOutputDir = path.resolve(OUTPUT_DIR);
  
  if (!resolvedPath.startsWith(resolvedOutputDir)) {
    return NextResponse.json(
      { error: "Invalid file path" },
      { status: 403 }
    );
  }

  try {
    const fileBuffer = await promisify(fs.readFile)(filePath);
    const ext = path.extname(filename).toLowerCase();
    
    const contentType = ext === ".mp4" ? "video/mp4" :
                       ext === ".mov" ? "video/quicktime" :
                       ext === ".png" ? "image/png" :
                       "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
