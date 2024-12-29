function createStar(canvas) {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.5
    };
}

function drawStar(star, ctx) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
}

function updateStar(star, canvas) {
    star.y += star.speed;
    if (star.y > canvas.height) {
        star.y = 0;
        star.x = Math.random() * canvas.width;
    }
}

export { createStar, drawStar, updateStar };