import path from 'path';
import express, { Request, Response } from 'express';
import { Compiler } from 'webpack';
import WebpackDevMiddleware from 'webpack-dev-middleware';

export function devServer(compiler: Compiler) {
    const app = express();
    const middlewareOptions = {
        writeToDisk: true,
        watch: true,
        watchOptions: {
            ignored: ['node_modules', 'script', 'doc', 'test', 'dist'],
            aggregateTimeout: 300,
            poll: 1000,
        },
        stats: {
            all: false,
            timings: false,
            errors: true,
            errorDetails: true,
            warnings: false,
            colors: true,
        },
    };
    let middleware
    
    try {
        middleware = WebpackDevMiddleware(compiler, middlewareOptions);
    } catch (err) {
        debugger
    }
    // app.use(middleware);

    // app.get('/', (req: Request, res: Response) => {
    //     const handleRequest = () => {
    //         const fileName = path.resolve(process.cwd(), './dev/index.html');
    //         try {
    //             const htmlFileBuffer: Buffer = (middleware as any).fileSystem.readFileSync(fileName);
    //             if (htmlFileBuffer) {
    //                 let htmlString = htmlFileBuffer.toString();
    //                 res.set('Content-Type', 'text/html');
    //                 res.send(htmlString);
    //             }
    //         } catch (error) {
    //             middleware.waitUntilValid(() => {
    //                 handleRequest();
    //             });
    //         }
    //     };
    //     handleRequest();
    // });

    // app.listen(9000, () => {
    //     console.log(`http://127.0.0.1:${9000}`);
    // });
}
