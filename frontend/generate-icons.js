#!/usr/bin/env node

/**
 * Script para gerar ícones a partir do SVG
 *
 * Este script tenta diferentes métodos para converter o SVG em ICO/PNG
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const svgPath = path.join(__dirname, 'public', 'icon.svg');
const publicDir = path.join(__dirname, 'public');

console.log('🎨 Gerador de Ícones LyricsPro\n');

// Verificar se SVG existe
if (!fs.existsSync(svgPath)) {
  console.error('❌ Arquivo icon.svg não encontrado em public/');
  process.exit(1);
}

console.log('✅ SVG encontrado:', svgPath);
console.log('\n📋 Opções para gerar os ícones:\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('OPÇÃO 1: Usar ferramenta online (RECOMENDADO)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('1. Abra um dos seguintes sites:\n');
console.log('   🔹 https://convertio.co/svg-ico/');
console.log('   🔹 https://cloudconvert.com/svg-to-ico');
console.log('   🔹 https://www.aconvert.com/icon/svg-to-ico/\n');

console.log('2. Faça upload do arquivo:');
console.log('   📁', svgPath, '\n');

console.log('3. Configure as resoluções (selecione todas):');
console.log('   ✓ 16x16');
console.log('   ✓ 32x32');
console.log('   ✓ 48x48');
console.log('   ✓ 64x64');
console.log('   ✓ 128x128');
console.log('   ✓ 256x256\n');

console.log('4. Baixe o arquivo .ico gerado\n');

console.log('5. Renomeie para "icon.ico" e coloque em:');
console.log('   📁', publicDir, '\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('OPÇÃO 2: Usar ImageMagick (se instalado)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar se ImageMagick está instalado
try {
  execSync('magick --version', { stdio: 'ignore' });
  console.log('✅ ImageMagick detectado!\n');
  console.log('Execute o comando abaixo para gerar os ícones:\n');

  const icoPath = path.join(publicDir, 'icon.ico');
  const pngPath = path.join(publicDir, 'icon.png');

  console.log('   # Gerar ICO com múltiplas resoluções:');
  console.log('   magick', svgPath, '-define icon:auto-resize=256,128,64,48,32,16', icoPath, '\n');

  console.log('   # Gerar PNG 512x512:');
  console.log('   magick', svgPath, '-resize 512x512', pngPath, '\n');

  console.log('Deseja executar agora? (s/n): ');

  // Modo não-interativo: apenas mostrar instruções
  console.log('\n💡 Para executar automaticamente, rode:\n');
  console.log('   node generate-icons.js --auto\n');

} catch (error) {
  console.log('❌ ImageMagick não instalado\n');
  console.log('   Para instalar ImageMagick:');
  console.log('   🔗 https://imagemagick.org/script/download.php\n');
  console.log('   Após instalar, rode este script novamente.\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('OPÇÃO 3: Usar Sharp (Node.js)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Instale sharp e png-to-ico:\n');
console.log('   npm install sharp png-to-ico --save-dev\n');
console.log('Depois execute:\n');
console.log('   node generate-icons.js --sharp\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Executar automaticamente se --auto ou --sharp for passado
const args = process.argv.slice(2);

if (args.includes('--auto')) {
  console.log('🚀 Executando conversão com ImageMagick...\n');
  try {
    const icoPath = path.join(publicDir, 'icon.ico');
    const pngPath = path.join(publicDir, 'icon.png');

    console.log('📦 Gerando icon.ico...');
    execSync(`magick "${svgPath}" -define icon:auto-resize=256,128,64,48,32,16 "${icoPath}"`, { stdio: 'inherit' });
    console.log('✅ icon.ico gerado com sucesso!\n');

    console.log('📦 Gerando icon.png...');
    execSync(`magick "${svgPath}" -resize 512x512 "${pngPath}"`, { stdio: 'inherit' });
    console.log('✅ icon.png gerado com sucesso!\n');

    console.log('🎉 Ícones gerados em:', publicDir);
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    console.log('\n💡 Use a OPÇÃO 1 (ferramenta online) em vez disso.');
  }
}

if (args.includes('--sharp')) {
  console.log('🚀 Executando conversão com Sharp...\n');

  try {
    const sharp = require('sharp');
    const pngToIco = require('png-to-ico');

    (async () => {
      try {
        const pngPath = path.join(publicDir, 'icon.png');
        const icoPath = path.join(publicDir, 'icon.ico');

        // Gerar PNG 512x512
        console.log('📦 Gerando icon.png...');
        await sharp(svgPath)
          .resize(512, 512)
          .png()
          .toFile(pngPath);
        console.log('✅ icon.png gerado!\n');

        // Gerar múltiplos PNGs para ICO
        console.log('📦 Gerando ícones em múltiplas resoluções...');
        const sizes = [16, 32, 48, 64, 128, 256];

        // Gerar arquivos PNG temporários
        const tempPngs = [];
        for (const size of sizes) {
          const tempPath = path.join(publicDir, `icon-${size}.png`);
          await sharp(svgPath)
            .resize(size, size)
            .png()
            .toFile(tempPath);
          tempPngs.push(tempPath);
        }

        // Criar ICO
        console.log('📦 Gerando icon.ico...');
        const icoBuffer = await pngToIco(tempPngs);
        fs.writeFileSync(icoPath, icoBuffer);
        console.log('✅ icon.ico gerado!\n');

        // Limpar arquivos temporários
        tempPngs.forEach(file => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });

        console.log('🎉 Ícones gerados com sucesso em:', publicDir);
        console.log('   ✅ icon.png (512x512)');
        console.log('   ✅ icon.ico (múltiplas resoluções)\n');
      } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('\n💡 Use a OPÇÃO 1 (ferramenta online) em vez disso.');
      }
    })();

  } catch (error) {
    console.error('❌ Sharp ou png-to-ico não instalado.');
    console.log('Execute: npm install sharp png-to-ico --save-dev');
  }
}

console.log('\n📝 Após gerar os ícones, você pode buildar o Electron:');
console.log('   npm run electron:build\n');
