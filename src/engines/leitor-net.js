const axios = require('axios').default;
const FormData = require('form-data');

const leitorNet = {
  async searchManga(searchTerm) {
    const form = new FormData();
    form.append('search', searchTerm);

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
    const mangas = result.data.series.map(manga => ({
      id: manga.id_serie,
      title: manga.name,
    }));
    return mangas;
  },
};

module.exports = leitorNet;
