var img = document.querySelector('img');
var canvas = document.createElement('canvas');
canvas.width = img.width;
canvas.height = img.height;
canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

var expectedSize = {
	w: 235,
	h: 335,
}
var CARD_WIDTH = 235;
var CARD_HEIGHT = 335;
var EDGE_LENGTH = 100;
var CHUNK = 4;

function isColorSimilar(alpha, bravo) {
	return  Math.abs(alpha.r - bravo.r) < 5 &&
			Math.abs(alpha.g - bravo.g) < 5 &&
			Math.abs(alpha.b - bravo.b) < 5;
}

function arrayToColor(arr) {
	return {r: arr[0], g: arr[1], b: arr[2]}
}

function isVerticalEdge(point, distance) {
	var edge = canvas.getContext('2d').getImageData(
		Math.max(point.x + distance -1, 0), Math.max(point.y - EDGE_LENGTH, 0), 
		2, EDGE_LENGTH*2
	).data;
	
	var diff = 0;
	for (var i = 0; i < edge.length; i = i + CHUNK*2) {
		diff += isColorSimilar(
			arrayToColor(edge.slice(i,i+3)), 
			arrayToColor(edge.slice(i+CHUNK,i+CHUNK+3))
		) ? 0 : 1;
	}
	
	return diff > EDGE_LENGTH*0.9;
}

function isHorizontalEdge(point, distance) {
	var edge = canvas.getContext('2d').getImageData(
		Math.max(point.x - EDGE_LENGTH, 0), Math.max(point.y + distance -1, 0),
		EDGE_LENGTH*2, 2
	).data;

	var diff = 0;
	for (var i = 0; i < edge.length/2; i = i + CHUNK) {
		diff += isColorSimilar(
			arrayToColor(edge.slice(i,i+3)), 
			arrayToColor(edge.slice(i+edge.length/2,i+edge.length/2+3))
		) ? 0 : 1;
	}

	return diff > EDGE_LENGTH*0.9;
}

img.onclick = function (e) {
	var pt = {x: e.offsetX, y: e.offsetY }
	var orientation;
	
	for (d = 0; d < 335; d++) {
		if (isVerticalEdge(pt, d)) {
			if (isVerticalEdge(pt, d - CARD_WIDTH) || (pt.x + d == CARD_WIDTH)) {
				orientation = 'vertical';
				break;
			} else if (isVerticalEdge(pt, d - CARD_HEIGHT)  || (pt.x + d == CARD_HEIGHT)) {
				orientation = 'horizontal';
				break;
			} else {
				console.log("false positive vertical edge for x ", pt.x + d, (CARD_HEIGHT))
			}
		}
	}
	
	if (!orientation) {
		console.log("Couldn’t detect a vertical edge");
		return ;
	}
	
	// store left edge
	pt.x = pt.x + d - ((orientation === 'horizontal') ? CARD_HEIGHT : CARD_WIDTH);
	
	var verticalSize = (orientation === 'horizontal') ? CARD_WIDTH : CARD_HEIGHT;
	
	var p2 = {x:e.offsetX, y:e.offsetY};
	for (d = 0; d < verticalSize; d++) {
		if (isHorizontalEdge(p2, d)) {
			if (!isHorizontalEdge(p2, d - verticalSize)) {
				console.log("false positive horizontal edge for x ", pt.x + d)
				continue;
			}
			
			// store bottom edge
			pt.y = pt.y + d;
			break;
		}
	}
	
	var div = img.parentNode.appendChild(document.createElement('div'));
	div.className = orientation;
	div.style.top = pt.y + 'px';
	div.style.left = pt.x + 'px'
	
	div.onclick = function () { this.parentNode.removeChild(this); }
	
	
}