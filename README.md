# k361

## Idea

abc

## Uses

### Right

* a home audio system connected to the small server (for example Raspberry Pi)
* a broadcasting system at school or in the office
* any system with limited memory or storage capacity

### Wrong

* an online radio broadcasting system
* any system requiring strong security or high level of performance

## Installation

### NodeJS

#### Windows and MacOs

[Download](https://nodejs.org/en/download/current/) NodeJS package and follow the installation instructions.

#### Ubuntu

Type in terminal:

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Debian

Type in terminal as root:

```
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y nodejs
```

### k361

#### Windows

abc

#### MacOs, Ubuntu and Debian

In terminal, move to desired location and type:

```
git clone https://github.com/bartlomiej-zdrojewski/k361
cd k361
```

To change the default port, edit the field "port" in the file "config.js":

```
nano config.js
```

To finally run a server, type:

```
node ./app.js
```

Now you can open a browser and go to "localhost:80" or if you changed the port, to "localhost:[port]".

## Used software

* [shortid](https://www.npmjs.com/package/shortid)
* [Express](https://expressjs.com/)
* [NodeJS](https://nodejs.org/en/)
* [AngularJS](https://angularjs.org/)

## License

The MIT License

Copyright 2017 Bartłomiej Zdrojewski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.