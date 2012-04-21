# Hubot Airbrake Script

## Description

Hubot Airbrake is a simple but yet powerful Airbrake API wrapper for GitHub's Hubot.

## Install

```
$ npm install hubot-airbrake
```

## Usage

You have to set the following env variables:

```
AIRBRAKE_PROJECT - your project name

AIRBRAKE_AUTH_TOKEN - auth token for airbrake

AIRBRAKE_INTERVAL - set this if you want Hubot to notify you about the unresolved errors (in ms)
```

After that you have to put the script in the `scripts/` directory of your Hubot.

Restart Hubot and you are ready to go.

## Tests

The tests are powered by [Chai](http://chaijs.com). Running tests is simple:

    npm install
    make test

## Contributing

Interested in contributing? Fork to get started.

## License

MIT License

Copyright (c) 2012 LOOKK Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
