const info = {
    "mercury": {
        "distance": "31 404 428",
        "length": "88",
        "size": "2.6x smaller than Earth",
        "type": "Terrestrial"
    },
    "venus": {
        "distance": "66 904 186",
        "length": "225",
        "size": "1.1x smaller than Earth",
        "type": "Terrestrial"
    },
    "earth": {
        "distance": "91 943 427",
        "length": "365",
        "size": "it's Earth ",
        "type": "Terrestrial"
    },
    "mars": {
        "distance": "141 795 342",
        "length": "687",
        "size": "1.9x smaller than Earth",
        "type": "Terrestrial"
    },
    "jupiter": {
        "distance": "484 143 841",
        "length": "4333",
        "size": "11.0x larger than Earth",
        "type": "Gas Giant"
    },
    "saturn": {
        "distance": "932 237 339",
        "length": "10 759",
        "size": "9.1x larger than Earth",
        "type": "Gas Giant"
    },
    "uranus": {
        "distance": "1 885 918 176",
        "length": "30 687",
        "size": "4.0x larger than Earth",
        "type": "Ice Giant"
    },
    "neptune": {
        "distance": "2 782 356 748",
        "length": "60 190",
        "size": "3.9x larger than Earth",
        "type": "Ice Giant"
    },

}

function onShowInfo(planet) {
    let aHeaderId = ["header-distance", "header-length", "header-size", "header-type"];
    let aHeaderText = ["Distance from sun (km)", "Length of year (days)", "Size", "Planet type"];
    let aHeaderTextDefault = ["Planets|Dwarf Planets", "Moons", "Asteroids", "Comets"];
    let aInfoId = ["distance", "length", "size", "type"];
    let aDefaultInfo = ["8|5", "200+", "934 254", "3 610"];

    if (planet == null) {
        for (let i = 0; i < aHeaderId.length; i++) {
            document.getElementById(aHeaderId[i]).innerHTML = aHeaderTextDefault[i];
            document.getElementById(aInfoId[i]).innerHTML = aDefaultInfo[i];
        }
    } else {
        for (let i = 0; i < aHeaderId.length; i++) {
            document.getElementById(aHeaderId[i]).innerHTML = aHeaderText[i];
        }
        document.getElementById(aInfoId[0]).innerHTML = info[planet].distance;
        document.getElementById(aInfoId[1]).innerHTML = info[planet].length;
        document.getElementById(aInfoId[2]).innerHTML = info[planet].size;
        document.getElementById(aInfoId[3]).innerHTML = info[planet].type;
    }

    onHighlightPlanet(planet);
}

function onHighlightPlanet(planet) {
    if (planet == null) return;
}

function onInit() {
    onShowInfo(null);
}

function up() {
    window.scrollTo({ top: 0, behavior: 'auto' });
}