module.exports =  (totalSize, req, res)=>{
    const range = req.headers['range'];
    if(!range){
        return {code:200}
    }
    const size = range.match(/bytes = (\d*)-(\d*)/);
    const end = size[2] || totalSize - 1;
    const start =size[1] || totalSize -end;
    if(start<0 || start > end || end <0){
        return {code:200}
    }else {
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Range', `byte ${start}-${end}/${totalSize}`);
        res.setHeader('Content-Length', end-start);
        return {
            code:206,
            start,
            end
        }
    }
}