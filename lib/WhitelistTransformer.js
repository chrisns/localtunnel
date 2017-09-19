var stream = require('stream');
var util = require('util');
var ip = require('ip');
var Transform = stream.Transform;
var parser = require('http-string-parser');

var WhiteListTransformer = function (opts) {
    if (!(this instanceof WhiteListTransformer)) {
        return new WhiteListTransformer(opts);
    }
    opts = opts || {}
    Transform.call(this, opts);
    var self = this;
    self.subnet = opts.subnet;
    self.path = opts.path
}
util.inherits(WhiteListTransformer, Transform);

WhiteListTransformer.prototype._transform = function (chunk, enc, cb) {
    var self = this;
    var request = parser.parseRequest(chunk.toString());

    let subnets = self.subnet.split(",")
    if (subnets.length > 0 && subnets.filter(subnet => ip.cidrSubnet(subnet).contains(request.headers['x-real-ip'])).length < 1) {
        return self.destroy();
    }
    if (self.path && !request.uri.startsWith(self.path)) {
        return self.destroy()
    }
    return cb(null, chunk);
};

module.exports = WhiteListTransformer;
