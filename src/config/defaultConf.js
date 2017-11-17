module.exports = {
    root: process.cwd(),
    port: 9527,
    hostname: '127.0.0.1',
    compress: /\.(html|css|js|md)/,
    cache: {
        maxAge: 600,
        expires: true,
        cacheControl: true,
        lastModified: true,
        eTag: true
    }
}