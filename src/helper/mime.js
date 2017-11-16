const path = require('path');


const mimeTypes={
    'css':'text/css',
    'gif':'image/gif',
    'html': 'text/plain',
    'text': 'text/plain',
    'js':'text/javascript',
    'json':'application/json',
    'png':'image/png'
}

module.exports = (filePath) =>{
    let ext = path.extname(filePath)
        .split('.')
        .pop()
        .toLowerCase();
    if(!ext){
        ext = filePath;
    }
    return mimeTypes[ext] || mimeTypes['text']
}