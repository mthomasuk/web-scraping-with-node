const Scraperoo = require('../../index.js');
const Server = require('../../server.js');

test('scrapeUrl should return an array of URLs that are relative to a given page and do not cross sub-domains', () => {
    const {
        scrapeAssets
    } = Scraperoo;

    const html = `
      <html>
        <body>
          <img src="/one.jpg" />
          <script src="/two.js"></script>
          <link rel="stylesheet" href="http://0.0.0.0:3001/three.css" />
        </body>
      </html>
    `;

    Server.spawn(html, 3001);

    return scrapeAssets('http://0.0.0.0:3001')
        .then((assets) => {
            expect(assets).toEqual({
                url: 'http://0.0.0.0:3001',
                assets: [
                    'http://0.0.0.0:3001/two.js',
                    'http://0.0.0.0:3001/one.jpg',
                    'http://0.0.0.0:3001/three.css'
                ]});
            Server.kill();
        });

});
