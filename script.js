/******* Date: 02.05.2015 *******/
/***** Author: Max Ehbauer ******/
/********************************/ 
"use strict;"

var positions = [
 ["def", "bhj"],
 ["dei", "bgh", "ade", "bch"],
 ["deh", "bdh", "bde", "beh"],
 ["deg", "abh", "cde", "bhi"],
 ["ehi"],
 ["dhi", "ceh"],
 ["egh", "bei"]
];

var gameRunning = false;
var pause = false;
var speed;
var coordinates = new Array(285);
var timer;
var mainBrick;
var nextType = -1;

/* Variablen zum Zählen des Scores. */
var tetrisParts = 0;
var lines = 0;
var points = 0; 

window.onload = function(){
	var startButton = document.getElementById("start-button");
	var pauseButton = document.getElementById("pause-button");
	var controlSelect = document.getElementById("control-select");
	var musicCheckbox = document.getElementById("music-checkbox");
	var radioSpeed = document.getElementsByName("speed");
	var audio = document.getElementById("audiofile");
	var gameOverBox = document.getElementById("game-over");
	
	musicCheckbox.onchange = function(){
		if (musicCheckbox.checked && gameRunning && !pause) { audio.play(); audio.volume = 0.7; }
		if (!musicCheckbox.checked && gameRunning && !pause) { audio.pause(); audio.currentTime = 0; }		
	}
	
	startButton.onclick = function(){
		if (!gameRunning){
			startGame();
			gameOverBox.style.display = "none";
			controlSelect.disabled = true;
			pauseButton.disabled = false;
			startButton.disabled = true;
			startButton.setAttribute("class", "disabled");
			pauseButton.removeAttribute("class");
			for (var i = 0; i < radioSpeed.length; i++) 
				radioSpeed[i].disabled = true;
			if (musicCheckbox.checked) {
				 audio.play(); 
				 audio.volume = 0.7;
			}
		}
	}
	
	pauseButton.onclick = function(){
		if (!gameRunning)
			return; 
			
		if (!pause) {
			pause = true;
			if (musicCheckbox.checked) audio.pause();
			controlSelect.disabled = false;
			pauseButton.innerHTML = "Spiel fortsetzen [P]";
			clearInterval(timer);
		}
		else {
			pause = false;
			if (musicCheckbox.checked) {
				audio.play();
				audio.volume = 0.7;
			}
			controlSelect.disabled = true;
			pauseButton.innerHTML = "Spiel pausieren [P]";
			timer = setInterval(function(){moveBricksDown()}, speed);
		}
	}
	window.onkeydown = function(event){
		if (event.keyCode == 13 && !gameRunning)
			startButton.click(); 
		if (event.keyCode == 80 && gameRunning)
			pauseButton.click();
			
		/* Steuerung mit Pfeiltasten */
		if (event.keyCode == 37 && gameRunning && !pause && controlSelect.selectedIndex == 0)
			moveBricksLeft();
		if (event.keyCode == 38 && gameRunning && !pause && controlSelect.selectedIndex == 0)
			changeStatus();
		if (event.keyCode == 39 && gameRunning && !pause && controlSelect.selectedIndex == 0)
			moveBricksRight();
		if (event.keyCode == 40 && gameRunning && !pause && controlSelect.selectedIndex == 0)
			moveBricksDown();
			
		/* Steuerung mit W,A,S,D */
		if (event.keyCode == 65 && gameRunning && !pause && controlSelect.selectedIndex == 1)
			moveBricksLeft();
		if (event.keyCode == 87 && gameRunning && !pause && controlSelect.selectedIndex == 1)
			changeStatus();
		if (event.keyCode == 68 && gameRunning && !pause && controlSelect.selectedIndex == 1)
			moveBricksRight();
		if (event.keyCode == 83 && gameRunning && !pause && controlSelect.selectedIndex == 1)
			moveBricksDown();
	}
}

