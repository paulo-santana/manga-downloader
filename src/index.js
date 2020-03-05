const readline = require('readline-sync');
const axios = require('axios').default;
const FormData = require('form-data');
const qs = require('qs');

readline.setEncoding('utf8');

async function searchManga() {
  const search = readline.question('Insira nome do mangá para busca: ');

  const form = new FormData();
  form.append('search', search);

  try {
    const result = await axios({
      method: 'post',

      headers: {
        'content-type': 'aaplication/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        ...form.getHeaders(),
      },
      url: 'https://leitor.net/lib/search/series.json',
      data: form,
    });

    console.log(result.data);
  } catch (error) {
    // console.error('DEU RUIM: ', error);
    console.error('DEUM RUIM um pouco só', error.response.data);
  }
}

searchManga();
