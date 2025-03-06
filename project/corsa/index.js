
const startTimeMS = Date.parse("2025-03-06T16:00:00.000+03:00")
const baseCost = 330000;
const periodMS = 30 * 24 * 60 * 60 * 1000; // 1 Month
const discountPerPeriod = 0.03 // 3%

function tick() {
    let now = new Date();

    let nowMS = now.getTime();

    let elapsedTime = nowMS - startTimeMS
    let elapsedPeriods = elapsedTime / periodMS;

    let currentCost = baseCost * Math.pow(1 - discountPerPeriod, elapsedPeriods);

    let costElement = document.getElementById("cost");
    costElement.innerHTML = currentCost.toFixed(2) + "₽"

    requestAnimationFrame(tick)
}

function main() {
    tick()
}

main()