function startGame(){
	gameRunning = true;
	nextType = -1;
	points = 0;
	tetrisParts = 0;
	lines = 0;
	document.getElementById("tetris-parts-count").innerHTML = 0;
	document.getElementById("points").innerHTML = 0;
	document.getElementById("lines-count").innerHTML = 0;
	
	for (var i = 0; i < 285; i++)
		coordinates[i] = 0;
	
	var box2 = document.getElementsByClassName("box2");
	while (box2.length > 0)
		box2[0].parentNode.removeChild(box2[0]);
	
	/* Hier wird das erste Bauteil erstellt. */	
	mainBrick = new MainBrick();
	
	var radioSpeed = document.getElementsByName("speed");
	for (var i = 0; i < radioSpeed.length; i++) {
		if (radioSpeed[i].checked) {
			switch (i) {
				case 0: speed = 500; break;
				case 1: speed = 380; break;
				case 2: speed = 280; break;
				case 3: speed = 180; break;
			}
			break;
		}
	}
	timer = setInterval(function(){moveBricksDown()}, speed);
}

function MainBrick(){
	
	function NormalBrick(brickPositions, position){
		var top = 0;
		var left = 0;
		var x = 0;
		switch (position) {
			case "d": top = -1; left = 179; break;
			case "e": top = -1; left = 239; break;
			case "f": top = -1; left = 269; break;
			case "g": top = 29; left = 179; break;
			case "h": top = 29; left = 209; break;
			case "i": top = 29; left = 239; break;
			case "j": top = 29; left = 209; break;
		}
		this.setTop = function(newTop){
			top = newTop;
		}
		this.setLeft = function(newLeft){
			left = newLeft;
		}
		this.getTop = function(){
			return top;
		}
		this.getLeft = function(){
			return left;
		}
	} // end NormalBrick
	
	var type;
	if (nextType == -1)
		type = Math.floor(Math.random() * 7); // Zahl zwischen 0 und 6, legt den Typ des aktuellen Bauteils fest
	else type = nextType;
	nextType = Math.floor(Math.random() * 7); // Zahl zwischen 0 und 6, legt den Typ des nächsten Bauteils fest
	
	var status = 0; // am Anfang immer 0, legt den gedrehten Zustand des Bauteils fest
	var brickPositions = positions[type][status];
	var left = 209;
	var top = -1;
	var color;
	switch(type) {
		case 0: color = "orange"; break;
		case 1: color = "#aa00ff"; break;
		case 2: color = "#5649ff"; break;
		case 3: color = "#00d8ff"; break;
		case 4: color = "#ff0000"; break;
		case 5: color = "#6edd4f"; break;
		case 6: color = "yellow"; break;
	}
	
	/* Jeder mainBrick ist von 3 normalBricks umgeben. */
	var normalBricks = new Array(3);
	normalBricks[0] = new NormalBrick(brickPositions, brickPositions.slice(0,1)); 	
	normalBricks[1] = new NormalBrick(brickPositions, brickPositions.slice(1,2)); 
	normalBricks[2] = new NormalBrick(brickPositions, brickPositions.slice(2,3)); 
	
	/* Wenn die Stelle des neu erzeugten Bauteils bereits besetzt ist, dann ist das Spiel vorbei. */
	if (checkCoordinates(top, left) || checkCoordinates(normalBricks[0].getTop(), normalBricks[0].getLeft()) || 
	    checkCoordinates(normalBricks[1].getTop(), normalBricks[1].getLeft()) || 
		checkCoordinates(normalBricks[2].getTop(), normalBricks[2].getLeft())){
			gameOver();
			return;
		}

	/* Alle 4 neu erstellten Boxen anzeigen. */
	for (var i = 0; i < 4; i++) {
		var tempTop;
		var tempLeft;
		if (i == 0) {
			tempTop = top;
			tempLeft = left;
		} else {
			tempTop = normalBricks[i-1].getTop();
			tempLeft = normalBricks[i-1].getLeft();
		}
		var tetrisWrapper = document.getElementById("tetris-wrapper");
		var box = document.createElement("div");
		box.setAttribute("class", "box");
		box.setAttribute("style", "top:" + tempTop + "px; " + "left:" + tempLeft + "px;" + "background:" + color);
		tetrisWrapper.appendChild(box);
	}
	
	/* Oben rechts wird angezeigt, welches das nächste Bauteil ist, das erscheinen wird. */ 
	/* In folgenden Programmzeilen werden die <div>-Container nur zur Visualisierung erzeugt. */
	if (document.getElementById("tetris-caption"))
		document.getElementById("tetris-caption").parentNode.removeChild(document.getElementById("tetris-caption"));
		
	while (document.getElementsByClassName("nextBox").length > 0)
		document.getElementsByClassName("nextBox")[0].parentNode.removeChild(document.getElementsByClassName("nextBox")[0]);
		
	var infoBox = document.getElementById("info-wrapper"); 
	var nextBox;
	switch(nextType){
		case 0: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:orange; left:50px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:orange; left:80px; top:60px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:orange; left:110px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:orange; left:140px; top:60px;"); infoBox.appendChild(nextBox); 
			break;
		case 1: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#aa00ff; left:70px; top:60px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#aa00ff; left:100px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#aa00ff; left:130px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#aa00ff; left:130px; top:90px;"); infoBox.appendChild(nextBox); 
			break;
		case 2: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#5649ff; left:70px; top:60px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#5649ff; left:100px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#5649ff; left:130px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#5649ff; left:100px; top:90px;"); infoBox.appendChild(nextBox); 
			break;
		case 3: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#00d8ff; left:70px; top:60px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#00d8ff; left:100px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#00d8ff; left:130px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#00d8ff; left:70px; top:90px;"); infoBox.appendChild(nextBox); 
			break;
		case 4: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#ff0000; left:70px; top:60px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#ff0000; left:100px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#ff0000; left:70px; top:90px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#ff0000; left:100px; top:90px;"); infoBox.appendChild(nextBox); 
			break;
		case 5: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#6edd4f; left:70px; top:60px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#6edd4f; left:100px; top:60px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#6edd4f; left:100px; top:90px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:#6edd4f; left:130px; top:90px;"); infoBox.appendChild(nextBox); 
			break;
		case 6: 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:yellow; left:100px; top:50px;"); infoBox.appendChild(nextBox);
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:yellow; left:130px; top:50px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:yellow; left:70px; top:80px;"); infoBox.appendChild(nextBox); 
			nextBox = document.createElement("div"); nextBox.setAttribute("class", "nextBox"); nextBox.setAttribute("style", "background:yellow; left:100px; top:80px;"); infoBox.appendChild(nextBox); 
			break;
	}
	
	/* Nach der erfolgreichen Erzeugung eines Teils werden die Punkte angepasst. */
	tetrisParts++;
	points += 100;
	document.getElementById("tetris-parts-count").innerHTML = tetrisParts;
	document.getElementById("points").innerHTML = points;
	
	this.setTop = function(newTop){
		top = newTop;
	}
	this.setLeft = function(newLeft){
		left = newLeft;
	}
	this.getTop = function(){
		return top;
	}
	this.getLeft = function(){
		return left;
	}
	this.getType = function(){
		return type;
	}
	this.getStatus = function(){
		return status;
	}
	this.setStatus = function(newStatus){
		status = newStatus;
	}
	this.getNormalBricks = function(){
		return normalBricks;
	}
}

