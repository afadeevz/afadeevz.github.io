
const startTimeMS = Date.parse("2024-12-07T12:00:00.000+03:00")
const endTimeMS = Date.parse("2025-02-28T12:00:00.000+03:00")
const startCost = 340000;
const endCost = 300000;

function lerp(progress, start, end) {
    return start * (1 - progress) + end * progress;
}

function tick() {
    let now = new Date();

    let nowMS = now.getTime();

    let totalTime = endTimeMS - startTimeMS;
    let elapsedTime = nowMS - startTimeMS

    progress = elapsedTime / totalTime;

    let currentCost = lerp(progress, startCost, endCost);

    let costElement = document.getElementById("cost");
    costElement.innerHTML = currentCost.toFixed(2) + "₽"

    requestAnimationFrame(tick)
}

function main() {
    tick()
}

main()
