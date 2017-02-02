const http = require('http');
const chalk = require('chalk');

module.exports = {

    spawn: function(content, port) {

        const requestHandler = (request, response) => {
            if(Array.isArray(content)) {
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(JSON.stringify({
                    count: content.length,
                    content: content
                }));
            } else {
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.end(content);
            }
        };

        this.server = http.createServer(requestHandler);

        this.server.listen(port ? port : 3000, (err) => {

            console.log(chalk.green('Also serving JSON here:'), chalk.yellow.underline(`http://0.0.0.0:${port ? port : 3000}`));
            console.log(chalk.red('Mash CTRL+C to shut this whole mess down and get on with your life'));

            if (err) {
                return console.log(err);
            }

        });
    },

    kill: function() {
        this.server.close();
    }

};