/**
 * Ist der oberste Platz bei der Erzeugung eines neuen Bauteil belegt, dann wird die Methode gameOver() aufgerufen. 
 * Ist das Spiel vorbei, werden Steuerelemente, die disabled sind wieder enabled, die Musik gestoppt und das Tetris-Logo eingeblendet.
 */
function gameOver() {
	clearInterval(timer);
	gameRunning = false;
	var pauseButton = document.getElementById("pause-button");
	var startButton = document.getElementById("start-button");
	var controlSelect = document.getElementById("control-select");
	var radioSpeed = document.getElementsByName("speed");
	var audio = document.getElementById("audiofile");
	var gameOverBox = document.getElementById("game-over");
	pauseButton.disabled = true;
	pauseButton.setAttribute("class", "disabled");
	startButton.disabled = false;
	controlSelect.disabled = false;
	startButton.removeAttribute("class");
	for (var i = 0; i < radioSpeed.length; i++) 
		radioSpeed[i].disabled = false;
	audio.pause();
	audio.currentTime = 0;
	gameOverBox.style.display = "block";
	
	/* Abschließend das Tetris-Logo wieder einblenden */
	while (document.getElementsByClassName("nextBox").length > 0)
		document.getElementsByClassName("nextBox")[0].parentNode.removeChild(document.getElementsByClassName("nextBox")[0]);
		
	var tetris = document.createElement("div");
	tetris.setAttribute("id", "tetris-caption");
	tetris.innerHTML = "<span style=\"color:orange\">T</span> <span style=\"color:#aa00ff\">E</span> <span style=\"color:#5649ff\">T</span> <span style=\"color:#00d8ff\">R</span> <span style=\"color:#ff0000\">I</span> <span style=\"color:#6edd4f\">S</span>";
	document.getElementById("info-wrapper").insertBefore(tetris, document.getElementsByTagName("table")[0]);
}

