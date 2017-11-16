const fs = require('fs');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const Handlebars = require('handlebars');
const path = require('path');
const conf = require('../config/defaultConf');
const mime = require('../helper/mime');
const compress = require('../helper/compress');

const tplPath = path.join(__dirname, '../template/dir.html');
const source = fs.readFileSync(tplPath, 'utf-8');
const template = Handlebars.compile(source);

module.exports = async function (req, res, filePath) {
    try{
        const stats = await stat(filePath);
        if(stats.isFile()){
            const content_type = mime(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', content_type);
            // fs.readFile(filePath, (err, data) => {
            //     res.end(data)});   虽然这也是异步的读取方式，但这需要将整个文件读完之后才可以输出到页面上，性能没有createReadStream好。
            let rs = fs.createReadStream(filePath);
            if(filePath.match(conf.compress)){
                rs = compress(rs, req, res);
            }
            rs.pipe(res);
        }
        else if (stats.isDirectory()){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            const files = await readdir(filePath);
            const dir = path.relative(conf.root, filePath);
            const data = {
                title: path.basename(filePath),
                dir: dir ? `/${dir}`: '',
                files: files.map(file => {
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            };
            res.end(template(data));
        }
    }catch (ex){
        console.log(ex);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`${filePath} is not a directory or file`);
    }
}