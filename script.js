import { createStar, drawStar, updateStar } from './star.js';
import { individuals } from './gen.js';

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const body = document.getElementsByTagName('body')[0];
const inputField = document.getElementById('searchText');

/*const husband = document.getElementById('husband');
const wife = document.getElementById('wife');
const children = document.getElementById('children');*/

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

const keys = [];
let text = '';
//let pressedEnter = false;
let searchResult = [];

function keyDown(e) {
    if(e.key === 'Backspace') {
        keys.pop();
        if(keys.length === 0) {
            searchResult.length = 0;
        }
    } else if (e.key === 'Enter') {
        convertToParticles();
        // clear all search variables
        //inputField.value = '';
        text = '';
        keys.length = 0;
        searchResult.length = 0;
    }
    if (/^[a-zåäöA-ZÅÄÖ\s\?\!\.\-]$/.test(e.key)) {
        keys.push(e.key);
    }

    clearButtons();

    //console.log(e.key, e);
    text = keys.join('');

    if(text.length > 0) {
        
        searchResult = [...individuals.values()].filter(indi => indi.name.toLowerCase().includes(text.toLowerCase()));
    
        if(searchResult) {
            console.log('Result length: ', searchResult.length);
            let totalHeight = 100;

            for(let i = 0; i < searchResult.length && i < 10; i++) {
                const indi = searchResult[i];
                if(indi.name.includes('inn')) {console.log('Found: ', indi.name)}
                const element = addButton(indi.id, highlight(htmlify(indi.name) + `<br>&#9734; ${indi.birthDate || '?'}<br>&#9840; ${indi.deathDate || '?'}`, text), totalHeight+'px', canvas.width/2+'px');
                element.style.left = canvas.width/2-element.clientWidth/2+'px';
                totalHeight += element.clientHeight + 10;

            }
        }
    }
}
inputField.addEventListener('keydown', keyDown);
inputField.focus();

function clearButtons() {
    //let buttons = document.getElementsByTagName('BUTTON');
    let buttons = document.getElementsByTagName('DIV');
    while(buttons.length) buttons[0].parentNode.removeChild(buttons[0]);
}

function addButton(id, text, top, left) {
    //let element = document.createElement('button');
    let element = document.createElement('div');
    element.id = id;
    element.innerHTML = text;
    element.addEventListener('click', buttonClick);
    element.style.position = 'absolute';
    element.style.top = top || `${Math.random() * canvas.height}px`;
    element.style.left = left || `${Math.random() * canvas.width}px`;

    let penElement = document.createElement('span');
    penElement.innerHTML = '&#9998;';
    penElement.style.position = 'absolute';
    penElement.style.top = '0px';
    penElement.style.right = '0px';
    penElement.style.color = 'black';
    penElement.style.cursor = 'pointer';
    penElement.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        const parent = e.target.parentNode;
        console.log('Pen click: ', parent.id);
        parent.contentEditable = 'true';
        parent.removeEventListener('click', buttonClick);
    });
    element.appendChild(penElement);

    let trashElement = document.createElement('span');
    trashElement.innerHTML = '&#128465;';
    trashElement.style.position = 'absolute';
    trashElement.style.top = '0px';
    trashElement.style.right = '20px';
    trashElement.style.color = 'black';
    trashElement.style.cursor = 'pointer';
    trashElement.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        const parent = e.target.parentNode;
        console.log('Trash click: ', parent.id);
        individuals.delete(parent.id);
        parent.remove();
    });
    element.appendChild(trashElement);

    let saveElement = document.createElement('span');
    saveElement.innerHTML = '&#128190;';
    saveElement.style.position = 'absolute';
    saveElement.style.top = '0px';

    saveElement.style.right = '40px';

    saveElement.style.color = 'black';
    saveElement.style.cursor = 'pointer';
    saveElement.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        const parent = e.target.parentNode;
        console.log('Save click: ', parent.id);
        const indi = individuals.get(parent.id);
        const text = parent.innerHTML;
        const name = text.split('<br>')[0];
        const birthDate = text.split('<br>')[1].split(' ')[1];
        const deathDate = text.split('<br>')[2].split(' ')[1];
        const occupation = text.split('<br>')[3].split(' ')[1];
        const birthPlace = text.split('<br>')[1].split(' ')[2];
        const deathPlace = text.split('<br>')[2].split(' ')[2];
        console.log('Save: ', name, birthDate, deathDate, occupation, birthPlace, deathPlace);
        indi.name = name;
        indi.birthDate = birthDate;
        indi.deathDate = deathDate;
        indi.occupation = occupation;
        indi.birthPlace = birthPlace;
        indi.deathPlace = deathPlace;
        parent.contentEditable = 'false';
        parent.addEventListener('click', buttonClick);
    });
    element.appendChild(saveElement);

    let addChildrenElement = document.createElement('span');
    addChildrenElement.innerHTML = '&#128102;';
    addChildrenElement.style.position = 'absolute';
    addChildrenElement.style.top = '0px';
    addChildrenElement.style.right = '60px';
    addChildrenElement.style.color = 'black';
    addChildrenElement.style.cursor = 'pointer';
    addChildrenElement.addEventListener('click', function(e) {
        e.stopImmediatePropagation();
        const parent = e.target.parentNode;
        console.log('Add children click: ', parent.id);
        const indi = individuals.get(parent.id);
        const children = prompt('Enter children separated by comma');
        if(children) {
            const childIds = children.split(',').map(child => child.trim());
            const childObjects = childIds.map(childId => {
                const child = individuals.get(childId);
                if(child) {
                    return child;
                }
            });
            indi.fams.children = childObjects;
            console.log('Children added: ', indi.fams.children);
        }
    });
    element.appendChild(addChildrenElement);



    body.appendChild(element);

    return element;
    
}