/* Funktion prüft, ob ein Feld belegt ist. */
function checkCoordinates(top, left){
	var coo = (top+1) / 30 + ((left+1) / 30) * 19;
	if (coordinates[coo] == 1)
		return true;
	return false;
}

/* Koordinaten des gesetzten Teils speichern */
function setCoordinates(){
	var coo;
	for (var i = 0; i < 4; i++){
		if (i == 0)
			coo = (mainBrick.getTop()+1) / 30 + ((mainBrick.getLeft()+1) / 30) * 19;
		else coo = (mainBrick.getNormalBricks()[i-1].getTop()+1) / 30 + ((mainBrick.getNormalBricks()[i-1].getLeft()+1) / 30) * 19;
		coordinates[coo] = 1;
	}
}

/** 
 * Wird aufgerufen wenn der Status eines Bauteils geändert werden soll (es wird gedreht). 
 * Es müssen nur die normalBricks neu angeordnet werden, der mainBrick bleibt immer an der selben Stelle. 
 */
function changeStatus() {
	if (mainBrick.getTop() < 0) return;
		
	if (mainBrick.getType() == 0 && mainBrick.getTop() >= 509) return; // das Bauteil von Typ 0 darf in der vorletzen Reihe nicht mehr gedreht werden
	if (mainBrick.getTop() >= 539) return; // in der letzten Reihe darf kein Bauteil mehr gedreht werden
		
	if (mainBrick.getType() == 0 || mainBrick.getType() == 5 || mainBrick.getType() == 6){
		if (mainBrick.getStatus() == 0)
			mainBrick.setStatus(1);
		else mainBrick.setStatus(0);
	}
	else if (mainBrick.getType() == 1 || mainBrick.getType() == 2 || mainBrick.getType() == 3) {
		if (mainBrick.getStatus() < 3)
			mainBrick.setStatus(mainBrick.getStatus()+1);
		else mainBrick.setStatus(0);
	}
	else return; // type 4 (Quadrat) nicht drehen
		
	var brickPositions = positions[mainBrick.getType()][mainBrick.getStatus()];
		
	/* Zunächst prüfen ob alle Felder frei sind, bevor das Bauteil gedreht werden kann. */
	/* Zudem wird geprüft, ob das Teil */
	var free = true;
	for (var i = 0; i < 3; i++) {
		switch (brickPositions.slice(i,i+1)) {
			case "a": if (checkCoordinates(mainBrick.getTop()-30, mainBrick.getLeft()-30)) free = false; if ((mainBrick.getLeft()-30) < -1) free = false; break;
			case "b": if (checkCoordinates(mainBrick.getTop()-30, mainBrick.getLeft())) free = false; break;
			case "c": if (checkCoordinates(mainBrick.getTop()-30, mainBrick.getLeft()+30)) free = false; if ((mainBrick.getLeft()+30) > 419) free = false; break;
			case "d": if (checkCoordinates(mainBrick.getTop(), mainBrick.getLeft()-30)) free = false; if ((mainBrick.getLeft()-30) < -1) free = false; break;
			case "e": if (checkCoordinates(mainBrick.getTop(), mainBrick.getLeft()+30)) free = false; if ((mainBrick.getLeft()+30) > 419) free = false; break;
			case "f": if (checkCoordinates(mainBrick.getTop(), mainBrick.getLeft()+60)) free = false; if ((mainBrick.getLeft()+60) > 419) free = false; break;
			case "g": if (checkCoordinates(mainBrick.getTop()+30, mainBrick.getLeft()-30)) free = false; if ((mainBrick.getLeft()-30) < -1) free = false; break;
			case "h": if (checkCoordinates(mainBrick.getTop()+30, mainBrick.getLeft())) free = false; break;
			case "i": if (checkCoordinates(mainBrick.getTop()+30, mainBrick.getLeft()+30)) free = false; if ((mainBrick.getLeft()+30) > 419) free = false; break;
			case "j": if (checkCoordinates(mainBrick.getTop()+60, mainBrick.getLeft())) free = false; break;
		}
	}
		
	/* Wenn alle Felder frei sind, dann wird das Bauteil gedreht. */
	if (free) {
		for (var i = 0; i < 3; i++) {
			switch (brickPositions.slice(i,i+1)) {
				case "a": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()-30); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()-30); break;
				case "b": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()-30); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()); break;
				case "c": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()-30); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()+30); break;
				case "d": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()-30); break;
				case "e": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()+30); break;
				case "f": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()+60); break;
				case "g": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()+30); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()-30); break;
				case "h": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()+30); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()); break;
				case "i": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()+30); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()+30); break;
				case "j": mainBrick.getNormalBricks()[i].setTop(mainBrick.getTop()+60); mainBrick.getNormalBricks()[i].setLeft(mainBrick.getLeft()); break;
			}
		}
		
		/* Die 4 Boxen im HTML-Dokument verschieben. */
		var boxes = document.getElementsByClassName("box");
		for (var i = 0; i < 4; i++) {
			if (i == 0) {
				boxes[i].style.top = mainBrick.getTop() + "px";
				boxes[i].style.left = mainBrick.getLeft() + "px";
			}
			else {
				boxes[i].style.top = mainBrick.getNormalBricks()[i-1].getTop() + "px";
				boxes[i].style.left = mainBrick.getNormalBricks()[i-1].getLeft() + "px";
			}
		}
	}
	/* Ist ein benötigtes Feld belegt, dann muss der status wieder um 1 verringert werden. */
	else {
		if (mainBrick.getType() == 0 || mainBrick.getType() == 5 || mainBrick.getType() == 6){
			if (mainBrick.getStatus() == 1)
				mainBrick.setStatus(0);
			else mainBrick.setStatus(1);
		}
		else if (mainBrick.getType() == 1 || mainBrick.getType() == 2 || mainBrick.getType() == 3) {
			if (mainBrick.getStatus() > 0)
				mainBrick.setStatus(mainBrick.getStatus()-1);
			else mainBrick.setStatus(3);
		}
	}	
}

