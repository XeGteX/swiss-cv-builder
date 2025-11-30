import fs from 'fs';
import path from 'path';

// 1. On lit le fichier Repomix
const xmlPath = 'repomix-output.xml';

if (!fs.existsSync(xmlPath)) {
    console.error("❌ ERREUR : Le fichier 'repomix-output.xml' est introuvable !");
    process.exit(1);
}

console.log("🔄 Lecture de la sauvegarde...");
const xmlContent = fs.readFileSync(xmlPath, 'utf8');

// 2. On cherche tous les blocs <file path="...">
const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;

let match;
let count = 0;

while ((match = fileRegex.exec(xmlContent)) !== null) {
    const filePath = match[1];
    let content = match[2];

    // Nettoyage léger du saut de ligne initial
    if (content.startsWith('\n')) {
        content = content.slice(1);
    }

    // 3. On crée les dossiers si nécessaire
    // On utilise process.cwd() pour être sûr d'être à la racine
    const fullPath = path.resolve(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    // 4. On écrit le fichier
    try {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Restauré : ${filePath}`);
        count++;
    } catch (err) {
        console.error(`❌ Echec sur : ${filePath}`, err);
    }
}

console.log(`\n✨ TERMINÉ ! ${count} fichiers ont été restaurés.`);
console.log("👉 Lance 'npm run dev' pour vérifier !");