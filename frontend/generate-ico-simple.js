#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

const publicDir = path.join(__dirname, 'public');
const svgPath = path.join(publicDir, 'icon.svg');
const pngPath = path.join(publicDir, 'icon.png');
const icoPath = path.join(publicDir, 'icon.ico');

console.log('🎨 Gerando ícones LyricsPro...\n');

(async () => {
  try {
    // 1. Gerar PNG 512x512
    console.log('📦 Gerando icon.png (512x512)...');
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(pngPath);
    console.log('✅ icon.png gerado!\n');

    // 2. Gerar PNGs em múltiplas resoluções para o ICO
    console.log('📦 Gerando ícones em múltiplas resoluções...');
    const sizes = [16, 32, 48, 64, 128, 256];
    const pngBuffers = [];

    for (const size of sizes) {
      console.log(`   ↳ ${size}x${size}`);
      const buffer = await sharp(svgPath)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
    }

    // 3. Criar ICO
    console.log('\n📦 Gerando icon.ico...');
    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✅ icon.ico gerado!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Ícones gerados com sucesso!\n');
    console.log('📁 Local:', publicDir);
    console.log('   ✅ icon.svg (original)');
    console.log('   ✅ icon.png (512x512)');
    console.log('   ✅ icon.ico (16,32,48,64,128,256)\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🚀 Próximo passo: Gerar o executável');
    console.log('   npm run electron:build\n');

  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
