var fs      = require('fs')
,   Stream  = require('stream')
,   Event   = require('events')
,   Promise = require('bluebird')
,   temp    = require('temp')
,   ffmpeg  = require('fluent-ffmpeg')
,   assign  = require('lodash.assign')
,   Encoder;

/**
 * Shim FS/Temp
 */
fs   = Promise.promisifyAll(fs);
temp = Promise.promisifyAll(temp);

/**
 * Encoder class
 */
Encoder = function (input, options) {
  Event.EventEmitter.call(this);

  options = options || {};

  this.formats = options.formats || {};
  this.outputs = [];
  this.through = new Stream.PassThrough();

  if (!input.readable) input = fs.createReadStream(input);
  input.pipe(this.through);

  return this;
};

require('util').inherits(Encoder, Event.EventEmitter);

Encoder.prototype.prime = function () {
  var self    = this
  ,   outputs = [];

  for (var key in this.formats) {
    outputs.push(assign(self.formats[key], {
      format: key,
      file: temp.openAsync({ suffix: '.' + key })
    }));
  }

  self.outputs = Promise.map(outputs, function (output) {
    return Promise.props(output)
  });

  return self.outputs;
};

Encoder.prototype.encode = function () {
  var self = this;

  return self.prime().then(function (outputs) {
    return new Promise(function (resolve, reject) {
      if (!outputs.length) {
        return reject(new Error('You must supply output formats.'));
      }

      var proc = ffmpeg(self.through);

      outputs.forEach(function (output) {
        proc
          .output(output.file.path)
          .audioChannels(output.channels || 2)

        if (output.codec) proc.audioCodec(output.codec);
        if (output.bitrate) proc.audioBitrate(output.bitrate);
        if (output.frequency) proc.audioFrequency(output.frequency);
        if (output.options) proc.outputOptions(output.options);
      });

      proc
        .on('progress', function (progress) {
          self.emit('progress')
        })
        .on('message', function (message) {
          self.emit('message')
        })
        .on('error', function (error) {
          return reject(error);
        })
        .on('end', function () {
          resolve(outputs);
        })
        .run();
    });
  });
};

Encoder.prototype.cleanup = function () {
  return Promise.map(this.outputs, function (output) {
    return fs.unlinkAsync(output.file.path);
  });
}

module.exports = function (input, options) {
  options = options || {};
  return new Encoder(input, options);
};
