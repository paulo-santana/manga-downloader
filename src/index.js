import readline from 'readline-sync';
import leitorNet from './engines/leitor-net';

readline.setEncoding('utf8');

async function main() {
  const search = readline.question('Insira nome do manga para busca: ');

  const foundMangas = await leitorNet.searchManga(search);

  const index = readline.keyInSelect(
    foundMangas.map(item => item.title),
    'Qual desses você quer baixar?',
  );
  const selectedManga = foundMangas[index];

  const chapters = leitorNet.getChapters(selectedManga.id);
}

main();
