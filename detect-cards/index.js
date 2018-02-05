var img = document.querySelector('img');
var canvas = document.createElement('canvas');
canvas.width = img.width;
canvas.height = img.height;
canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

var expectedSize = {
	w: 235,
	h: 335,
}
var currentPoint = {
	x: 0,
	y: img.height - 1,
}
function appendDiv(point, orientation) {
	var div = document.createElement('div');
	
	div.className = orientation;
	div.style.top = point.y + 'px';
	div.style.left = point.x + 'px';
	
	img.parentNode.appendChild(div);
}

function isEdge(point, distance) {
	var edge = canvas.getContext('2d').getImageData(
		point.x + distance - 1, point.y - expectedSize.w, 
		2, expectedSize.w
	).data;
	
	var diff = 0, chunk = 4;
	for (var i = 0; i < edge.length; i = i + chunk*2) {
		diff += (
			Math.abs(edge[i + 0] - edge[i + 0 + chunk]) < 5 &&
			Math.abs(edge[i + 1] - edge[i + 1 + chunk]) < 5 &&
			Math.abs(edge[i + 2] - edge[i + 2 + chunk]) < 5
		) ? 0 : 1;
	}
	
	return diff / expectedSize.w;
}

function hasVerticalEdge(point) {
	return Math.max(
		isEdge(point, expectedSize.w),
		isEdge(point, expectedSize.w+1),
		isEdge(point, expectedSize.w+2)
	);
}

function hasHorizontalEdge(point) {
	return Math.max(
		isEdge(point, expectedSize.h),
		isEdge(point, expectedSize.h+1),
		isEdge(point, expectedSize.h+2)
	);	
}
img.onload = function () {
	return ;
	for (var x = 0; x < img.width; x++) {
		var edge = Math.round(isEdge({x: x, y: currentPoint.y}, 1) * 200);
		var div = document.createElement('span');
		div.style.position = 'absolute';
		div.style.left = (x-3) + 'px';
		div.style.borderLeft = '7px solid rgba(250,0,0,1)';
		div.style.borderTop = '7px solid rgba(250,255,255,1)';
		div.style.height = (edge-7) + 'px';
		div.style.bottom = 0;
		
		if (edge > 190)
		img.parentNode.appendChild(div);
	}
	
//	return;
	
	do {
		var orientation = hasVerticalEdge(currentPoint) > hasHorizontalEdge(currentPoint) ? 'vertical' : 'horizontal';
		
		console.log('Card at {', currentPoint.x + ", " + currentPoint.y, '} orientation is ', orientation);
		console.log({
			vertical: hasVerticalEdge(currentPoint),
			horizontal: hasHorizontalEdge(currentPoint)
		});
		
		appendDiv(currentPoint, orientation)
		
		currentPoint = {
			x: currentPoint.x + ((orientation === 'horizontal') ? expectedSize.h : expectedSize.w),
			y: currentPoint.y
		}
		
	} while(currentPoint.x < img.width);
}