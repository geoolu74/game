const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const keys = [];
let text = '';
pressedEnter = false;

function keyDown(e) {
    if(e.key === 'Backspace') {
        keys.pop();
    } else if (e.key === 'Enter') {
        //text = '';
        pressedEnter = true;
    }
    if (/^[a-zåäöA-ZÅÄÖ\s\?\!\.]$/.test(e.key)) {
        keys.push(e.key);
    }
    
    console.log(e.key, e);
    text = keys.join('');
}
window.addEventListener('keydown', keyDown);

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

const stars = [];

function createStar() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.5
    };
}

for (let i = 0; i < 500; i++) {
    stars.push(createStar());
}

function drawStar(star) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
}

function updateStar(star) {
    star.y += star.speed;
    if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
    }
}

function drawText(text) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop('0', 'magenta');
    gradient.addColorStop('0.5', 'blue');
    gradient.addColorStop('1', 'red');
    ctx.fillStyle = gradient;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.font = '100px Arial';
    ctx.strokeText(text, canvas.width/2, canvas.height/2);
    ctx.fillText(text, canvas.width/2, canvas.height/2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        drawStar(star);
       //updateStar(star);
    });
    
    if(particles.length === 0) {
        drawText(text);
    }

    if(pressedEnter) {
        convertToParticles();
        pressedEnter = false;
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

        if (particle.y + particle.height > canvas.height || particle.y + particle.height < 0 || particle.x + particle.width > canvas.width || particle.x + particle.width < 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    stars.forEach(star => {
        updateStar(star);
    });
    
    requestAnimationFrame(animate);
}

animate();