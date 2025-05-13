import path from 'path';
import { Configuration } from 'webpack';
import 'webpack-dev-server';
import nodeExternals from 'webpack-node-externals';

const config: Configuration = {
  target: 'node',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 4000,
  },
  externals: [nodeExternals()],
  mode: 'production',
};

export default config;