function buttonClick(e) {
    const id = e.target.id;
    e.target.style.backgroundColor = 'yellow';
    const indi = individuals.get(id);
    console.log('Button click: ', indi.name);
    
    clearButtons();
   
    let totalHeight = 100;
    let childWidth = 0;

    const famc = indi.famc
    if(famc) {
        let husbandElement = null
        let husbandElementWidth = 0
        let husbandElementHeight = 0
        let wifeElement = null
        let wifeElementWidth = 0
        let wifeElementHeight = 0
        let childElement = null
        /*let childElementWidth = 0
        let childElementHeight = 0*/

        
        console.log('Result famc: ', famc);
        if(famc.husband) {
            husbandElement = addButton(famc.husband.id, getIndividualText(famc.husband), totalHeight+'px', canvas.width/2+'px');

            husbandElementWidth = husbandElement.clientWidth;
            husbandElementHeight = husbandElement.clientHeight;
            husbandElement.style.backgroundColor = 'lightblue';
            husbandElement.style.left = canvas.width/2-husbandElementWidth+'px';
        }
        if(famc.wife) {
            wifeElement = addButton(famc.wife.id, getIndividualText(famc.wife), totalHeight+'px', canvas.width/2+10+'px');

            wifeElementWidth = wifeElement.clientWidth;
            wifeElementHeight = wifeElement.clientHeight;
            wifeElement.style.backgroundColor = 'lightpink';
        }
        
        totalHeight += Math.max(husbandElementHeight, wifeElementHeight) + 10;
        
        famc.children?.forEach(child => {

            console.log('Result child: ', child);
            if(child.id === id) { // selected individual
                
                console.log('Selected child: ', child.name);

                const fams = indi.fams
                console.log('Result fams: ', fams);
                if(fams) {
                    console.log('Result fams: ', fams.husband.name, fams.wife.name);

                    let selectedHusbandElement = null
                    let selectedHusbandElementWidth = 0
                    let selectedHusbandElementHeight = 0
                    let selectedWifeElement = null
                    let selectedWifeElementWidth = 0
                    let selectedWifeElementHeight = 0

                    if(fams.husband) {
                        if(fams.husband.id === id) {
                            selectedHusbandElement = addButton(fams.husband.id, getIndividualText(fams.husband), totalHeight+'px', canvas.width/2-husbandElementWidth+'px');

                            selectedHusbandElementHeight = selectedHusbandElement.clientHeight;
                            selectedHusbandElement.style.backgroundColor = 'lightgreen';
                        } else {
                            selectedHusbandElement = addButton(fams.husband.id, getIndividualText(fams.husband), totalHeight+'px', canvas.width/2-husbandElementWidth+'px');
                            selectedHusbandElementHeight = selectedHusbandElement.clientHeight;
                            selectedHusbandElement.style.backgroundColor = fams.husband.sex === 'M' ? 'lightblue' : 'lightpink';
                        }
                    }
                    if(fams.wife) {
                        if(fams.wife.id === id) {
                            selectedWifeElement = addButton(fams.wife.id, getIndividualText(fams.wife), totalHeight+'px', canvas.width/2+10+'px');

                            selectedWifeElementWidth = selectedWifeElement.clientWidth;
                            selectedWifeElement.style.backgroundColor = 'lightgreen';
                        } else {
                            selectedWifeElement = addButton(fams.wife.id, getIndividualText(fams.wife), totalHeight+'px', canvas.width/2+10+'px');
                            selectedWifeElementWidth = selectedWifeElement.clientWidth;
                            selectedWifeElement.style.backgroundColor = fams.wife.sex === 'M' ? 'lightblue' : 'lightpink';
                        }
                    }
                    totalHeight += Math.max(selectedHusbandElementHeight, selectedWifeElementHeight) + 10;
                    fams.children?.forEach(child => {
                        childElement = addButton(child.id, getIndividualText(child), totalHeight+'px', canvas.width/2-husbandElementWidth/2+'px');
            
                        childElement.style.backgroundColor = child.sex === 'M' ? 'lightblue' : 'lightpink';
                        totalHeight += childElement.clientHeight + 10;
                    });
                } else {
                    console.log('No fams found');
                    childElement = addButton(child.id, getIndividualText(child), totalHeight+'px', canvas.width/2-husbandElementWidth/2+'px');
                    
                    childElement.style.backgroundColor = 'lightgreen';
                }

            } else {
                childElement = addButton(child.id, getIndividualText(child), totalHeight+'px', canvas.width/2-husbandElementWidth/2+'px');
                childElement.style.backgroundColor = child.sex === 'M' ? 'lightblue' : 'lightpink';
            }
            totalHeight += childElement.clientHeight + 10;
            
        })
    }
    
        
}