/**
 * Die Funktion wird immer aufgerufen, nachdem ein Bauteil gesetzt wurde.
 * Es wird geprüft, ob eine Reihe vollständig ist. Ist dies der Fall werden alle Boxen in dieser Reihe gelöscht.
 * Alle Reihen, die sich über der gelöschten Reihe befinden, rücken nach unten.
 */
function checkRowFull(){
	var box2 = document.getElementsByClassName("box2");
	var fullRows = [];
	for (var i = 0; i < 19; i++){
		var isFull = true;
		for(var e = 0; e < 15; e++){
			if (coordinates[i+e*19] == 0){
				isFull = false;
				break;		
			}
		}
		if (isFull){
			/* Volle Reihe im Array speichern. */
			fullRows.push(i);
			/* Die Koordinaten der vollen Reihe wieder auf 0 (frei) setzten. */
			for(var e = 0; e < 15; e++)
				coordinates[i+e*19] = 0;
		}
	}
	for (var i = 0; i < fullRows.length; i++){
	    setTimeout(function(index){
			return function(){
				for (var e = 0; e < box2.length; e++){
					if (box2[e].style.top == fullRows[index] * 30 - 1 + "px") {
						box2[e].style.display = "none";
					}				
				}
			}
		}(i), 40);	
		
		
		setTimeout(function(index){
			return function(){
				for (var e = 0; e < box2.length; e++){
					if (box2[e].style.top == fullRows[index] * 30 - 1 + "px") {
						box2[e].style.display = "block";
					}				
				}
			}
		}(i), 80);	
		
		setTimeout(function(index){
			return function(){
				for (var e = 0; e < box2.length; e++){
					if (box2[e].style.top == fullRows[index] * 30 - 1 + "px") {
						box2[e].parentNode.removeChild(box2[e]);
						e--;
					}				
				}
				/* Nachdem die Reihe gelöscht wurde, werden die Punkte gutgeschrieben. */
				lines++;
				points += 1000;
				document.getElementById("lines-count").innerHTML = lines;
				document.getElementById("points").innerHTML = points;
			}
		}(i), 120);	
	}
	
	/* Abschließend alle Reihen, die über der gelöschten liegen, nach unten bewegen. */
	if (fullRows.length > 0) {
		var changed = [];
		setTimeout(function(){
			/* Es wird für jede Zeile geprüft (0-18), ob sie nach unten geschoben werden muss. */
			for (var i = 0; i < 19; i++){
				/* Zunächst wird gezählt um wie viele Zeilen die Reihe nach unten verschoben wird. */				
				var count = 0;
				for (var e = 0; e < fullRows.length; e++) {
					if (fullRows[e] > i) 
						count++;
				}
				
				for (var e = 0; e < box2.length; e++){
					/* Wenn eine Box nach unten verschoben wurde bekommt sie das Attribut data-x, damit sie nicht nochmal verschoben wird. */
					if ((box2[e].style.top == i * 30 - 1 + "px") && (!box2[e].hasAttribute("data-x"))) {
						var boxLeft = parseInt(String(box2[e].style.left).split("p")[0]);
						var coo = i + (((boxLeft + 1) / 30) * 19);
						
						/* Wurde eine Box nach unten verschoben, überlagert sie eventuell eine andere Box, die im nächsten Schleifendurchlauf nach unten verschoben wird. */
						/* Diese nächste Box würde coordinates[coo] wieder auf 0 setzen, was allerdings nicht sein darf. */
						/* Aus diesem Grund wird im Array changed[] gespeichert, ob coordinates[coo] bereits auf 1 gesetzt worden ist oder nicht. */
						var inArray = false;
						for (var k = 0; k < changed.length; k++) {
							if (coo == changed[k])
								inArray = true;
						}
						if (!inArray) 
							coordinates[coo] = 0; 
						
						box2[e].style.top = i * 30 - 1 + count * 30 + "px";
						box2[e].setAttribute("data-x", "1");
						coordinates[coo + count] = 1;
						changed.push(coo + count);
					}
				}
			}
			/* Das Attribut data-x muss wieder entfernt werden. */
			for (var i = 0; i < box2.length; i++){
				box2[i].removeAttribute("data-x");	
			}
		}, 160);
	}
}


