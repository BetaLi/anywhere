const fs = require('fs');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const Handlebars = require('handlebars');
const path = require('path');
const conf = require('../config/defaultConf');
const mime = require('../helper/mime');
const compress = require('../helper/compress');
const range =require('../helper/range');
const isFresh = require('../helper/cache');

const tplPath = path.join(__dirname, '../template/dir.html');
const source = fs.readFileSync(tplPath, 'utf-8');
const template = Handlebars.compile(source);

module.exports = async function (req, res, filePath) {
    try{
        const stats = await stat(filePath);
        if(stats.isFile()){
            const content_type = mime(filePath);
            res.setHeader('Content-Type', content_type);

            if(isFresh(stats,req,res)){
                res.statusCode = 304;
                res.end();
                return;
            }

            let rs;
            const {code,start, end} = range(stat.size, req,res);
            if(code === 200){
                res.statusCode = 200;
                rs = fs.createReadStream(filePath);
            }else{
                res.statusCode= 206;
                rs = fs.createReadStream(filePath, {start,end});
            }
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