function htmlify(text) {
    let formattedText = text.replace('/', '<b>').replace('/', '</b>');
    let slashPos = 0;
    slashPos = formattedText.lastIndexOf('/') // check for more slash
    if(slashPos) { // one more slash
        formattedText = formattedText.substring(0, slashPos) + '</b>' + formattedText.substring(slashPos+1);
        formattedText = formattedText.replace('</b>', '/'); // replace middle slash
    }
    return formattedText;
}

function highlight(text, search) {
    const regexp = new RegExp(`${search}`, 'ig');
    return text.replace(regexp, `<b style="color: Crimson">${search}</b>`);
}

function getIndividualText(indi) {
    const formattedText = htmlify(indi.name) + `<br>${indi.occupation || ''}<br>&#9734; ${indi.birthDate || ''} <i>${indi.birthPlace || ''}</i><br>&#9840; ${indi.deathDate || '?'} <i>${indi.deathPlace || ''}</i>`;
    return formattedText
}

const mouse = {
    x: undefined,
    y: undefined,
    radius: 20000
};
function mouseMove(e) {
    mouse.x = e.x;
    mouse.y = e.y;
    //console.log(mouse.x, mouse.y);
}
window.addEventListener('mousemove', mouseMove);

const stars = [];

let particles = [];
const gap = 3;
const directions = ['up', 'down', 'left', 'right', 'up-right', 'up-left', 'down-right', 'down-left'];

