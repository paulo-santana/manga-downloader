const axios = require('axios').default;
const FormData = require('form-data');
const Fs = require('fs');
const Path = require('path');

const leitorNet = {
  config: {
    searchUrl: 'https://leitor.net/lib/search/series.json',
    listChaptersUrl: 'https://leitor.net/series/chapters_list.json',
    chapterPagesUrl: 'https://leitor.net/leitor/pages/',
  },
  async searchManga(searchTerm) {
    const form = new FormData();
    form.append('search', searchTerm);

    try {
      const result = await axios({
        method: 'post',
        headers: {
          'content-type': 'aaplication/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          ...form.getHeaders(),
        },
        url: this.config.searchUrl,
        data: form,
      });
      const mangas = result.data.series.map(manga => ({
        id: manga.id_serie,
        title: manga.name,
      }));
      return mangas;
    } catch (error) {
      console.error('DEU RUIM', error);
      return false;
    }
  },
  async getChapters(mangaId) {
    const chapters = [];
    let page = 1;
    let response = {};
    try {
      do {
        response = await axios({
          method: 'get',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          url: `${this.config.listChaptersUrl}?page=${page}&id_serie=${mangaId}`,
        });

        if (response.data.chapters) {
          chapters.push(...response.data.chapters);
          page++;
        }
      } while (response.data.chapters);
      return chapters.reverse();
    } catch (error) {
      console.error(error.response.data);
      return false;
    }
  },

  async downloadAll(chapters) {
    const length = chapters.length;
    for (let i = 0; i < length; i++) {
      const chapter = chapters[i];
      const release = Object.values(chapter.releases)[0];

      const token = await this.getChapterToken(release.link);

      const url = `${this.config.chapterPagesUrl}${release.id_release}.json`;

      console.log(
        `Baixando páginas do capítulo ${chapter.number} - ${chapter.chapter_name}`,
      );
      const response = await axios({
        method: 'get',
        url,
        params: {
          key: token,
        },
      });

      const { images } = response.data;
      chapterName = `${chapter.number.padStart(3, '0')} - ${
        chapter.chapter_name
      }`;
      const mangaName = chapter.name;
      await this.downloadImages(images, chapterName, mangaName);
      await this.timeout(5000);
    }
  },

  async getChapterToken(link) {
    const chapterPageUrl = `https://leitor.net${link}`;
    const chapterPage = await axios.get(chapterPageUrl);
    const token = chapterPage.data.match(
      new RegExp(/[\&\?]token\=(\w+)\&?/i),
    )[1];
    return token;
  },

  async downloadImages(images, chapterName, manga) {
    const { length } = images;
    for (let i = 0; i < length; i++) {
      const image = images[i];
      try {
        const response = await axios({
          method: 'get',
          url: image,
          responseType: 'stream',
        });

        const pageFullName = image.split('/');
        const page = pageFullName[pageFullName.length - 1];
        const path = Path.resolve(
          __dirname,
          '..',
          '..',
          'mangas',
          manga,
          chapterName,
          page,
        );

        Fs.mkdirSync(path.slice(0, path.length - page.length), {
          recursive: true,
        });
        console.log(`salvando página ${page}...`);
        await this.saveImage(path, response.data);
      } catch (error) {
        console.error('Aconteceu um erro ao baixar a imagem: ', error);
        i--; // try this page again
        // process.exit(31);
      }
    }
  },

  saveImage(path, imageData) {
    const writer = Fs.createWriteStream(path, { autoClose: true });
    imageData.pipe(writer);

    const finish = new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return finish;
  },

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve), ms);
  },
};

module.exports = leitorNet;
