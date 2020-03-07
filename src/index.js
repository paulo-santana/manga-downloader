const readline = require('readline-sync');
const leitorNet = require('./engines/leitor-net');

readline.setEncoding('utf8');

async function main() {
  const search = readline.question('Insira nome do manga para busca: ');

  const foundMangas = await leitorNet.searchManga(search);

  if (!foundMangas) {
    console.log('Aconteceu um erro, abortando.');
    return;
  }

  const index = readline.keyInSelect(
    foundMangas.map(item => item.title),
    'Qual desses você quer baixar?',
  );
  const selectedManga = foundMangas[index];

  const chapters = await leitorNet.getChapters(selectedManga.id);
  console.log(chapters.map(chapter => chapter.number));

  if (!chapters) {
    console.log('Aconteceu um erro, abortando.');
    return;
  }

  console.log(
    `Esse mangá vai do capítulo ${chapters[0].number} até ${
      chapters[chapters.length - 1].number
    }.`,
  );

  const downloadOption = readline.keyInSelect(
    ['Baixar todos', 'Baixar uma faixa de capítulos específica'],
    'Você quer baiar tudo agora ou quer baixar apenas uma faixa?',
  );

  switch (downloadOption) {
    case 0:
      console.log('Vamos baixar todos então...');
      await leitorNet.downloadAll(chapters);
      break;
    case 1:
      console.log(
        'Agora vamos fazer o downloads das faixas de capítulos que você específicar',
      );
      const firstChapter = readline.question(
        'Digite o primeiro capítulo que quer baixar: ',
      );
      const lastChapter = readline.question('Agora, digite o último: ');
      leitorNet.downloadRange(chapters, firstChapter, lastChapter);
      break;
    case -1: {
      console.log('flw mané!');
    }
  }
}

main();
