# k361

## Idea

[TODO]

## Applications

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

### FFmpeg

#### Windows

Copy *ffmpeg.exe* file from *external* directory to *k361* directory.

#### MacOs, Ubuntu and Debian

[TODO]

### MPlayer

#### Windows

Copy *mplayer.exe* file from *external* directory to *k361* directory.

#### MacOs, Ubuntu and Debian

Type in terminal:

```
sudo apt-get install mplayer
```

### k361

#### Windows

[Download](https://github.com/bartlomiej-zdrojewski/k361/archive/master.zip) repository and unzip it in desired location.

To change the default port, open the *config.js* file in notepad and edit the *port* field.

To finally run a server, open terminal (command line), go to *k361* directory location (using `cd` command) and type:

```
npm install
node ./app.js
```

Now you can open a web browser and go to `localhost`, or if you changed the port, to `localhost:[port]`.

If you want to access the server from different device, you should open there a web browser and go to `[network].[host]:[port]`. For example address `192.168.1.101:80` represents network `192.168.1.XXX`, host `101` and port `80`. You can simply check the proper network and host values by typing in terminal `ipconfig` and looking at the *IPv4 Address* field.

You may consider automatically launching a server on system startup. If you are intrested, [see this tutorial](https://www.howtogeek.com/228467/how-to-make-a-program-run-at-startup-on-any-computer/).

#### MacOs, Ubuntu and Debian

In terminal, go to desired location (using `cd` command) and type:

```
git clone https://github.com/bartlomiej-zdrojewski/k361
cd k361
```

To change the default port, edit the *port* field in the *config.js* file:

```
nano config.js
```

To finally run a server, type:

```
npm install
node ./app.js
```

Now you can open a web browser and go to `localhost`, or if you changed the port, to `localhost:[port]`.

If you want to access the server from different device, you should open there a web browser and go to `[network].[host]:[port]`.
For example address `192.168.1.101:80` represents network `192.168.1.XXX`, host `101` and port `80`. You can simply check the proper network and host values by typing in terminal `ifconfig` and looking at the *inet* field.

You may consider automatically launching a server on system startup. If you are intrested, [see this tutorial](https://www.howtogeek.com/228467/how-to-make-a-program-run-at-startup-on-any-computer/).

## Used software

* [NodeJS](https://nodejs.org/en/)
* [Express](https://expressjs.com/)
* [AngularJS](https://angularjs.org/)
* [MPlayer](http://www.mplayerhq.hu/)
* [FFmpeg](https://ffmpeg.org/)

## License

MIT License

Copyright (c) 2017 Bartłomiej Zdrojewski
