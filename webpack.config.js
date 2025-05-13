import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    devtool: 'source-map',
    mode: 'development',
    devServer: {
        hot: false,
        port: 4200
    },
    plugins: [
        new CleanWebpackPlugin({}),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public/index.html'),
            inject: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: false,
                            experimentalWatchApi: true,
                        }
                    }
                ]
            },
            {
                test: /\.(png|svg|jpg|gif|ogg|mp3|txt|yml|hold)$/,
                type: 'asset/resource',
                generator: {
                    filename: (pathData) => {
                        const dirname = path.dirname(pathData.filename)
                        const filename = path.basename(pathData.filename);
                        const name = path.parse(filename).name.toLowerCase();
                        const ext = path.parse(filename).ext.toLowerCase();
                        return `${dirname.substring(4)}/${name}.[hash]${ext}`;
                    }
                }
            },
            {
                test: /\.(glsl|fnt)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: (pathData) => {
                        const filename = path.basename(pathData.filename);
                        const name = path.parse(filename).name.toLowerCase();
                        const ext = path.parse(filename).ext.toLowerCase();
                        return `fonts/${name}.[hash]${ext}`;
                    }
                }
            },
        ]
    },
    resolve: {
        plugins: [
            new TsconfigPathsPlugin({
                /*configFile: "./path/to/tsconfig.json" */
            })
        ],
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[contenthash].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        pathinfo: false
    }
};