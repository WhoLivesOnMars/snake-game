//------------- Fonctions utiles -------------

// Fonction générant des nombres pseudo-aléatoires entiers
// entre 0 et max (max non compris)
function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

// Fonction générant une couleur aléatoire
function getRandomColor() {
	const red = getRandomInt(256);
	const blue = getRandomInt(256);
	const green = getRandomInt(256);
	return "rgb(" + red + "," + green + "," + blue + ")";
}

export { getRandomInt, getRandomColor };
