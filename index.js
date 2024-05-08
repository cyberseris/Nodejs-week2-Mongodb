const http = require('http');
const Post = require('./models/postsModel');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB)
    .then(() => console.log('資料庫連接成功'));

const requestListener = async (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    let body = "";
    req.on('data', chunk => {
        body += chunk;
    })

    if (req.url == '/' && req.method == "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "message": "Hello world"
        }));
        res.end();

    } else if (req.url == '/posts' && req.method == "GET") {
        const post = await Post.find();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            post
        }));
        res.end();
    } else if (req.url == '/posts/' && req.method == "GET") {
        const id = req.url.split('/').pop();
        const post = await Post.find(id);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": post
        }));
        res.end();
    } else if (req.url == "/posts" && req.method == "POST") {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const name = data.name?.trim() || '';
                const tags = data.tags || '';
                const type = data.type?.trim() || '';
                const image = data.image?.trim() || '';
                const content = data.content?.trim() || '';

                if (content !== undefined) {
                    const newPost = await Post.create({
                        name: name,
                        tags: tags,
                        type: type,
                        image: image,
                        content: content,
                    })
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": newPost,
                    }));
                    res.end();
                } else {
                    res.writeHead(400, headers);
                    res.write(JSON.stringify({
                        "status": "false",
                        "message": error,
                    }));
                    res.end();
                }
            } catch (error) {
                res.write(JSON.stringify({
                    "status": "false",
                    "message": error,
                }));
                res.end()
            }
        })
    } else if (req.url == "/posts" && req.method == "DELETE") {
        await Post.deleteMany();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": null
        }));
        res.end();
    } else if (req.url.startsWith("/posts/") && req.method == "DELETE") {
        const id = req.url.split('/').pop();
        const post = await Post.findByIdAndDelete(id);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": post
        }));
        res.end();
    } else if (req.url.startsWith("/posts/") || req.method == "PATCH") {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const name = data.name?.trim() || '';
                const tags = data.tags || '';
                const type = data.type?.trim() || '';
                const image = data.image?.trim() || '';
                const content = data.content?.trim() || '';
                const likes = data.likes;
                const comments = data.comments;

                if (!Array.isArray(tags)) {
                    res.writeHead(400, headers);
                    res.write(JSON.stringify({
                        "status": "false",
                        "message": "tags 欄位格式錯誤，請輸入陣列，ex: ['幹話', '醚因']"
                    }))
                    res.end()
                }

                if (data.content !== undefined) {

                    const id = req.url.split('/').pop();
                    await Post.findByIdAndUpdate(id, {
                        name: name,
                        tags: tags,
                        type: type,
                        image: image,
                        content: content,
                        likes: likes,
                        comments: comments
                    })
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": data
                    }))
                    res.end();
                } else {
                    res.writeHead(400, headers);
                    res.write(JSON.stringify({
                        "status": "false",
                        "message": "更新失敗"
                    }))
                    res.end()
                }
            } catch {
                res.writeHead(400, headers);
                res.write(JSON.stringify({
                    "status": "false",
                    "message": "更新失敗"
                }))
                res.end()
            }
        })

    } else if (req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網路路由"
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(3000);