function convertToParticles() {
    particles = [];
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = 0; y < canvas.height; y += gap) {
        for (let x = 0; x < canvas.width; x += gap) {
            const index = (y * canvas.width + x) * 4;
            const alpha = pixels[index + 3];
            if (alpha > 0) {
                const red = pixels[index];
                const green = pixels[index + 1];
                const blue = pixels[index + 2];

                let particle = {
                    x: x,
                    y: y,
                    red: red,
                    green: green,
                    blue: blue,
                    color: `rgb(${red}, ${green}, ${blue})`,
                    alpha: alpha,
                    width: Math.random() * 20,
                    height: Math.random() * 20,
                    direction: directions[Math.floor(Math.random() * directions.length)]
                };

                if(!checkIfParticleIsStar(particle)) {
                    if (Math.random() > 0.66) {
                        particles.push(particle);
                    }
                }
            }
        }
    }
    console.log('Number of particles: ', particles.length);
}

function checkIfParticleIsStar(particle) {
    let isStar = false

    const foundStar = stars.find(star => {
        return Math.abs(star.x - particle.x) < 3 && Math.abs(star.y - particle.y) < 3;
    });

    if(foundStar) {
        isStar = true;
    }
   
    return isStar;
}

function drawText(text, x, y, size, alignment, fillStyle, strokeStyle) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop('0', 'magenta');
    gradient.addColorStop('0.5', 'blue');
    gradient.addColorStop('1', 'red');

    ctx.beginPath();
    ctx.fillStyle = fillStyle || gradient;
    ctx.lineWidth = 3;
    ctx.strokeStyle = strokeStyle || 'white';
    ctx.font = size + 'px Arial';
    ctx.textAlign = alignment;
    ctx.textBaseline = 'middle';
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        drawStar(star, ctx);
       //updateStar(star);
    });
    
    if(particles.length === 0) {
        drawText(text, canvas.width/2, 70, 80, 'center');
        drawText(`Individuals found: ${searchResult.length}`, 150, 70, 20, 'start', 'lightgreen', 'DarkGreen');
    }

    for(let i = 0; i < particles.length; i++) {
   
        const particle = particles[i];
        
        ctx.beginPath();
        ctx.rect(particle.x, particle.y, particle.width, particle.height);
        ctx.fillStyle = `rgba(${particle.red}, ${particle.green}, ${particle.blue}, ${particle.alpha/255})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${particle.alpha/255})`;
        ctx.fill();
        ctx.stroke();
        
        
        if(particle.direction === 'up') {
            particle.y -= Math.random() * 2;
        } else if(particle.direction === 'down') {
            particle.y += Math.random() * 2;
        } else if(particle.direction === 'left') {
            particle.x -= Math.random() * 2;
        } else if(particle.direction === 'right') {
            particle.x += Math.random() * 2;
        } else if(particle.direction === 'up-right') {
            particle.x += Math.random() * 2;
            particle.y -= Math.random() * 2;
        } else if(particle.direction === 'up-left') {
            particle.x -= Math.random() * 2;
            particle.y -= Math.random() * 2;
        }   else if(particle.direction === 'down-right') {
            particle.x += Math.random() * 2;
            particle.y += Math.random() * 2;
        } else if(particle.direction === 'down-left') {
            particle.x -= Math.random() * 2;
            particle.y += Math.random() * 2;
        }

        particle.alpha -= 1.5;

        if (particle.y + particle.height > canvas.height || particle.y + particle.height < 0 || particle.x + particle.width > canvas.width || particle.x + particle.width < 0 || particle.alpha < 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    stars.forEach(star => {
        updateStar(star, canvas);
    });
    
    requestAnimationFrame(animate);
}

function main() {
    console.log('Main function');
    resizeCanvas();
    console.log('Canvas width: ', canvas.width);

    for (let i = 0; i < 500; i++) {
        stars.push(createStar(canvas));
    }

    animate();

    console.log('Number of individuals', individuals.size)
}

main();