/**
 * Durch die Funktion wird das Bauteil nach unten bewegt. Die Funktion wird im Intervall aufgerufen. 
 * Ist das Bauteil unten angekommen oder hat ein anderes Bauteil erreicht, 
 * dann wird das Teil gesetzt und das nächste Bauteil wird erzeugt.
 */ 
function moveBricksDown(){
	
	/* Das Bauteil wird gesetzt, indem die Klasse von "box" in "box2" umbenannt wird und die Variable mainBrick überschrieben wird. */
	function setBrick(){
		while (document.getElementsByClassName("box").length > 0){
			document.getElementsByClassName("box")[0].setAttribute("class", "box2");
		}
		/* Prüfen ob eine Reihe voll ist. */
		checkRowFull();
		/* An der Stelle wird ein neues Bauteil erzeugt. */
		mainBrick = new MainBrick();
	}
	
	/* Wenn das Bauteil unten angekommen ist, wird es gesetzt.  */
	if (mainBrick.getTop() == 539 || mainBrick.getNormalBricks()[0].getTop() == 539 || mainBrick.getNormalBricks()[1].getTop() == 539 || mainBrick.getNormalBricks()[2].getTop() == 539){	
		setCoordinates();		
		setBrick();
		return;	
	}	
		
	/* Es wird geprüft, ob die nächste Stelle frei ist.
	/* Ist die Stelle nicht frei, dann wird das Bauteil gesetzt. */
	var check;
	for (var i = 0; i < 4; i++){
		if (i == 0)
			check = checkCoordinates(mainBrick.getTop() + 30, mainBrick.getLeft());
		else check = checkCoordinates(mainBrick.getNormalBricks()[i-1].getTop() + 30, mainBrick.getNormalBricks()[i-1].getLeft());
		
		if (check) {
			setCoordinates();
			setBrick();
			return;
		}
	}
	
	/* Alle Boxen um 30px nach unten bewegen. */
	mainBrick.setTop(mainBrick.getTop() + 30);
	mainBrick.getNormalBricks()[0].setTop(mainBrick.getNormalBricks()[0].getTop() + 30);
	mainBrick.getNormalBricks()[1].setTop(mainBrick.getNormalBricks()[1].getTop() + 30);
	mainBrick.getNormalBricks()[2].setTop(mainBrick.getNormalBricks()[2].getTop() + 30);
	
	var boxes = document.getElementsByClassName("box");
	for (var i = 0; i < 4; i++) {
		if (i == 0) {
			boxes[i].style.top = mainBrick.getTop() + "px";
			boxes[i].style.left = mainBrick.getLeft() + "px";
		}
		else {
			boxes[i].style.top = mainBrick.getNormalBricks()[i-1].getTop() + "px";
			boxes[i].style.left = mainBrick.getNormalBricks()[i-1].getLeft() + "px";
		}
	}
}

