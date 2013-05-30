// This icon animation code is derived from the Google Mail Checker extension that is
// available as a sample on developer.chrome.com.
// http://developer.chrome.com/extensions/examples/extensions/gmail.zip
// Copyright (c) 2012 The Chromium Authors. All rights reserved.

var ease = function(t) {
	return t<0.5 ? 2*t*t : -1+(4-2*t)*t;
};

var Animation = function() {
	this.state = false;
	this.rotation = 0;
	this.animationFrames = 36;
	this.animationSpeed = 40;
	this.canvas = document.getElementById('canvas');
	this.canvasContext = this.canvas.getContext('2d');
	this.icon = document.getElementById('logged');
};

Animation.prototype.start = function() {
	var self   = this;
	this.state = true;

	var cb = function() {
		if (self.state) {
			self.animateFlip(cb);
		} else {
			if (self.whenDone) {
				self.whenDone();
				delete self.whenDone;
			}
		}
	};

	this.animateFlip(cb);
};

Animation.prototype.stop = function() {
	this.state = false;
};

// Poor man's events
Animation.prototype.doNext = function(cb) {
	if (this.state || this.rotation !== 0) {
		this.whenDone = cb;
	} else {
		cb();
	}
};

Animation.prototype.animateFlip = function(cb) {
	this.rotation += 1 / this.animationFrames;
	this.drawIconAtRotation();

	if (this.rotation <= 1) {
		setTimeout(this.animateFlip.bind(this, cb), this.animationSpeed);
	} else {
		this.rotation = 0;
		if (cb) {
			cb();
		}
	}
};

Animation.prototype.drawIconAtRotation = function() {
	this.canvasContext.save();
	this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
	this.canvasContext.translate(
		Math.ceil(this.canvas.width/2),
		Math.ceil(this.canvas.height/2));
	this.canvasContext.rotate(2*Math.PI*ease(this.rotation));
	this.canvasContext.drawImage(this.icon,
		-Math.ceil(this.canvas.width/2),
		-Math.ceil(this.canvas.height/2));
	this.canvasContext.restore();
	chrome.browserAction.setIcon({imageData:this.canvasContext.getImageData(0, 0,
		this.canvas.width, this.canvas.height)});
};

Animation.prototype.drawIcon = function(id) {
	this.icon = document.getElementById(id);
	this.drawIconAtRotation();
};
