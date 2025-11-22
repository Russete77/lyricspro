import { defineConfig } from "@trigger.dev/sdk";
import { prismaExtension } from "@trigger.dev/build/extensions/prisma";

export default defineConfig({
  project: "proj_moneiqrcmtuoksmtvrab",
  runtime: "node",
  logLevel: "log",
  maxDuration: 3600, // 1 hora (obrigatório na v4)
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./trigger"],
  build: {
    extensions: [
      // Prisma extension for Trigger.dev (legacy mode)
      prismaExtension({
        schema: "./prisma/schema.prisma",
        mode: "legacy",
      }),
    ],
    external: [
      '@ffmpeg-installer/ffmpeg',
      '@ffprobe-installer/ffprobe',
    ],
  },
});