/**
 * Durch die Funktion wird das Bauteil nach links bewegt. Die Funktion wird aufgerufen, wenn der Spieler die entsprechende Taste drückt.
 * Ist das Bauteil ganz links angekommen oder grenzt an ein anderes Bauteil, dann wird es nicht weiter nach links bewegt.
 */ 
function moveBricksLeft() {
	/* Abbrechen, wenn sich das Bauteil bereits ganz links befindet. */
	if (mainBrick.getLeft() == -1 || mainBrick.getNormalBricks()[0].getLeft() == -1 || mainBrick.getNormalBricks()[1].getLeft() == -1 || mainBrick.getNormalBricks()[2].getLeft() == -1)
		return;
	
	var check;
	for (var i = 0; i < 4; i++){
		if (i == 0)
			check = checkCoordinates(mainBrick.getTop(), mainBrick.getLeft() - 30);
		else check = checkCoordinates(mainBrick.getNormalBricks()[i-1].getTop(), mainBrick.getNormalBricks()[i-1].getLeft() - 30);
		
		if (check) return; // wenn besetzt ist
	}	
	
	/* Alle Boxen um 30px nach links bewegen. */
	mainBrick.setLeft(mainBrick.getLeft() - 30);
	mainBrick.getNormalBricks()[0].setLeft(mainBrick.getNormalBricks()[0].getLeft() - 30);
	mainBrick.getNormalBricks()[1].setLeft(mainBrick.getNormalBricks()[1].getLeft() - 30);
	mainBrick.getNormalBricks()[2].setLeft(mainBrick.getNormalBricks()[2].getLeft() - 30);
	
	var boxes = document.getElementsByClassName("box");
	for (var i = 0; i < 4; i++) {
		if (i == 0) {
			boxes[i].style.top = mainBrick.getTop() + "px";
			boxes[i].style.left = mainBrick.getLeft() + "px";
		}
		else {
			boxes[i].style.top = mainBrick.getNormalBricks()[i-1].getTop() + "px";
			boxes[i].style.left = mainBrick.getNormalBricks()[i-1].getLeft() + "px";
		}
	}
}

/**
 * Durch die Funktion wird das Bauteil nach rechts bewegt. Die Funktion wird aufgerufen, wenn der Spieler die entsprechende Taste drückt.
 * Ist das Bauteil ganz rechts angekommen oder grenzt an ein anderes Bauteil, dann wird es nicht weiter nach rechts bewegt.
 */ 
function moveBricksRight() {
	/* Abbrechen, wenn sich das Bauteil bereits ganz rechts befindet. */
	if (mainBrick.getLeft() == 419 || mainBrick.getNormalBricks()[0].getLeft() == 419 || mainBrick.getNormalBricks()[1].getLeft() == 419 || mainBrick.getNormalBricks()[2].getLeft() == 419)
		return;
	
	var check;
	for (var i = 0; i < 4; i++){
		if (i == 0)
			check = checkCoordinates(mainBrick.getTop(), mainBrick.getLeft() + 30);
		else check = checkCoordinates(mainBrick.getNormalBricks()[i-1].getTop(), mainBrick.getNormalBricks()[i-1].getLeft() + 30);
		
		if (check) return; // wenn besetzt ist
	}	
	
	/* Alle Boxen um 30px nach rechts bewegen. */
	mainBrick.setLeft(mainBrick.getLeft() + 30);
	mainBrick.getNormalBricks()[0].setLeft(mainBrick.getNormalBricks()[0].getLeft() + 30);
	mainBrick.getNormalBricks()[1].setLeft(mainBrick.getNormalBricks()[1].getLeft() + 30);
	mainBrick.getNormalBricks()[2].setLeft(mainBrick.getNormalBricks()[2].getLeft() + 30);
	
	var boxes = document.getElementsByClassName("box");
	for (var i = 0; i < 4; i++) {
		if (i == 0) {
			boxes[i].style.top = mainBrick.getTop() + "px";
			boxes[i].style.left = mainBrick.getLeft() + "px";
		}
		else {
			boxes[i].style.top = mainBrick.getNormalBricks()[i-1].getTop() + "px";
			boxes[i].style.left = mainBrick.getNormalBricks()[i-1].getLeft() + "px";
		}
	}
}
